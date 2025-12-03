import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
let app: admin.app.App | undefined;

export function getFirebaseAdmin(): admin.app.App {
  if (!app) {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Initialize with default credentials in production (uses GOOGLE_APPLICATION_CREDENTIALS)
      // For local development, you may need to set GOOGLE_APPLICATION_CREDENTIALS
      app = admin.initializeApp();
    } else {
      app = admin.apps[0] as admin.app.App;
    }
  }
  return app;
}

export function getFirestoreAdmin(): admin.firestore.Firestore {
  const adminApp = getFirebaseAdmin();
  return adminApp.firestore();
}

export function getAuthAdmin(): admin.auth.Auth {
  const adminApp = getFirebaseAdmin();
  return adminApp.auth();
}
