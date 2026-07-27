import "client-only";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, Auth } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

const useFirebaseEmulators =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const emulatorHost =
  process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1";

// Track emulator connection status
let firestoreEmulatorConnected = false;
let authEmulatorConnected = false;

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
    // Connect to emulator in development
    if (
      typeof window !== "undefined" &&
      useFirebaseEmulators &&
      !firestoreEmulatorConnected
    ) {
      connectFirestoreEmulator(db, emulatorHost, 8081);
      firestoreEmulatorConnected = true;
    }
  }
  return db;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    // Connect to emulator in development
    if (
      typeof window !== "undefined" &&
      useFirebaseEmulators &&
      !authEmulatorConnected
    ) {
      connectAuthEmulator(auth, `http://${emulatorHost}:9099`, {
        disableWarnings: true,
      });
      authEmulatorConnected = true;
    }
  }
  return auth;
}

function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
  }
  return googleProvider;
}

export { getFirebaseApp, getFirestoreDb, getFirebaseAuth, getGoogleProvider };
