/**
 * Shared Firebase configuration
 * This file can be imported by both client and server code
 */

const isDevelopment = process.env.NODE_ENV !== "production";

// Demo values for development environment when using emulators
const demoConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "",
};

// Build Firebase config - in production, require env vars; in development, allow demo values
// Environment variables can be set in .env.local file
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isDevelopment ? demoConfig.apiKey : ""),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isDevelopment ? demoConfig.authDomain : ""),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isDevelopment ? demoConfig.projectId : ""),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (isDevelopment ? demoConfig.storageBucket : ""),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (isDevelopment ? demoConfig.messagingSenderId : ""),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isDevelopment ? demoConfig.appId : ""),
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID || (isDevelopment ? demoConfig.measurementId : ""),
};
