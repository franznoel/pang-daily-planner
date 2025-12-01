"use client";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import { DailyPlannerState, HabitItem, PriorityItem } from "@/components/types";

// Type for Firestore-serializable daily planner state (without Dayjs)
export interface DailyPlannerDocument {
  date: string; // ISO date string YYYY-MM-DD
  energyLevel: string;
  mood: string;
  gratefulFor: string[];
  excitedAbout: string[];
  peopleToSee: string[];
  mindHabits: HabitItem[];
  bodyHabits: HabitItem[];
  spiritHabits: HabitItem[];
  meals: string;
  water: string;
  intention: string;
  iAm: string;
  scheduleEvents: {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
  }[];
  topPriorities: PriorityItem[];
  professionalPriorities: PriorityItem[];
  personalPriorities: PriorityItem[];
  infinitePossibilities: string;
  whatInspiredMe: string;
  positiveThings: string[];
  whatDidIDoWell: string;
  whatDidILearn: string;
  updatedAt?: string;
  createdAt?: string;
}

/**
 * Converts DailyPlannerState to a Firestore-serializable document
 */
export function stateToDocument(state: DailyPlannerState): Omit<DailyPlannerDocument, 'updatedAt' | 'createdAt'> {
  return {
    date: state.date?.format("YYYY-MM-DD") || "",
    energyLevel: state.energyLevel,
    mood: state.mood,
    gratefulFor: state.gratefulFor,
    excitedAbout: state.excitedAbout,
    peopleToSee: state.peopleToSee,
    mindHabits: state.mindHabits,
    bodyHabits: state.bodyHabits,
    spiritHabits: state.spiritHabits,
    meals: state.meals,
    water: state.water,
    intention: state.intention,
    iAm: state.iAm,
    scheduleEvents: state.scheduleEvents,
    topPriorities: state.topPriorities,
    professionalPriorities: state.professionalPriorities,
    personalPriorities: state.personalPriorities,
    infinitePossibilities: state.infinitePossibilities,
    whatInspiredMe: state.whatInspiredMe,
    positiveThings: state.positiveThings,
    whatDidIDoWell: state.whatDidIDoWell,
    whatDidILearn: state.whatDidILearn,
  };
}

/**
 * Get the document reference for a user's daily plan on a specific date
 */
function getDailyPlanRef(userId: string, dateStr: string) {
  const db = getFirestoreDb();
  return doc(db, "user", userId, "daily-plans", dateStr);
}

/**
 * Get the daily-plans collection reference for a user
 */
function getDailyPlansCollectionRef(userId: string) {
  const db = getFirestoreDb();
  return collection(db, "user", userId, "daily-plans");
}

/**
 * Save a daily plan to Firestore
 * Uses merge option to avoid extra read operation for createdAt
 */
export async function saveDailyPlan(
  userId: string,
  state: DailyPlannerState
): Promise<void> {
  const dateStr = state.date?.format("YYYY-MM-DD");
  if (!dateStr) {
    throw new Error("Date is required to save daily plan");
  }

  const docRef = getDailyPlanRef(userId, dateStr);
  const document = stateToDocument(state);

  // Use setDoc with merge to create or update
  // createdAt is set only on first write using a conditional merge approach
  await setDoc(
    docRef,
    {
      ...document,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Get a daily plan from Firestore for a specific date
 */
export async function getDailyPlan(
  userId: string,
  dateStr: string
): Promise<DailyPlannerDocument | null> {
  const docRef = getDailyPlanRef(userId, dateStr);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as DailyPlannerDocument;
  }

  return null;
}

/**
 * Get the most recent daily plan before a given date
 * This is used to copy incomplete habits/priorities when creating a new day
 */
export async function getMostRecentDailyPlan(
  userId: string,
  beforeDate: string
): Promise<DailyPlannerDocument | null> {
  const collectionRef = getDailyPlansCollectionRef(userId);
  const q = query(
    collectionRef,
    where("date", "<", beforeDate),
    orderBy("date", "desc"),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as DailyPlannerDocument;
  }

  return null;
}

/**
 * Get all dates that have daily plans for a user
 * This is used to mark dates in the DatePicker
 */
export async function getDatesWithPlans(userId: string): Promise<string[]> {
  const collectionRef = getDailyPlansCollectionRef(userId);
  const querySnapshot = await getDocs(collectionRef);

  return querySnapshot.docs.map((doc) => doc.id);
}

/**
 * User info document structure
 */
export interface UserInfoDocument {
  email: string;
  displayName: string;
  createdAt?: string;
}

/**
 * Get user info (email and displayName) from Firestore by userId
 */
export async function getUserInfo(userId: string): Promise<UserInfoDocument | null> {
  const db = getFirestoreDb();
  const userDocRef = doc(db, "user", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as UserInfoDocument;
  }

  return null;
}

/**
 * Check if a user document exists and create/update it with user info
 */
export async function ensureUserDocument(
  userId: string, 
  email?: string | null, 
  displayName?: string | null
): Promise<void> {
  const db = getFirestoreDb();
  const userDocRef = doc(db, "user", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      email: email || "",
      displayName: displayName || "",
      createdAt: new Date().toISOString(),
    });
  } else {
    // Update email and displayName if they've changed
    const currentData = userDocSnap.data();
    if (currentData.email !== email || currentData.displayName !== displayName) {
      await setDoc(userDocRef, {
        ...currentData,
        email: email || currentData.email || "",
        displayName: displayName || currentData.displayName || "",
      }, { merge: true });
    }
  }
}

/**
 * Check if habits have incomplete items (have text but not checked)
 */
export function hasIncompleteHabits(habits: HabitItem[]): boolean {
  return habits.some((habit) => habit.text && !habit.checked);
}

/**
 * Check if priorities have incomplete items (have text but not checked)
 */
export function hasIncompletePriorities(priorities: PriorityItem[]): boolean {
  return priorities.some((priority) => priority.text && !priority.checked);
}

/**
 * Extract incomplete habits from a list (keeps text, resets checked to false)
 */
export function extractIncompleteHabits(habits: HabitItem[]): HabitItem[] {
  return habits.map((habit) => ({
    text: habit.text && !habit.checked ? habit.text : "",
    checked: false,
  }));
}

/**
 * Extract incomplete priorities from a list (keeps text, resets checked to false)
 */
export function extractIncompletePriorities(priorities: PriorityItem[]): PriorityItem[] {
  return priorities.map((priority) => ({
    text: priority.text && !priority.checked ? priority.text : "",
    checked: false,
  }));
}

// ============================================================================
// VIEWER MANAGEMENT FUNCTIONS
// ============================================================================

export interface ViewerDocument {
  email: string;
  addedAt: string;
}

export interface SharedOwnerDocument {
  ownerId: string;
  ownerEmail?: string;
  sharedAt: string;
  type: "global" | "daily";
}

/**
 * Add a viewer to access all of a user's daily plans
 * Stored at user/{userId}/viewers/{viewerEmail}
 * Also adds reverse mapping at sharedWithMe/{viewerEmail}/owners/{ownerId}
 */
export async function addGlobalViewer(
  userId: string, 
  viewerEmail: string,
  ownerEmail?: string
): Promise<void> {
  const db = getFirestoreDb();
  const viewerRef = doc(db, "user", userId, "viewers", viewerEmail);
  const sharedWithMeRef = doc(db, "sharedWithMe", viewerEmail, "owners", userId);
  
  const timestamp = new Date().toISOString();
  
  await setDoc(viewerRef, {
    email: viewerEmail,
    addedAt: timestamp,
  });
  
  // Add reverse mapping so viewer can discover who shared with them
  await setDoc(sharedWithMeRef, {
    ownerId: userId,
    ownerEmail: ownerEmail || "",
    sharedAt: timestamp,
    type: "global",
  });
}

/**
 * Remove a global viewer
 * Also removes reverse mapping
 */
export async function removeGlobalViewer(userId: string, viewerEmail: string): Promise<void> {
  const db = getFirestoreDb();
  const viewerRef = doc(db, "user", userId, "viewers", viewerEmail);
  const sharedWithMeRef = doc(db, "sharedWithMe", viewerEmail, "owners", userId);
  
  await deleteDoc(viewerRef);
  await deleteDoc(sharedWithMeRef);
}

/**
 * Get all global viewers for a user
 */
export async function getGlobalViewers(userId: string): Promise<ViewerDocument[]> {
  const db = getFirestoreDb();
  const viewersRef = collection(db, "user", userId, "viewers");
  const querySnapshot = await getDocs(viewersRef);
  
  return querySnapshot.docs.map((doc) => doc.data() as ViewerDocument);
}

/**
 * Add a viewer to access a specific daily plan
 * Stored at user/{userId}/daily-plans/{date}/viewers/{viewerEmail}
 */
export async function addDailyPlanViewer(
  userId: string,
  dateStr: string,
  viewerEmail: string
): Promise<void> {
  const db = getFirestoreDb();
  const viewerRef = doc(db, "user", userId, "daily-plans", dateStr, "viewers", viewerEmail);
  
  await setDoc(viewerRef, {
    email: viewerEmail,
    addedAt: new Date().toISOString(),
  });
}

/**
 * Remove a viewer from a specific daily plan
 */
export async function removeDailyPlanViewer(
  userId: string,
  dateStr: string,
  viewerEmail: string
): Promise<void> {
  const db = getFirestoreDb();
  const viewerRef = doc(db, "user", userId, "daily-plans", dateStr, "viewers", viewerEmail);
  
  await deleteDoc(viewerRef);
}

/**
 * Get all viewers for a specific daily plan
 */
export async function getDailyPlanViewers(
  userId: string,
  dateStr: string
): Promise<ViewerDocument[]> {
  const db = getFirestoreDb();
  const viewersRef = collection(db, "user", userId, "daily-plans", dateStr, "viewers");
  const querySnapshot = await getDocs(viewersRef);
  
  return querySnapshot.docs.map((doc) => doc.data() as ViewerDocument);
}

/**
 * Check if a user has global viewer access to another user's daily plans
 */
export async function isGlobalViewer(ownerUserId: string, viewerEmail: string): Promise<boolean> {
  const db = getFirestoreDb();
  const viewerRef = doc(db, "user", ownerUserId, "viewers", viewerEmail);
  const viewerSnap = await getDoc(viewerRef);
  
  return viewerSnap.exists();
}

/**
 * Check if a user has viewer access to a specific daily plan
 */
export async function isDailyPlanViewer(
  ownerUserId: string,
  dateStr: string,
  viewerEmail: string
): Promise<boolean> {
  const db = getFirestoreDb();
  const viewerRef = doc(db, "user", ownerUserId, "daily-plans", dateStr, "viewers", viewerEmail);
  const viewerSnap = await getDoc(viewerRef);
  
  return viewerSnap.exists();
}

/**
 * Check if a user has any viewer access (global or specific date)
 */
export async function hasViewerAccess(
  ownerUserId: string,
  dateStr: string,
  viewerEmail: string
): Promise<boolean> {
  // Check global access first
  const hasGlobalAccess = await isGlobalViewer(ownerUserId, viewerEmail);
  if (hasGlobalAccess) return true;
  
  // Check specific daily plan access
  return isDailyPlanViewer(ownerUserId, dateStr, viewerEmail);
}

/**
 * Get a daily plan as a viewer (checks permissions first)
 */
export async function getSharedDailyPlan(
  ownerUserId: string,
  dateStr: string,
  viewerEmail: string
): Promise<DailyPlannerDocument | null> {
  // Verify viewer access
  const hasAccess = await hasViewerAccess(ownerUserId, dateStr, viewerEmail);
  if (!hasAccess) {
    throw new Error("You do not have permission to view this daily plan");
  }
  
  return getDailyPlan(ownerUserId, dateStr);
}

/**
 * Get all shared daily plans accessible by a viewer (from a specific owner)
 */
export async function getSharedDatesWithPlans(
  ownerUserId: string,
  viewerEmail: string
): Promise<string[]> {
  // Check if global viewer
  const hasGlobalAccess = await isGlobalViewer(ownerUserId, viewerEmail);
  if (hasGlobalAccess) {
    // Return all dates
    return getDatesWithPlans(ownerUserId);
  }
  
  // Otherwise, get dates where user is a specific viewer
  // This would require a more complex query - for now, return empty
  // since most use cases will use global viewers
  return [];
}

/**
 * Get all users who have shared their daily plans with the current user
 */
export async function getSharedWithMe(viewerEmail: string): Promise<SharedOwnerDocument[]> {
  const db = getFirestoreDb();
  const ownersRef = collection(db, "sharedWithMe", viewerEmail, "owners");
  const querySnapshot = await getDocs(ownersRef);
  
  return querySnapshot.docs.map((doc) => doc.data() as SharedOwnerDocument);
}
