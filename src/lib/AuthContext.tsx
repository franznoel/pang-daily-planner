"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "./firebase";
import { ensureUserDocument } from "./dailyPlannerService";

const AUTH_MODE_STORAGE_KEY = "pang-firebase-auth-mode";
const firebaseAuthMode =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"
    ? "emulator"
    : "cloud";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const signInPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const initializeAuth = async () => {
      const previousAuthMode = window.localStorage.getItem(
        AUTH_MODE_STORAGE_KEY
      );

      // Firebase persists emulator and cloud sessions under the same app key.
      // Clear the cached session once when switching modes so an emulator
      // refresh token is never sent to the cloud token service (or vice versa).
      if (previousAuthMode !== firebaseAuthMode) {
        await auth.authStateReady();
        if (auth.currentUser) {
          await signOut(auth);
        }
        window.localStorage.setItem(AUTH_MODE_STORAGE_KEY, firebaseAuthMode);
      }

      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);

        // Ensure user document exists when user logs in
        if (user) {
          try {
            await ensureUserDocument(user.uid, user.email, user.displayName);
          } catch (error) {
            console.error("Error ensuring user document:", error);
          }
        }

        setLoading(false);
      });
    };

    initializeAuth().catch((error) => {
      console.error("Error initializing authentication:", error);
      if (!cancelled) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (signInPromiseRef.current) {
      return signInPromiseRef.current;
    }

    const auth = getFirebaseAuth();
    const googleProvider = getGoogleProvider();

    signInPromiseRef.current = signInWithPopup(auth, googleProvider)
      .then(() => undefined)
      .catch((error: unknown) => {
        const errorCode =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof error.code === "string"
            ? error.code
            : null;

        // Firebase reports this when another popup request replaces the first
        // or when the popup flow is otherwise cancelled. It is not actionable.
        if (errorCode === "auth/cancelled-popup-request") {
          return;
        }

        console.error("Error signing in with Google:", error);
        throw error;
      })
      .finally(() => {
        signInPromiseRef.current = null;
      });

    return signInPromiseRef.current;
  };

  const logout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
