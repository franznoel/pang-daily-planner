import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase Admin SDK (singleton pattern)
function initializeFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const isDevelopment = process.env.APP_ENV !== "production";

  // Use the shared firebaseConfig for consistency with client-side
  const config: admin.AppOptions = {
    projectId: firebaseConfig.projectId,
  };

  // Add storage bucket if available
  if (firebaseConfig.storageBucket) {
    config.storageBucket = firebaseConfig.storageBucket;
  }

  // In development with emulators or when no credentials are needed
  if (isDevelopment) {
    return admin.initializeApp(config);
  }

  // In production, Firebase Admin SDK uses Application Default Credentials (ADC)
  // This works automatically in Firebase Functions, Cloud Run, etc.
  return admin.initializeApp(config);
}

export const adminApp = initializeFirebaseAdmin();

// Get Firestore with default database
// Use (default) database to match client-side Firebase
export const adminDb = admin.firestore();

export const adminAuth = admin.auth();

// Set Firestore emulator if in development and not already set
if (process.env.APP_ENV !== "production" && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";
}
