import React from "react";
import { Grid, Typography, Checkbox, TextField, Stack } from "@mui/material";
import { HabitItem } from "./DailyPlannerPage";

interface HabitColumnProps {
  title: string;
  habits: HabitItem[];
  onTextChange: (index: number, text: string) => void;
  onCheckedChange: (index: number, checked: boolean) => void;
}

const HabitColumn: React.FC<HabitColumnProps> = ({
  title,
  habits,
  onTextChange,
  onCheckedChange,
}) => (
  <Stack spacing={1}>
    <Typography fontWeight={600}>{title}</Typography>
    {habits.map((habit, index) => (
      <Stack direction="row" spacing={1} alignItems="center" key={index}>
        <Checkbox
          checked={habit.checked}
          onChange={(e) => onCheckedChange(index, e.target.checked)}
        />
        <TextField
          size="small"
          fullWidth
          value={habit.text}
          onChange={(e) => onTextChange(index, e.target.value)}
        />
      </Stack>
    ))}
  </Stack>
);

interface HabitsSectionProps {
  mindHabits: HabitItem[];
  bodyHabits: HabitItem[];
  spiritHabits: HabitItem[];
  onMindHabitTextChange: (index: number, text: string) => void;
  onMindHabitCheckedChange: (index: number, checked: boolean) => void;
  onBodyHabitTextChange: (index: number, text: string) => void;
  onBodyHabitCheckedChange: (index: number, checked: boolean) => void;
  onSpiritHabitTextChange: (index: number, text: string) => void;
  onSpiritHabitCheckedChange: (index: number, checked: boolean) => void;
}

const HabitsSection: React.FC<HabitsSectionProps> = ({
  mindHabits,
  bodyHabits,
  spiritHabits,
  onMindHabitTextChange,
  onMindHabitCheckedChange,
  onBodyHabitTextChange,
  onBodyHabitCheckedChange,
  onSpiritHabitTextChange,
  onSpiritHabitCheckedChange,
}) => (
  <Grid container spacing={3}>
    <Grid size={12}>
      <Typography textAlign="center" variant="h6">
        Daily Habits
      </Typography>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <HabitColumn
        title="Mind"
        habits={mindHabits}
        onTextChange={onMindHabitTextChange}
        onCheckedChange={onMindHabitCheckedChange}
      />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <HabitColumn
        title="Body"
        habits={bodyHabits}
        onTextChange={onBodyHabitTextChange}
        onCheckedChange={onBodyHabitCheckedChange}
      />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <HabitColumn
        title="Spirit"
        habits={spiritHabits}
        onTextChange={onSpiritHabitTextChange}
        onCheckedChange={onSpiritHabitCheckedChange}
      />
    </Grid>
  </Grid>
);

export default HabitsSection;
