import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: App;

if (getApps().length === 0) {
  // In production, use Application Default Credentials or service account
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'iep-and-thrive.firebasestorage.app',
    });
  } else {
    // Falls back to Application Default Credentials (ADC)
    app = initializeApp({
      projectId: 'iep-and-thrive',
      storageBucket: 'iep-and-thrive.firebasestorage.app',
    });
  }
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
export default app;
