import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { firebaseConfig } from "./firebase-config";

const useFirebaseEmulators =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const emulatorHost =
  process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1";

if (process.env.APP_ENV !== "production" && useFirebaseEmulators) {
  process.env.FIRESTORE_EMULATOR_HOST ||= `${emulatorHost}:8081`;
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= `${emulatorHost}:9099`;
}

// Initialize Firebase Admin SDK (singleton pattern)
function initializeFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Use the shared firebaseConfig for consistency with client-side
  const config: admin.AppOptions = {
    projectId: firebaseConfig.projectId,
  };

  // Add storage bucket if available
  if (firebaseConfig.storageBucket) {
    config.storageBucket = firebaseConfig.storageBucket;
  }

  // In production, Firebase Admin SDK uses Application Default Credentials (ADC)
  // This works automatically in Firebase Functions, Cloud Run, etc.
  // In development, it works with emulators without credentials
  return admin.initializeApp(config);
}

export const adminApp = initializeFirebaseAdmin();

// Get Firestore with default database
// Use (default) database to match client-side Firebase
export const adminDb = admin.firestore();

export const adminAuth = admin.auth();
