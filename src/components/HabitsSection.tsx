import React from "react";
import { Grid, Typography, Checkbox, TextField, Stack } from "@mui/material";

const HabitColumn = ({ title }: { title: string }) => (
  <Stack spacing={1}>
    <Typography fontWeight={600}>{title}</Typography>
    {[1,2,3,4].map(i => (
      <Stack direction="row" spacing={1} alignItems="center" key={i}>
        <Checkbox />
        <TextField size="small" fullWidth />
      </Stack>
    ))}
  </Stack>
);

const HabitsSection = () => (
  <Grid container spacing={3}>
    <Grid size={12}>
      <Typography textAlign="center" variant="h6">
        Daily Habits
      </Typography>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <HabitColumn title="Mind" />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <HabitColumn title="Body" />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <HabitColumn title="Spirit" />
    </Grid>
  </Grid>
);

export default HabitsSection;
