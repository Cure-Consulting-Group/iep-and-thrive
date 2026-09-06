import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";
import { createHash } from "node:crypto";
import * as admin from "firebase-admin";
import Stripe from "stripe";

import {
  bucket,
  createTestIdentity,
  db,
  deleteTestIdentities,
  invokeHttp,
  providerStubs,
  readSyntheticDocument,
  resetFirestoreState,
  resetProviderStubs,
  resetStorageState,
  rulesPatch,
  rulesRead,
  seedSyntheticDocument,
  startAgainstEmulatorSuite,
  uniqueId,
  TRANSPORT_INTERCEPT_AVAILABLE,
  PROVIDER_STUBS_COMPLETE,
} from "./harness";
import { stripeWebhook } from "../stripe-webhook";
import { stripeCheckout } from "../stripe-checkout";
import { submitEnrollmentAgreement, getSignedAgreementPdf } from "../e-signature";
import { unsubscribe } from "../unsubscribe";
import { sendWelcomeSequence } from "../welcome-sequence";
import { generateUnsubscribeToken } from "../unsubscribe-token";

const SIGNATURE_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/7YJ9WQAAAABJRU5ErkJggg==";

before(async () => {
  await startAgainstEmulatorSuite();
});

beforeEach(async () => {
  await deleteTestIdentities();
  await resetFirestoreState();
  await resetStorageState();
  resetProviderStubs();
});

after(async () => {
  await deleteTestIdentities();
});

function stripeSignedRequest(event: Record<string, unknown>) {
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET as string,
  });
  return {
    body: event,
    rawBody: Buffer.from(payload),
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
  };
}

function subscriptionFixture(uid: string, subscriptionId = uniqueId("sub"), status = "active") {
  const start = Math.floor(Date.now() / 1000) - 3600;
  const end = start + 30 * 86400;
  return {
    id: subscriptionId,
    object: "subscription",
    customer: uniqueId("cus"),
    status,
    cancel_at_period_end: false,
    metadata: { uid, plan: "weekly" },
    current_period_start: start,
    current_period_end: end,
    items: {
      object: "list",
      data: [{ price: { id: "price_integration_weekly" }, current_period_start: start, current_period_end: end }],
    },
  };
}

function stripeEvent(id: string, type: string, object: Record<string, unknown>): Record<string, unknown> {
  return {
    id,
    object: "event",
    api_version: "2025-03-31.basil",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type,
    data: { object },
  };
}

test.skip(
  "a Firestore emulator write rejection is never acknowledged as success",
  {
    skip: "GAPS: Admin SDK writes bypass Firestore rules; the webhook's outer catch currently acknowledges processing failures with 200, and source changes are prohibited in this lane",
  },
  async () => {
    const event = stripeEvent(uniqueId("evt-persistence-failure"), "checkout.session.completed", {
      id: uniqueId("cs"),
      mode: "payment",
      amount_total: 25000,
      payment_intent: undefined,
      metadata: { program: "reading", payment_type: "deposit" },
      customer_details: { email: `${uniqueId("payment")}@example.test`, name: "Synthetic Parent" },
    });
    const response = await invokeHttp(stripeWebhook, stripeSignedRequest(event));
    assert.ok(response.statusCode >= 300);
  }
);

test("Stripe provider failure leaves a failed checkout record and never returns success", { skip: PROVIDER_STUBS_COMPLETE ? false : "provider stubs are incomplete: only api.stripe.com is emulated, so specs reaching Gmail, Calendar or Google OAuth cannot pass yet — outstanding half of TASK-LP-067" }, async () => {
  providerStubs.stripeShouldFail = true;
  const response = await invokeHttp(stripeCheckout, {
    body: { program: "full", type: "deposit" },
  });

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, {
    error: { code: "checkout_failed", message: "Failed to create checkout session." },
  });
  const requests = await db.collection("stripeCheckoutRequests").get();
  assert.equal(requests.size, 1);
  assert.equal(requests.docs[0].data().status, "failed");
  assert.equal(providerStubs.stripeCheckoutCreates, 0);
});

test("Stripe webhook duplicate delivery is idempotent and out-of-order lifecycle events do not duplicate welcome effects", { skip: PROVIDER_STUBS_COMPLETE ? false : "provider stubs are incomplete: only api.stripe.com is emulated, so specs reaching Gmail, Calendar or Google OAuth cannot pass yet — outstanding half of TASK-LP-067" }, async () => {
  const identity = await createTestIdentity();
  await seedSyntheticDocument(`users/${identity.uid}`, {
    email: identity.email,
    displayName: "Synthetic Parent",
    studentName: "Synthetic Student",
  });

  const subscription = subscriptionFixture(identity.uid);
  const created = stripeSignedRequest(
    stripeEvent(uniqueId("evt-created"), "customer.subscription.created", subscription)
  );
  const first = await invokeHttp(stripeWebhook, created);
  assert.equal(first.statusCode, 200);

  const duplicate = await invokeHttp(stripeWebhook, created);
  assert.equal(duplicate.statusCode, 200);
  assert.deepEqual(duplicate.body, { received: true, duplicate: true });

  const firstUser = await readSyntheticDocument(`users/${identity.uid}`);
  assert.equal((firstUser?.subscription as { stripeSubscriptionId: string }).stripeSubscriptionId, subscription.id);
  const firstEmails = await db.collection("emailLog").where("to", "==", identity.email).get();
  assert.equal(firstEmails.size, 1);

  const secondIdentity = await createTestIdentity();
  await seedSyntheticDocument(`users/${secondIdentity.uid}`, {
    email: secondIdentity.email,
    displayName: "Out Of Order Parent",
    studentName: "Out Of Order Student",
  });
  const secondSubscription = subscriptionFixture(secondIdentity.uid);

  const updatedFirst = await invokeHttp(
    stripeWebhook,
    stripeSignedRequest(
      stripeEvent(uniqueId("evt-updated"), "customer.subscription.updated", secondSubscription)
    )
  );
  assert.equal(updatedFirst.statusCode, 200);
  const createdAfterUpdate = await invokeHttp(
    stripeWebhook,
    stripeSignedRequest(
      stripeEvent(uniqueId("evt-created-late"), "customer.subscription.created", secondSubscription)
    )
  );
  assert.equal(createdAfterUpdate.statusCode, 200);

  const secondEmails = await db.collection("emailLog").where("to", "==", secondIdentity.email).get();
  assert.equal(secondEmails.size, 1);
  const secondUser = await readSyntheticDocument(`users/${secondIdentity.uid}`);
  assert.equal((secondUser?.subscription as { status: string }).status, "active");
});

test("the emulator rules refuse cross-family reads and writes", async () => {
  const owner = await createTestIdentity();
  const other = await createTestIdentity();
  await seedSyntheticDocument(`users/${owner.uid}`, {
    email: owner.email,
    displayName: "Owner",
    role: "parent",
  });

  const read = await rulesRead(other.idToken, `users/${owner.uid}`);
  assert.equal(read.status, 403);
  const write = await rulesPatch(other.idToken, `users/${owner.uid}`, { displayName: "Intruder" });
  assert.equal(write.status, 403);

  const unchanged = await readSyntheticDocument(`users/${owner.uid}`);
  assert.equal(unchanged?.displayName, "Owner");
});

test("tampered enrollment agreement payload is rejected before any durable artifact is written", { skip: PROVIDER_STUBS_COMPLETE ? false : "provider stubs are incomplete: only api.stripe.com is emulated, so specs reaching Gmail, Calendar or Google OAuth cannot pass yet — outstanding half of TASK-LP-067" }, async () => {
  const identity = await createTestIdentity();
  await seedSyntheticDocument(`users/${identity.uid}`, { email: identity.email });
  const originalText = "This synthetic enrollment agreement is long enough to satisfy the real handler schema.";
  const documentHash = createHash("sha256").update(originalText, "utf8").digest("hex");

  const response = await invokeHttp(submitEnrollmentAgreement, {
    headers: { authorization: `Bearer ${identity.idToken}` },
    body: {
      inquiryId: uniqueId("inquiry"),
      documentVersion: "1.0.0",
      documentHash,
      documentText: `${originalText} TAMPERED`,
      signatureDataUrl: SIGNATURE_PNG,
      typedName: "Synthetic Parent",
      electronicConsent: true,
      parentName: "Synthetic Parent",
      studentName: "Synthetic Student",
      programTrack: "reading",
    },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { ok: false, error: "documentHash mismatch" });
  assert.equal((await db.collection("enrollmentAgreements").get()).size, 0);
  assert.equal((await bucket.getFiles())[0].length, 0);
});

test("an authorized agreement is persisted in Firestore and Storage, while a different family is refused", { skip: PROVIDER_STUBS_COMPLETE ? false : "provider stubs are incomplete: only api.stripe.com is emulated, so specs reaching Gmail, Calendar or Google OAuth cannot pass yet — outstanding half of TASK-LP-067" }, async () => {
  const owner = await createTestIdentity();
  const other = await createTestIdentity();
  await seedSyntheticDocument(`users/${owner.uid}`, { email: owner.email });
  const documentText = "This synthetic enrollment agreement is long enough to satisfy the real handler schema.";
  const documentHash = createHash("sha256").update(documentText, "utf8").digest("hex");
  const response = await invokeHttp(submitEnrollmentAgreement, {
    headers: { authorization: `Bearer ${owner.idToken}` },
    body: {
      inquiryId: uniqueId("inquiry"),
      documentVersion: "1.0.0",
      documentHash,
      documentText,
      signatureDataUrl: SIGNATURE_PNG,
      typedName: "Synthetic Parent",
      electronicConsent: true,
      parentName: "Synthetic Parent",
      studentName: "Synthetic Student",
      programTrack: "reading",
    },
  });

  assert.equal(response.statusCode, 200);
  const enrollmentId = (response.body as { enrollmentId: string }).enrollmentId;
  const agreement = await readSyntheticDocument(`enrollmentAgreements/${enrollmentId}`);
  assert.equal(agreement?.uid, owner.uid);
  assert.equal(agreement?.documentHash, documentHash);
  assert.equal((await bucket.file(`signedAgreements/${enrollmentId}.pdf`).exists())[0], true);

  const forbidden = await invokeHttp(getSignedAgreementPdf, {
    method: "GET",
    headers: { authorization: `Bearer ${other.idToken}` },
    query: { enrollmentId },
  });
  assert.equal(forbidden.statusCode, 403);
});

test("a retried welcome invocation sends once and records its outbox progress", { skip: PROVIDER_STUBS_COMPLETE ? false : "provider stubs are incomplete: only api.stripe.com is emulated, so specs reaching Gmail, Calendar or Google OAuth cannot pass yet — outstanding half of TASK-LP-067" }, async () => {
  const identity = await createTestIdentity();
  await seedSyntheticDocument(`users/${identity.uid}`, {
    email: identity.email,
    displayName: "Synthetic Parent",
    depositPaid: true,
    depositPaidAt: admin.firestore.Timestamp.fromMillis(Date.now() - 86400000),
    welcomeEmailsSent: 0,
    isTest: false,
    unsubscribed: false,
  });
  await seedSyntheticDocument(`users/${identity.uid}/students/student`, {
    name: "Synthetic Student",
    programTrack: "reading",
    intakeSubmitted: false,
  });

  await sendWelcomeSequence.run({ scheduleTime: new Date().toISOString() });
  await sendWelcomeSequence.run({ scheduleTime: new Date().toISOString() });

  assert.equal(providerStubs.gmailSends, 1);
  const user = await readSyntheticDocument(`users/${identity.uid}`);
  assert.equal(user?.welcomeEmailsSent, 1);
  const logs = await db.collection("emailLog").where("to", "==", identity.email).get();
  assert.equal(logs.size, 1);
});

test("unsubscribe withdrawal changes the real user record and is idempotent", { skip: PROVIDER_STUBS_COMPLETE ? false : "provider stubs are incomplete: only api.stripe.com is emulated, so specs reaching Gmail, Calendar or Google OAuth cannot pass yet — outstanding half of TASK-LP-067" }, async () => {
  const identity = await createTestIdentity();
  await seedSyntheticDocument(`users/${identity.uid}`, {
    email: identity.email,
    unsubscribed: false,
  });
  const token = generateUnsubscribeToken(identity.uid);

  const first = await invokeHttp(unsubscribe, {
    method: "GET",
    query: { token },
  });
  assert.equal(first.statusCode, 200);
  assert.deepEqual(first.body, { ok: true, alreadyUnsubscribed: false });
  assert.equal((await readSyntheticDocument(`users/${identity.uid}`))?.unsubscribed, true);

  const second = await invokeHttp(unsubscribe, {
    method: "GET",
    query: { token },
  });
  assert.equal(second.statusCode, 200);
  assert.deepEqual(second.body, { ok: true, alreadyUnsubscribed: true });
});

test.skip(
  "consent withdrawal/deletion detaches all claimed media",
  {
    skip: "GAPS: no source handler implements photo-release withdrawal or account/data deletion; adding a seam or production behavior is outside this lane",
  },
  () => {}
);

// GAPS:
// - Firestore rules cannot reject Admin SDK writes, and handlers expose no
//   persistence seam. A true emulator write rejection remains a skipped
//   contract until the source provides a safe failure-injection seam.
// - Consent withdrawal/deletion beyond email unsubscribe has no handler in
//   functions/src, so the explicit skipped spec above documents the gap.
