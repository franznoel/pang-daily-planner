import { HabitItem, PriorityItem } from "@/components/types";

/**
 * Type for Firestore-serializable daily planner state (without Dayjs)
 * This file is shared between client and server code and should NOT import Firebase SDKs
 */
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
 * User info document structure
 */
export interface UserInfoDocument {
  email?: string;
  displayName?: string;
  createdAt?: string;
}

/**
 * Viewer document structure
 */
export interface ViewerDocument {
  email: string;
  addedAt: string;
}

/**
 * Shared owner document structure
 */
export interface SharedOwnerDocument {
  ownerId: string;
  ownerEmail?: string;
  sharedAt: string;
  type: "global" | "daily";
}
