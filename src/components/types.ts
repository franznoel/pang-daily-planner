import { Dayjs } from "dayjs";

export interface HabitItem {
  checked: boolean;
  text: string;
}

export interface PriorityItem {
  checked: boolean;
  text: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

export interface DailyPlannerState {
  // Header
  date: Dayjs | null;
  energyLevel: string;
  mood: string;
  // Three lists
  gratefulFor: string[];
  excitedAbout: string[];
  peopleToSee: string[];
  // Habits
  mindHabits: HabitItem[];
  bodyHabits: HabitItem[];
  spiritHabits: HabitItem[];
  // Meals and water
  meals: string;
  water: string;
  // Intention and I Am
  intention: string;
  iAm: string;
  // Schedule events for FullCalendar
  scheduleEvents: ScheduleEvent[];
  // Priorities
  topPriorities: PriorityItem[];
  professionalPriorities: PriorityItem[];
  personalPriorities: PriorityItem[];
  // Infinite possibilities
  infinitePossibilities: string;
  // End of day reflection
  whatInspiredMe: string;
  positiveThings: string[];
  whatDidIDoWell: string;
  whatDidILearn: string;
}
