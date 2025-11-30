"use client";

import React from "react";
import { Box, TextField, Typography, Stack, CircularProgress, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { Dayjs } from "dayjs";

interface HeaderSectionProps {
  date: Dayjs | null;
  energyLevel: string;
  mood: string;
  datesWithPlans?: string[];
  loading?: boolean;
  saving?: boolean;
  onDateChange: (date: Dayjs | null) => void;
  onEnergyLevelChange: (value: string) => void;
  onMoodChange: (value: string) => void;
}

// Custom day component for DatePicker
interface CustomDayProps extends PickersDayProps {
  datesWithPlansSet?: Set<string>;
}

function CustomDay(props: CustomDayProps) {
  const { datesWithPlansSet, day, selected, ...other } = props;
  const dateStr = (day as Dayjs).format("YYYY-MM-DD");
  const hasRecord = datesWithPlansSet?.has(dateStr) ?? false;

  if (hasRecord && !selected) {
    return (
      <PickersDay
        {...other}
        day={day}
        selected={selected}
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: "50%",
        }}
      />
    );
  }

  return <PickersDay {...other} day={day} selected={selected} />;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  date,
  energyLevel,
  mood,
  datesWithPlans = [],
  loading = false,
  saving = false,
  onDateChange,
  onEnergyLevelChange,
  onMoodChange,
}) => {
  // Convert array to Set for O(1) lookups in DatePicker
  const datesWithPlansSet = React.useMemo(
    () => new Set(datesWithPlans),
    [datesWithPlans]
  );

  const handleEnergyLevelChange = (e: SelectChangeEvent) => {
    onEnergyLevelChange(e.target.value);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Daily Planner
        </Typography>
        {(loading || saving) && (
          <CircularProgress size={20} sx={{ mb: 1 }} />
        )}
        {saving && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Saving...
          </Typography>
        )}
      </Stack>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={date}
            onChange={onDateChange}
            format="MMMM D, YYYY"
            slotProps={{ textField: { size: "small" } }}
            slots={{
              day: (dayProps) => (
                <CustomDay {...dayProps} datesWithPlansSet={datesWithPlansSet} />
              ),
            }}
          />
        </LocalizationProvider>
        <FormControl size="small" sx={{ width: "200px" }}>
          <InputLabel id="energy-level-label">Energy Level (1–10)</InputLabel>
          <Select
            labelId="energy-level-label"
            id="energy-level"
            value={energyLevel || "10"}
            label="Energy Level (1–10)"
            onChange={handleEnergyLevelChange}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <MenuItem key={level} value={String(level)}>
                {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Mood"
          size="small"
          value={mood}
          onChange={(e) => onMoodChange(e.target.value)}
        />
      </Stack>
    </Box>
  );
};

export default HeaderSection;
