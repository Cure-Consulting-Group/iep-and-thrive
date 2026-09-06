// Audit probes, not a passing security regression suite: several expected
// observations below deliberately demonstrate vulnerabilities at c60cc3b.
// Uses only the demo project and loopback emulators. Run from repo root.
// Install firebase + @firebase/rules-unit-testing in a temporary directory
// and set NODE_PATH to its node_modules. See ../build-audit.md.
const fs = require('node:fs');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-iep-audit',
    firestore: { host: '127.0.0.1', port: 39188, rules: fs.readFileSync('firestore.rules', 'utf8') },
    storage: { host: '127.0.0.1', port: 39299, rules: fs.readFileSync('storage.rules', 'utf8') },
  });
  const results = [];
  const probe = async (name, fn) => {
    try { results.push({ name, result: await fn() }); }
    catch (e) { results.push({ name, error: e.code || e.message }); }
  };
  try {
    await env.withSecurityRulesDisabled(async c => {
      const db = c.firestore();
      await db.doc('users/parent-a').set({ role: 'parent', stripeCustomerId: 'cus_fake_a', subscription: { status: 'canceled', sessionsUsedThisCycle: 4 } });
      await db.doc('users/parent-b/students/child-b').set({ firstName: 'Synthetic' });
      await db.doc('users/anon-old/students/default').set({ firstName: 'Synthetic' });
      await db.doc('availableSlots/slot-a').set({ isAvailable: true, bookedBy: null });
      await db.doc('attendance/record-a').set({ parentId: 'parent-a', notes: 'SYNTHETIC INSTRUCTOR-PRIVATE NOTE', parentVisibleNote: 'Public summary' });
      await c.storage().ref('signedAgreements/parent-b-agreement.pdf').putString('SYNTHETIC DOCUMENT');
    });
    const parent = env.authenticatedContext('parent-a');
    const db = parent.firestore();
    await probe('parent can overwrite server billing fields and role', async () => {
      await db.doc('users/parent-a').update({ stripeCustomerId: 'cus_fake_b', role: 'admin', 'subscription.status': 'active', 'subscription.sessionsUsedThisCycle': -100 });
      return 'ALLOWED';
    });
    await probe('ordinary parent booking slot update', async () => {
      await db.doc('availableSlots/slot-a').update({ isAvailable: false, bookedBy: 'parent-a' });
      return 'ALLOWED';
    });
    await probe('parent reads instructor-private attendance field', async () => (await db.doc('attendance/record-a').get()).data().notes);
    await probe('parent obtains other parent signed PDF download URL', async () => {
      await parent.storage().ref('signedAgreements/parent-b-agreement.pdf').getDownloadURL();
      return 'ALLOWED (URL intentionally not recorded)';
    });
    await probe('other student record stays protected despite forged profile role', async () => {
      await db.doc('users/parent-b/students/child-b').get();
      return 'ALLOWED';
    });
    await probe('new authenticated UID reads old anonymous profile for migration', async () => {
      await db.doc('users/anon-old/students/default').get();
      return 'ALLOWED';
    });
    await probe('parent forges own lesson completion and score', async () => {
      await db.doc('users/parent-a/students/default/lessons/forged').set({ isCompleted: true, score: 100, levelIndex: 999 });
      return 'ALLOWED';
    });
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await env.cleanup();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
