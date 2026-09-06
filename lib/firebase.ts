import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import {
  EMULATOR_HOST,
  EMULATOR_PORTS,
  assertEnvironmentCoherent,
  resolveEnvironment,
} from './env';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Resolved once, here, and imported everywhere else. See lib/env.ts for why
// re-deriving "am I local" per module is the bug this replaces.
export const APP_ENVIRONMENT = resolveEnvironment();

assertEnvironmentCoherent(APP_ENVIRONMENT, firebaseConfig);

// Initialize Firebase (prevent duplicate initialization in dev)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect every data and side-effect service to the emulator suite together.
// Previously none of them were connected while Functions calls were rewritten
// to localhost, so local development read and wrote production Auth, Firestore
// and Storage. Partial connection is worse than none: it looks local and isn't.
if (APP_ENVIRONMENT === 'local' && typeof window !== 'undefined') {
  const g = globalThis as { __iepEmulatorsConnected?: boolean };
  // connectXEmulator throws if called twice on the same instance, and Next's
  // fast refresh re-executes this module.
  if (!g.__iepEmulatorsConnected) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
    connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
    g.__iepEmulatorsConnected = true;
  }
}

export default app;
