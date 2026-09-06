import assert from "node:assert/strict";
import test from "node:test";
import * as admin from "firebase-admin";
import {
  acquireWebhookEvent,
  PermanentWebhookError,
  runWebhookEvent,
} from "../webhook-state";

type Data = Record<string, unknown>;

class MemoryDocumentReference {
  readonly path: string;
  readonly id: string;

  constructor(
    readonly collectionName: string,
    id: string
  ) {
    this.id = id;
    this.path = `${collectionName}/${id}`;
  }
}

class MemorySnapshot {
  constructor(
    readonly ref: MemoryDocumentReference,
    private readonly value: Data | undefined
  ) {}

  get exists(): boolean {
    return this.value !== undefined;
  }

  data(): Data | undefined {
    return this.value;
  }
}

class MemoryTransaction {
  readonly writes: Array<{
    operation: "create" | "update";
    ref: MemoryDocumentReference;
    data: Data;
  }> = [];

  constructor(private readonly db: MemoryFirestore) {}

  async get(ref: MemoryDocumentReference): Promise<MemorySnapshot> {
    return this.db.snapshot(ref);
  }

  create(ref: MemoryDocumentReference, data: Data): void {
    this.writes.push({ operation: "create", ref, data });
  }

  update(ref: MemoryDocumentReference, data: Data): void {
    this.writes.push({ operation: "update", ref, data });
  }
}

class MemoryFirestore {
  private readonly documents = new Map<string, Data>();
  private transactionTail: Promise<void> = Promise.resolve();

  collection(name: string): { doc: (id: string) => MemoryDocumentReference } {
    return { doc: (id: string) => new MemoryDocumentReference(name, id) };
  }

  snapshot(ref: MemoryDocumentReference): MemorySnapshot {
    return new MemorySnapshot(ref, this.documents.get(ref.path));
  }

  read(collection: string, id: string): Data | undefined {
    return this.documents.get(`${collection}/${id}`);
  }

  async runTransaction<T>(
    callback: (transaction: MemoryTransaction) => Promise<T>
  ): Promise<T> {
    let release!: () => void;
    const previous = this.transactionTail;
    this.transactionTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;

    const transaction = new MemoryTransaction(this);
    try {
      const result = await callback(transaction);
      for (const write of transaction.writes) {
        if (write.operation === "create") {
          if (this.documents.has(write.ref.path)) {
            throw Object.assign(new Error("Already exists"), { code: 6 });
          }
          this.documents.set(write.ref.path, { ...write.data });
        } else {
          const existing = this.documents.get(write.ref.path);
          if (!existing) throw new Error(`Missing document: ${write.ref.path}`);
          Object.assign(existing, write.data);
        }
      }
      return result;
    } finally {
      release();
    }
  }
}

function event(id = "evt_test_1"): { id: string; type: string } {
  return { id, type: "invoice.paid" };
}

function clock() {
  let millis = 1_000_000;
  return {
    now: () => admin.firestore.Timestamp.fromMillis(millis),
    advance: (amount: number) => {
      millis += amount;
    },
    read: () => millis,
  };
}

test("failure after claim is retried on the next delivery", async () => {
  const db = new MemoryFirestore();
  const time = clock();
  let shouldFail = true;
  let processCalls = 0;

  const first = await runWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event(),
    async () => {
      processCalls += 1;
      if (shouldFail) throw new Error("temporary Firestore outage");
    },
    { now: time.now }
  );

  assert.equal(first.statusCode, 500);
  assert.equal(db.read("webhookEventLog", "evt_test_1")?.status, "failed");
  assert.equal(db.read("webhookEventLog", "evt_test_1")?.failureKind, "transient");

  shouldFail = false;
  const second = await runWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event(),
    async () => {
      processCalls += 1;
    },
    { now: time.now }
  );

  assert.equal(second.statusCode, 200);
  assert.equal(processCalls, 2);
  assert.equal(db.read("webhookEventLog", "evt_test_1")?.status, "succeeded");
  assert.equal(db.read("webhookEventLog", "evt_test_1")?.attempts, 2);
});

test("two concurrent deliveries produce one billing transition and one outbox effect", async () => {
  const db = new MemoryFirestore();
  const time = clock();
  let billingTransitions = 0;
  let outboxEffects = 0;
  let enteredResolve!: () => void;
  const entered = new Promise<void>((resolve) => {
    enteredResolve = resolve;
  });
  let releaseResolve!: () => void;
  const release = new Promise<void>((resolve) => {
    releaseResolve = resolve;
  });

  const deliver = () =>
    runWebhookEvent(
      db as unknown as admin.firestore.Firestore,
      event("evt_concurrent"),
      async () => {
        billingTransitions += 1;
        outboxEffects += 1;
        enteredResolve();
        await release;
      },
      { now: time.now }
    );

  const first = deliver();
  await entered;
  const second = await deliver();
  assert.equal(second.statusCode, 409);

  releaseResolve();
  assert.equal((await first).statusCode, 200);
  assert.equal(billingTransitions, 1);
  assert.equal(outboxEffects, 1);
});

test("duplicate of a succeeded event returns 200 without a second effect", async () => {
  const db = new MemoryFirestore();
  const time = clock();
  let billingTransitions = 0;
  let outboxEffects = 0;
  const process = async () => {
    billingTransitions += 1;
    outboxEffects += 1;
  };

  const first = await runWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event("evt_succeeded"),
    process,
    { now: time.now }
  );
  const second = await runWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event("evt_succeeded"),
    process,
    { now: time.now }
  );

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.deepEqual(second.body, { received: true, duplicate: true });
  assert.equal(billingTransitions, 1);
  assert.equal(outboxEffects, 1);
});

test("expired lease is reclaimable by a later delivery", async () => {
  const db = new MemoryFirestore();
  const time = clock();
  const first = await acquireWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event("evt_expired"),
    { now: time.now, leaseDurationMs: 1000 }
  );

  assert.equal(first.outcome, "acquired");
  time.advance(1001);
  const reclaimed = await acquireWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event("evt_expired"),
    { now: time.now, leaseDurationMs: 1000 }
  );

  assert.equal(reclaimed.outcome, "acquired");
  if (reclaimed.outcome === "acquired") assert.equal(reclaimed.attempts, 2);
  assert.equal(time.read(), 1_001_001);
});

test("permanently invalid event returns 200, is marked failed, and is not retried forever", async () => {
  const db = new MemoryFirestore();
  const time = clock();
  let processCalls = 0;
  const invalid = async () => {
    processCalls += 1;
    throw new PermanentWebhookError("malformed_event", "The signed event cannot be processed.");
  };

  const first = await runWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event("evt_invalid"),
    invalid,
    { now: time.now }
  );
  const second = await runWebhookEvent(
    db as unknown as admin.firestore.Firestore,
    event("evt_invalid"),
    invalid,
    { now: time.now }
  );

  assert.equal(first.statusCode, 200);
  assert.deepEqual(first.body, { received: true });
  assert.equal(second.statusCode, 200);
  assert.equal(processCalls, 1);
  assert.equal(db.read("webhookEventLog", "evt_invalid")?.status, "failed");
  assert.equal(db.read("webhookEventLog", "evt_invalid")?.failureKind, "permanent");
});
