// Synthetic data only. Requires loopback Firestore and Storage emulators.
const { before, after, test } = require('node:test');
const { readFileSync } = require('node:fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
let env;
const profile = { email: 'synthetic@example.test', displayName: 'Synthetic', phone: '', role: 'parent', createdAt: new Date() };
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-iep-security',
    firestore: { host: '127.0.0.1', port: 39188, rules: readFileSync('firestore.rules', 'utf8') },
    storage: { host: '127.0.0.1', port: 39299, rules: readFileSync('storage.rules', 'utf8') },
  });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    await context.firestore().doc('users/parent-a').set({ ...profile, stripeCustomerId: 'cus_synthetic_a', subscription: { status: 'canceled', sessionsUsedThisCycle: 4 } });
    await context.firestore().doc('users/parent-b').set(profile);
    await context.storage().ref('signedAgreements/synthetic.pdf').putString('SYNTHETIC PDF');
    await context.storage().ref('reports/parent-a/synthetic.pdf').putString('SYNTHETIC REPORT');
  });
});
after(async () => { if (env) await env.cleanup(); });
test('parent can initialize a basic profile and edit contact/preferences', async () => {
  const db = env.authenticatedContext('new-parent').firestore();
  await assertSucceeds(db.doc('users/new-parent').set(profile));
  await assertSucceeds(db.doc('users/new-parent').update({ displayName: 'Updated', phone: '555-0100', emailNotifications: false, updatedAt: new Date(), unsubscribed: true, unsubscribedAt: new Date() }));
});
for (const [field, value] of Object.entries({ stripeCustomerId: 'cus_synthetic_b', role: 'admin', subscription: { status: 'active' }, 'subscription.sessionsUsedThisCycle': -100, isTest: true, unknownPrivilege: true })) {
  test(`parent cannot update protected field ${field}`, async () => {
    await assertFails(env.authenticatedContext('parent-a').firestore().doc('users/parent-a').update({ [field]: value }));
  });
}
for (const [field, value] of Object.entries({ role: 'admin', stripeCustomerId: 'cus_synthetic_b', subscription: { status: 'active' }, isTest: true })) {
  test(`signup cannot inject protected field ${field}`, async () => {
    const uid = `injection-${field}`;
    await assertFails(env.authenticatedContext(uid).firestore().doc(`users/${uid}`).set({ ...profile, [field]: value }));
  });
}
test('replacement cannot delete existing server-owned fields', async () => {
  await assertFails(env.authenticatedContext('parent-a').firestore().doc('users/parent-a').set(profile));
});
test('cross-family and anonymous profile access are denied', async () => {
  await assertFails(env.authenticatedContext('parent-a').firestore().doc('users/parent-b').get());
  await assertFails(env.authenticatedContext('parent-a').firestore().doc('users/parent-b').update({ displayName: 'Forged' }));
  await assertFails(env.unauthenticatedContext().firestore().doc('users/parent-a').get());
});
test('token admin can maintain server fields', async () => {
  await assertSucceeds(env.authenticatedContext('staff', { admin: true }).firestore().doc('users/parent-a').update({ stripeCustomerId: 'cus_synthetic_verified', role: 'admin' }));
});
test('persisted admin role grants no cross-family access', async () => {
  await assertFails(env.authenticatedContext('parent-a').firestore().doc('users/parent-b').get());
});
test('signed PDFs deny direct access to parents, unauthenticated clients, and admins', async () => {
  for (const context of [env.authenticatedContext('parent-a'), env.authenticatedContext('parent-b'), env.unauthenticatedContext(), env.authenticatedContext('staff', { admin: true })]) {
    await assertFails(context.storage().ref('signedAgreements/synthetic.pdf').getDownloadURL());
    await assertFails(context.storage().ref('signedAgreements/synthetic.pdf').putString('FORGED'));
  }
});
test('owner report access remains available and cross-family reads stay denied', async () => {
  await assertSucceeds(env.authenticatedContext('parent-a').storage().ref('reports/parent-a/synthetic.pdf').getDownloadURL());
  await assertFails(env.authenticatedContext('parent-b').storage().ref('reports/parent-a/synthetic.pdf').getDownloadURL());
});

// Server-only collections are written through the Admin SDK.
// These assert no client — parent, admin, or anonymous — can reach them. The
// quarantine collection is the sharpest case: it holds snapshots of records the
// migration could not interpret, so it may contain personal data in an
// unexpected shape. A client able to write emailLedger or the webhook
// collections could suppress a real send or replay a billing effect.
for (const collection of ['webhookEventLog', 'webhookOutbox', 'stripeBillingEffects', 'emailLedger', '_schedulerCursors', '_migrations', '_migrationQuarantine', 'availableSlots', 'bookings']) {
  test(`server-only collection ${collection} is closed to every client`, async () => {
    const contexts = [
      ['parent', env.authenticatedContext('parent-a')],
      ['admin', env.authenticatedContext('admin-a', { admin: true })],
      ['anonymous', env.unauthenticatedContext()],
    ];
    for (const [, ctx] of contexts) {
      const ref = ctx.firestore().doc(`${collection}/probe`);
      await assertFails(ref.get());
      await assertFails(ref.set({ tampered: true }));
    }
  });
}
