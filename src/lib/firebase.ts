import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, Auth } from "firebase/auth";

const isDevelopment = process.env.NODE_ENV === "development";

// Demo values for development environment when using emulators
const demoConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

// Build Firebase config - in production, require env vars; in development, allow demo values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isDevelopment ? demoConfig.apiKey : ""),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isDevelopment ? demoConfig.authDomain : ""),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isDevelopment ? demoConfig.projectId : ""),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (isDevelopment ? demoConfig.storageBucket : ""),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (isDevelopment ? demoConfig.messagingSenderId : ""),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isDevelopment ? demoConfig.appId : ""),
};

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
    if (typeof window !== "undefined" && isDevelopment && !firestoreEmulatorConnected) {
      connectFirestoreEmulator(db, "localhost", 8081);
      firestoreEmulatorConnected = true;
    }
  }
  return db;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    // Connect to emulator in development
    if (typeof window !== "undefined" && isDevelopment && !authEmulatorConnected) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
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
