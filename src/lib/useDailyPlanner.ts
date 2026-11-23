"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "./AuthContext";
import {
  getDailyPlan,
  saveDailyPlan,
  getMostRecentDailyPlan,
  getDatesWithPlans,
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
  saveError: string | null;
  pending: boolean;
  retrySave: () => void;
  loadError: string | null;
  retryLoad: () => void;
  datesWithPlans: string[];
  updateField: <K extends keyof DailyPlannerState>(
    field: K,
    value: DailyPlannerState[K]
  ) => void;
  changeDate: (newDate: Dayjs | null) => Promise<void>;
}

export function useDailyPlanner(): UseDailyPlannerReturn {
  const { user } = useAuth();
  const [state, setState] = useState<DailyPlannerState>(() => createEmptyState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datesWithPlans, setDatesWithPlans] = useState<string[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const stateRef = useRef(state);
  const pendingRef = useRef(new Map<string, DailyPlannerState>());
  const runningRef = useRef(false);
  const loadRequestRef = useRef(0);
  const uid = user?.uid;
  const requestedDateRef = useRef(dayjs());
  const draftKey = useCallback((date: string) => `pang-draft-v1:${uid}:${date}`, [uid]);

  // Write drafts immediately; only remove them after the matching revision is acknowledged.
  const queueDraft = useCallback((next: DailyPlannerState) => {
    if (!uid || !next.date?.isValid()) return;
    const date = next.date.format("YYYY-MM-DD");
    pendingRef.current.set(date, next);
    setPending(true);
    try {
      localStorage.setItem(draftKey(date), JSON.stringify(next));
    } catch {
      setSaveError("Local backup unavailable. Keep this page open until saved.");
    }
  }, [uid, draftKey]);

  const flush = useCallback(async () => {
    if (!uid || runningRef.current || !pendingRef.current.size) return;
    runningRef.current = true;
    setSaving(true);
    try {
      while (pendingRef.current.size) {
        const [date, snapshot] = pendingRef.current.entries().next().value!;
        await saveDailyPlan(uid, snapshot);
        if (pendingRef.current.get(date) === snapshot) {
          pendingRef.current.delete(date);
          try {
            // Another tab may have written a newer draft while this save was in flight.
            if (localStorage.getItem(draftKey(date)) === JSON.stringify(snapshot)) {
              localStorage.removeItem(draftKey(date));
            }
          } catch { /* Retry is safe. */ }
        }
        setDatesWithPlans(prev => prev.includes(date) ? prev : [...prev, date]);
      }
      setSaveError(null);
    } catch {
      setSaveError("Couldn’t save to the cloud. Your draft will retry automatically.");
    } finally {
      runningRef.current = false;
      setSaving(false);
      setPending(pendingRef.current.size > 0);
    }
  }, [uid, draftKey]);

  const saveState = useCallback(async (next: DailyPlannerState) => {
    queueDraft(next);
    await flush();
  }, [queueDraft, flush]);

  const debouncedSave = useCallback((next: DailyPlannerState) => {
    queueDraft(next);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => { void flush(); }, 1000);
  }, [queueDraft, flush]);

  // Load daily plan for a specific date
  const loadDailyPlan = useCallback(
    async (dateStr: string): Promise<DailyPlannerState | null> => {
      if (!uid) return null;

      const doc = await getDailyPlan(uid, dateStr);
      return doc ? documentToState(doc) : null;
    },
    [uid]
  );

  // Check if we should copy incomplete items from previous day
  const shouldCopyFromPrevious = useCallback(
    async (dateStr: string): Promise<DailyPlannerState | null> => {
      if (!uid) return null;

      // Only copy for today's date
      const isToday = dayjs(dateStr).isSame(dayjs(), "day");
      if (!isToday) return null;

      try {
        const recentPlan = await getMostRecentDailyPlan(uid, dateStr);
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
    [uid]
  );

  // Change date and load corresponding data
  const changeDate = useCallback(
    async (newDate: Dayjs | null) => {
      if (!newDate?.isValid() || !uid) return;
      requestedDateRef.current = newDate;
      void flush();
      const request = ++loadRequestRef.current;
      setLoadError(null);
      setLoading(true);
      const dateStr = newDate.format("YYYY-MM-DD");

      try {
        let recovered: DailyPlannerState | null = pendingRef.current.get(dateStr) || null;
        try {
          const raw = localStorage.getItem(draftKey(dateStr));
          if (raw && !recovered) {
            const draft = JSON.parse(raw);
            if (draft.date && dayjs(draft.date).format("YYYY-MM-DD") === dateStr) {
              recovered = documentToState(draft);
            }
          }
        } catch { /* A corrupt backup must not prevent cloud loading. */ }
        const existingPlan = recovered || await loadDailyPlan(dateStr);
        const next = existingPlan || await shouldCopyFromPrevious(dateStr) || createEmptyState(newDate);
        if (request !== loadRequestRef.current) return;
        stateRef.current = next;
        setState(next);
        if (recovered || (!existingPlan && JSON.stringify(next) !== JSON.stringify(createEmptyState(newDate)))) {
          void saveState(next);
        }
      } catch {
        if (request === loadRequestRef.current) {
          setLoadError("Couldn’t load this day. Retry before editing to protect your saved plan.");
        }
      } finally {
        if (request === loadRequestRef.current) setLoading(false);
      }
    },
    [uid, loadDailyPlan, shouldCopyFromPrevious, saveState, flush, draftKey]
  );

  // Update a field in state and trigger save
  const updateField = useCallback(
    <K extends keyof DailyPlannerState>(field: K, value: DailyPlannerState[K]) => {
      const next = { ...stateRef.current, [field]: value };
      stateRef.current = next;
      setState(next);
      if (field !== "date") debouncedSave(next);
    },
    [debouncedSave]
  );

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    void getDatesWithPlans(uid).then(dates => {
      if (!cancelled) setDatesWithPlans(dates);
    }).catch(() => { /* Date markers are optional; day loading reports errors. */ });
    void changeDate(dayjs());
    return () => {
      cancelled = true;
      // This ref is a request counter, not a DOM node; invalidate outstanding loads.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadRequestRef.current++;
    };
  }, [uid, changeDate]);

  useEffect(() => {
    const retry = () => { void flush(); };
    const hidden = () => { if (document.visibilityState === "hidden") retry(); };
    const warn = (event: BeforeUnloadEvent) => {
      if (pendingRef.current.size) { event.preventDefault(); event.returnValue = ""; }
    };
    const interval = setInterval(retry, 15000);
    window.addEventListener("online", retry);
    window.addEventListener("pagehide", retry);
    window.addEventListener("beforeunload", warn);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", retry);
      window.removeEventListener("pagehide", retry);
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("visibilitychange", hidden);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      void flush();
    };
  }, [flush]);

  return {
    state,
    loading,
    saving,
    saveError,
    pending,
    retrySave: () => { void flush(); },
    loadError,
    retryLoad: () => { void changeDate(requestedDateRef.current); },
    datesWithPlans,
    updateField,
    changeDate,
  };
}
