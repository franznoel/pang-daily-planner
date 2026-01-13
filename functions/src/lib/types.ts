/**
 * Shared types for Cloud Functions
 */

export interface HabitItem {
  checked: boolean;
  text: string;
}

export interface PriorityItem {
  checked: boolean;
  text: string;
}

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

export interface UserInfoDocument {
  email?: string;
  displayName?: string;
  createdAt?: string;
}
