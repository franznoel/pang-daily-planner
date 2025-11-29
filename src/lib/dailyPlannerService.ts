"use client";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
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
export function stateToDocument(state: DailyPlannerState): DailyPlannerDocument {
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
    updatedAt: new Date().toISOString(),
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

  // Check if document exists to preserve createdAt
  const existingDoc = await getDoc(docRef);
  if (existingDoc.exists()) {
    document.createdAt = existingDoc.data().createdAt;
  } else {
    document.createdAt = new Date().toISOString();
  }

  await setDoc(docRef, document);
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
 * Check if a user document exists and create it if not
 */
export async function ensureUserDocument(userId: string): Promise<void> {
  const db = getFirestoreDb();
  const userDocRef = doc(db, "user", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      createdAt: new Date().toISOString(),
    });
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
