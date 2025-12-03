import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Initialize Firebase Admin SDK (singleton pattern)
function initializeFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // In development with emulators, use demo credentials
  const isDevelopment = process.env.NODE_ENV !== "production";
  
  if (isDevelopment) {
    // Use emulator with demo project
    return admin.initializeApp({
      projectId: "demo-project",
    });
  }

  // In production, Firebase Admin SDK uses Application Default Credentials (ADC)
  // This works automatically in Firebase Functions, Cloud Run, etc.
  // For local development with production, set GOOGLE_APPLICATION_CREDENTIALS
  return admin.initializeApp();
}

export const adminApp = initializeFirebaseAdmin();
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

// Set Firestore emulator if in development
if (process.env.NODE_ENV !== "production") {
  // Check if emulator host is set, otherwise use default
  const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST || "localhost:8081";
  
  // Only set if not already set
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = firestoreEmulatorHost;
  }
}
