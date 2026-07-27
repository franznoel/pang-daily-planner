import React from "react";
import { Grid, Typography, Checkbox, TextField, Stack } from "@mui/material";
import { HabitItem } from "./types";

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
  <Stack spacing={0.5} sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
    <Typography fontWeight={700} fontSize="0.82rem" color="text.secondary">{title}</Typography>
    {habits.map((habit, index) => (
      <Stack direction="row" spacing={0.25} alignItems="center" key={index}>
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
  <Grid container spacing={1.5}>
    <Grid size={12}>
      <Typography textAlign="left" variant="h6" fontWeight={750}>
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
