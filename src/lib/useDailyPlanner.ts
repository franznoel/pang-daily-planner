"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "./AuthContext";
import {
  getDailyPlan,
  saveDailyPlan,
  getMostRecentDailyPlan,
  DailyPlannerDocument,
  extractIncompleteHabits,
  extractIncompletePriorities,
  hasIncompleteHabits,
  hasIncompletePriorities,
} from "./dailyPlannerService";
import { DailyPlannerState, HabitItem, PriorityItem } from "@/components/types";

const createEmptyHabits = (): HabitItem[] =>
  Array(4)
    .fill(null)
    .map(() => ({ checked: false, text: "" }));

const createEmptyPriorities = (): PriorityItem[] =>
  Array(3)
    .fill(null)
    .map(() => ({ checked: false, text: "" }));

export const createEmptyState = (date: Dayjs | null = dayjs()): DailyPlannerState => ({
  date,
  energyLevel: "",
  mood: "",
  gratefulFor: ["", "", ""],
  excitedAbout: ["", "", ""],
  peopleToSee: ["", "", ""],
  mindHabits: createEmptyHabits(),
  bodyHabits: createEmptyHabits(),
  spiritHabits: createEmptyHabits(),
  meals: "",
  water: "",
  intention: "",
  iAm: "",
  scheduleEvents: [],
  topPriorities: createEmptyPriorities(),
  professionalPriorities: createEmptyPriorities(),
  personalPriorities: createEmptyPriorities(),
  infinitePossibilities: "",
  whatInspiredMe: "",
  positiveThings: ["", "", ""],
  whatDidIDoWell: "",
  whatDidILearn: "",
});

/**
 * Convert a Firestore document to DailyPlannerState
 */
function documentToState(doc: DailyPlannerDocument): DailyPlannerState {
  return {
    date: doc.date ? dayjs(doc.date) : null,
    energyLevel: doc.energyLevel || "",
    mood: doc.mood || "",
    gratefulFor: doc.gratefulFor || ["", "", ""],
    excitedAbout: doc.excitedAbout || ["", "", ""],
    peopleToSee: doc.peopleToSee || ["", "", ""],
    mindHabits: doc.mindHabits || createEmptyHabits(),
    bodyHabits: doc.bodyHabits || createEmptyHabits(),
    spiritHabits: doc.spiritHabits || createEmptyHabits(),
    meals: doc.meals || "",
    water: doc.water || "",
    intention: doc.intention || "",
    iAm: doc.iAm || "",
    scheduleEvents: doc.scheduleEvents || [],
    topPriorities: doc.topPriorities || createEmptyPriorities(),
    professionalPriorities: doc.professionalPriorities || createEmptyPriorities(),
    personalPriorities: doc.personalPriorities || createEmptyPriorities(),
    infinitePossibilities: doc.infinitePossibilities || "",
    whatInspiredMe: doc.whatInspiredMe || "",
    positiveThings: doc.positiveThings || ["", "", ""],
    whatDidIDoWell: doc.whatDidIDoWell || "",
    whatDidILearn: doc.whatDidILearn || "",
  };
}

interface UseDailyPlannerReturn {
  state: DailyPlannerState;
  loading: boolean;
  saving: boolean;
  datesWithPlans: string[];
  updateField: <K extends keyof DailyPlannerState>(
    field: K,
    value: DailyPlannerState[K]
  ) => void;
  changeDate: (newDate: Dayjs | null) => Promise<void>;
}

export function useDailyPlanner(): UseDailyPlannerReturn {
  const { user } = useAuth();
  const [state, setState] = useState<DailyPlannerState>(createEmptyState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datesWithPlans, setDatesWithPlans] = useState<string[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  const lastSavedRef = useRef<DailyPlannerState | null>(null);

  // Save state to Firestore with debounce
  const saveState = useCallback(
    async (stateToSave: DailyPlannerState) => {
      if (JSON.stringify(lastSavedRef.current) === JSON.stringify(stateToSave)) {
        return;
      }

      if (!user || !stateToSave.date) return;

      setSaving(true);
      try {
        await saveDailyPlan(user.uid, stateToSave);
        // Update dates with plans after saving
        setDatesWithPlans((prev) => {
          const currentDate = stateToSave.date?.format("YYYY-MM-DD");
          return currentDate && !prev.includes(currentDate)
            ? [...prev, currentDate]
            : prev;
        });
      } catch (error) {
        console.error("Error saving daily plan:", error);
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  // Debounced save
  const debouncedSave = useCallback(
    (stateToSave: DailyPlannerState) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveState(stateToSave);
      }, 1000); // 1 second debounce
    },
    [saveState]
  );

  // Load daily plan for a specific date
  const loadDailyPlan = useCallback(
    async (dateStr: string): Promise<DailyPlannerState | null> => {
      if (!user) return null;

      try {
        const doc = await getDailyPlan(user.uid, dateStr);
        if (doc) {
          return documentToState(doc);
        }
        return null;
      } catch (error) {
        console.error("Error loading daily plan:", error);
        return null;
      }
    },
    [user]
  );

  // Check if we should copy incomplete items from previous day
  const shouldCopyFromPrevious = useCallback(
    async (dateStr: string): Promise<DailyPlannerState | null> => {
      if (!user) return null;

      // Only copy for today's date
      const isToday = dayjs(dateStr).isSame(dayjs(), "day");
      if (!isToday) return null;

      try {
        const recentPlan = await getMostRecentDailyPlan(user.uid, dateStr);
        if (!recentPlan) return null;

        // Check if there are incomplete habits or priorities
        const hasIncomplete =
          hasIncompleteHabits(recentPlan.mindHabits) ||
          hasIncompleteHabits(recentPlan.bodyHabits) ||
          hasIncompleteHabits(recentPlan.spiritHabits) ||
          hasIncompletePriorities(recentPlan.topPriorities) ||
          hasIncompletePriorities(recentPlan.professionalPriorities) ||
          hasIncompletePriorities(recentPlan.personalPriorities);

        if (!hasIncomplete) return null;

        // Create new state with incomplete items copied
        const newState = createEmptyState(dayjs(dateStr));
        newState.mindHabits = extractIncompleteHabits(recentPlan.mindHabits);
        newState.bodyHabits = extractIncompleteHabits(recentPlan.bodyHabits);
        newState.spiritHabits = extractIncompleteHabits(recentPlan.spiritHabits);
        newState.topPriorities = extractIncompletePriorities(recentPlan.topPriorities);
        newState.professionalPriorities = extractIncompletePriorities(
          recentPlan.professionalPriorities
        );
        newState.personalPriorities = extractIncompletePriorities(
          recentPlan.personalPriorities
        );

        return newState;
      } catch (error) {
        console.error("Error checking previous day:", error);
        return null;
      }
    },
    [user]
  );

  // Change date and load corresponding data
  const changeDate = useCallback(
    async (newDate: Dayjs | null) => {
      if (!newDate || !user) {
        setState((prev) => ({ ...prev, date: newDate }));
        return;
      }

      setLoading(true);
      const dateStr = newDate.format("YYYY-MM-DD");

      try {
        // Try to load existing plan
        const existingPlan = await loadDailyPlan(dateStr);

        if (existingPlan) {
          setState(existingPlan);
        } else {
          // No existing plan - check if we should copy from previous
          const copiedState = await shouldCopyFromPrevious(dateStr);
          if (copiedState) {
            setState(copiedState);
            // Save the copied state
            await saveState(copiedState);
          } else {
            // Create empty state for this date
            const emptyState = createEmptyState(newDate);
            setState(emptyState);
          }
        }
      } catch (error) {
        console.error("Error changing date:", error);
        setState(createEmptyState(newDate));
      } finally {
        setLoading(false);
      }
    },
    [user, loadDailyPlan, shouldCopyFromPrevious, saveState]
  );

  // Update a field in state and trigger save
  const updateField = useCallback(
    <K extends keyof DailyPlannerState>(field: K, value: DailyPlannerState[K]) => {
      setState((prev) => {
        const newState = { ...prev, [field]: value };
        // Don't save on date change - that's handled separately
        if (field !== "date") {
          debouncedSave(newState);
        }
        return newState;
      });
    },
    [debouncedSave]
  );

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        const today = dayjs();
        await changeDate(today);
        // loadDatesWithPlans is already called inside changeDate after saving
      }
    };
    
    initializeData();
  }, [user, changeDate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    loading,
    saving,
    datesWithPlans,
    updateField,
    changeDate,
  };
}
