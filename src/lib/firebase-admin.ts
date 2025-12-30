import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Initialize Firebase Admin SDK (singleton pattern)
function initializeFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const isDevelopment = process.env.APP_ENV !== "production";

  // Try to parse __FIREBASE_DEFAULTS__ if available (used by Firebase Functions)
  let firebaseDefaults;
  if (process.env.__FIREBASE_DEFAULTS__) {
    try {
      firebaseDefaults = JSON.parse(process.env.__FIREBASE_DEFAULTS__);
    } catch (e) {
      console.error("Failed to parse __FIREBASE_DEFAULTS__:", e);
    }
  }

  // Build config from __FIREBASE_DEFAULTS__ or environment variables
  const projectId = 
    firebaseDefaults?.projectId ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    (isDevelopment ? "demo-project" : undefined);

  const databaseURL = firebaseDefaults?.databaseURL;
  const storageBucket = firebaseDefaults?.storageBucket;

  const config: admin.AppOptions = {
    projectId,
  };

  // Add optional fields if available
  if (databaseURL) {
    config.databaseURL = databaseURL;
  }
  if (storageBucket) {
    config.storageBucket = storageBucket;
  }

  // In development with emulators or when no credentials are needed
  if (isDevelopment || firebaseDefaults) {
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
