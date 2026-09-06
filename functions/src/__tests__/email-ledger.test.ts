import assert from "node:assert/strict";
import test from "node:test";
import {
  deliverEmailWithLedger,
  InMemoryEmailLedger,
  type EmailLedgerKey,
} from "../email-ledger";
import { sendEmail, sendEmailWithResult } from "../email-service";

const key: EmailLedgerKey = {
  template: "welcome_sequence",
  recipient: "user-1",
  program: "summer-2026",
  phase: "day-0",
};

const options = {
  to: "parent@example.com",
  subject: "Subject is intentionally not asserted",
  htmlBody: "Body is intentionally not asserted",
  classification: "lifecycle" as const,
  recipientUid: "user-1",
};

test("sendEmail returns false leaves the phase/counter unchanged and records failed", async () => {
  const ledger = new InMemoryEmailLedger();
  let phaseCounter = 0;

  const result = await deliverEmailWithLedger(
    { key, options },
    ledger,
    async (email) => sendEmail(email, {
      preferenceLookup: async () => ({ unsubscribed: false, isTest: false }),
      transport: async () => false,
    }),
  );
  if (result.ok) phaseCounter++;

  assert.equal(result.ok, false);
  assert.equal(phaseCounter, 0);
  assert.equal(result.status, "failed");
  assert.equal(result.attempts, 1);
  assert.equal(ledger.get(key)?.status, "failed");
  assert.equal(ledger.get(key)?.attempts, 1);

  const retry = await deliverEmailWithLedger(
    { key, options },
    ledger,
    async (email) => sendEmailWithResult(email, {
      preferenceLookup: async () => ({ unsubscribed: false, isTest: false }),
      transport: async () => ({ ok: true, messageId: "provider-after-retry" }),
    }),
  );
  if (retry.ok) phaseCounter++;

  assert.equal(phaseCounter, 1);
  assert.equal(retry.status, "delivered");
  assert.equal(retry.attempts, 2);
  assert.equal(ledger.get(key)?.providerMessageId, "provider-after-retry");
});

test("preference lookup throws suppresses marketing and records skipped, not delivered", async () => {
  const ledger = new InMemoryEmailLedger();
  let providerCalls = 0;

  const result = await deliverEmailWithLedger(
    {
      key: { ...key, template: "guide_drip_2", recipient: "parent@example.com", program: "summer-guide", phase: "day-2" },
      options: { ...options, classification: "marketing", recipientUid: undefined },
    },
    ledger,
    async (email) => sendEmailWithResult(email, {
      preferenceLookup: async () => {
        throw new Error("Firestore lookup failed for parent@example.com");
      },
      transport: async () => {
        providerCalls++;
        return { ok: true, messageId: "provider-should-not-be-used" };
      },
    }),
  );

  const record = ledger.get({ ...key, template: "guide_drip_2", recipient: "parent@example.com", program: "summer-guide", phase: "day-2" });
  assert.equal(result.ok, false);
  assert.equal(result.status, "skipped");
  assert.equal(record?.status, "skipped");
  assert.equal(record?.lastError, "recipient_preferences_unavailable");
  assert.equal(providerCalls, 0);
});

test("same template, recipient, program, and phase delivers only once", async () => {
  const ledger = new InMemoryEmailLedger();
  let providerCalls = 0;
  const sender = async () => {
    providerCalls++;
    return { ok: true, messageId: "provider-1" };
  };

  const first = await deliverEmailWithLedger({ key, options }, ledger, sender);
  const second = await deliverEmailWithLedger({ key, options }, ledger, sender);

  assert.equal(first.status, "delivered");
  assert.equal(second.status, "delivered");
  assert.equal(providerCalls, 1);
  assert.equal(ledger.get(key)?.attempts, 1);
  assert.equal(ledger.get(key)?.providerMessageId, "provider-1");
});

test("service template still sends when preference lookup fails", async () => {
  let providerCalls = 0;
  const result = await sendEmailWithResult(
    {
      to: "parent@example.com",
      subject: "Receipt",
      htmlBody: "Receipt body",
      classification: "service",
      recipientUid: "user-1",
    },
    {
      preferenceLookup: async () => {
        throw new Error("preference database unavailable");
      },
      transport: async () => {
        providerCalls++;
        return { ok: true, messageId: "provider-service-1" };
      },
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.status, "delivered");
  assert.equal(providerCalls, 1);
});

test("test-flagged recipient receives nothing", async () => {
  let providerCalls = 0;
  const result = await sendEmailWithResult(
    {
      to: "test@example.com",
      subject: "Lifecycle",
      htmlBody: "Lifecycle body",
      classification: "lifecycle",
      recipientUid: "test-user",
    },
    {
      preferenceLookup: async () => ({ unsubscribed: false, isTest: true }),
      transport: async () => {
        providerCalls++;
        return { ok: true, messageId: "provider-should-not-be-used" };
      },
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, "skipped");
  assert.equal(result.error, "recipient_is_test");
  assert.equal(providerCalls, 0);
});
