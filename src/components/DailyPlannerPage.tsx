"use client";

import React, { useEffect } from "react";
import { Grid, Divider, Card, CircularProgress, Box } from "@mui/material";

import HeaderSection from "./HeaderSection";
import ThreeListSection from "./ThreeListSection";
import HabitsSection from "./HabitsSection";
import MealsWaterSection from "./MealsWaterSection";
import IntentionSection from "./IntentionSection";
import IAmSection from "./IAmSection";
import ScheduleSection from "./ScheduleSection";
import PrioritiesSection from "./PrioritiesSection";
import InfinitePossibilitiesSection from "./InfinitePossibilitiesSection";
import EndOfDayReflection from "./EndOfDayReflection";
import { DailyPlannerState, HabitItem, PriorityItem, ScheduleEvent } from "./types";
import { useDailyPlanner } from "@/lib/useDailyPlanner";

export type { HabitItem, PriorityItem, DailyPlannerState, ScheduleEvent };

interface DailyPlannerPageProps {
  onCurrentDateChange?: (date: string | null) => void;
}

const DailyPlannerPage: React.FC<DailyPlannerPageProps> = ({ onCurrentDateChange }) => {
  const { state, loading, saving, datesWithPlans, updateField, changeDate } =
    useDailyPlanner();

  // Notify parent about current date changes
  useEffect(() => {
    if (onCurrentDateChange) {
      onCurrentDateChange(state.date?.format("YYYY-MM-DD") || null);
    }
  }, [state.date, onCurrentDateChange]);

  const updateListItem = (
    field: "gratefulFor" | "excitedAbout" | "peopleToSee" | "positiveThings",
    index: number,
    value: string
  ) => {
    const newList = [...state[field]];
    newList[index] = value;
    updateField(field, newList);
  };

  const updateHabitText = (
    field: "mindHabits" | "bodyHabits" | "spiritHabits",
    index: number,
    text: string
  ) => {
    const newHabits = [...state[field]];
    newHabits[index] = { ...newHabits[index], text };
    updateField(field, newHabits);
  };

  const updateHabitChecked = (
    field: "mindHabits" | "bodyHabits" | "spiritHabits",
    index: number,
    checked: boolean
  ) => {
    const newHabits = [...state[field]];
    newHabits[index] = { ...newHabits[index], checked };
    updateField(field, newHabits);
  };

  const addScheduleEvent = (event: ScheduleEvent) => {
    updateField("scheduleEvents", [...state.scheduleEvents, event]);
  };

  const updateScheduleEvent = (updatedEvent: ScheduleEvent) => {
    updateField(
      "scheduleEvents",
      state.scheduleEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const deleteScheduleEvent = (eventId: string) => {
    updateField(
      "scheduleEvents",
      state.scheduleEvents.filter((event) => event.id !== eventId)
    );
  };

  const updatePriorityText = (
    field: "topPriorities" | "professionalPriorities" | "personalPriorities",
    index: number,
    text: string
  ) => {
    const newPriorities = [...state[field]];
    newPriorities[index] = { ...newPriorities[index], text };
    updateField(field, newPriorities);
  };

  const updatePriorityChecked = (
    field: "topPriorities" | "professionalPriorities" | "personalPriorities",
    index: number,
    checked: boolean
  ) => {
    const newPriorities = [...state[field]];
    newPriorities[index] = { ...newPriorities[index], checked };
    updateField(field, newPriorities);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ p: 4, maxWidth: 1200, margin: "auto", mt: 4, mb: 7 }}>
      <HeaderSection
        date={state.date}
        energyLevel={state.energyLevel}
        mood={state.mood}
        datesWithPlans={datesWithPlans}
        loading={loading}
        saving={saving}
        onDateChange={changeDate}
        onEnergyLevelChange={(value) => updateField("energyLevel", value)}
        onMoodChange={(value) => updateField("mood", value)}
      />

      <ThreeListSection
        gratefulFor={state.gratefulFor}
        excitedAbout={state.excitedAbout}
        peopleToSee={state.peopleToSee}
        onGratefulForChange={(index, value) =>
          updateListItem("gratefulFor", index, value)
        }
        onExcitedAboutChange={(index, value) =>
          updateListItem("excitedAbout", index, value)
        }
        onPeopleToSeeChange={(index, value) =>
          updateListItem("peopleToSee", index, value)
        }
      />

      <Divider sx={{ my: 3 }} />

      <HabitsSection
        mindHabits={state.mindHabits}
        bodyHabits={state.bodyHabits}
        spiritHabits={state.spiritHabits}
        onMindHabitTextChange={(index, text) =>
          updateHabitText("mindHabits", index, text)
        }
        onMindHabitCheckedChange={(index, checked) =>
          updateHabitChecked("mindHabits", index, checked)
        }
        onBodyHabitTextChange={(index, text) =>
          updateHabitText("bodyHabits", index, text)
        }
        onBodyHabitCheckedChange={(index, checked) =>
          updateHabitChecked("bodyHabits", index, checked)
        }
        onSpiritHabitTextChange={(index, text) =>
          updateHabitText("spiritHabits", index, text)
        }
        onSpiritHabitCheckedChange={(index, checked) =>
          updateHabitChecked("spiritHabits", index, checked)
        }
      />

      <MealsWaterSection
        meals={state.meals}
        water={state.water}
        onMealsChange={(value) => updateField("meals", value)}
        onWaterChange={(value) => updateField("water", value)}
      />

      <IntentionSection
        intention={state.intention}
        onIntentionChange={(value) => updateField("intention", value)}
      />

      <IAmSection
        iAm={state.iAm}
        onIAmChange={(value) => updateField("iAm", value)}
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ScheduleSection
            scheduleEvents={state.scheduleEvents}
            currentDate={state.date?.format("YYYY-MM-DD") || new Date().toISOString().split("T")[0]}
            onEventAdd={addScheduleEvent}
            onEventUpdate={updateScheduleEvent}
            onEventDelete={deleteScheduleEvent}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PrioritiesSection
            topPriorities={state.topPriorities}
            professionalPriorities={state.professionalPriorities}
            personalPriorities={state.personalPriorities}
            onTopPriorityTextChange={(index, text) =>
              updatePriorityText("topPriorities", index, text)
            }
            onTopPriorityCheckedChange={(index, checked) =>
              updatePriorityChecked("topPriorities", index, checked)
            }
            onProfessionalPriorityTextChange={(index, text) =>
              updatePriorityText("professionalPriorities", index, text)
            }
            onProfessionalPriorityCheckedChange={(index, checked) =>
              updatePriorityChecked("professionalPriorities", index, checked)
            }
            onPersonalPriorityTextChange={(index, text) =>
              updatePriorityText("personalPriorities", index, text)
            }
            onPersonalPriorityCheckedChange={(index, checked) =>
              updatePriorityChecked("personalPriorities", index, checked)
            }
          />
        </Grid>
      </Grid>

      <InfinitePossibilitiesSection
        infinitePossibilities={state.infinitePossibilities}
        onInfinitePossibilitiesChange={(value) =>
          updateField("infinitePossibilities", value)
        }
      />

      <Divider sx={{ my: 5 }} />

      <EndOfDayReflection
        whatInspiredMe={state.whatInspiredMe}
        positiveThings={state.positiveThings}
        whatDidIDoWell={state.whatDidIDoWell}
        whatDidILearn={state.whatDidILearn}
        onWhatInspiredMeChange={(value) => updateField("whatInspiredMe", value)}
        onPositiveThingsChange={(index, value) =>
          updateListItem("positiveThings", index, value)
        }
        onWhatDidIDoWellChange={(value) => updateField("whatDidIDoWell", value)}
        onWhatDidILearnChange={(value) => updateField("whatDidILearn", value)}
      />
    </Card>
  );
};

export default DailyPlannerPage;
