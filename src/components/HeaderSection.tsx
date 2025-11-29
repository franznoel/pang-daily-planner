"use client";

import React from "react";
import { Box, TextField, Typography, Stack, CircularProgress } from "@mui/material";
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

  const handleEnergyLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers 1-10
    if (value === "") {
      onEnergyLevelChange(value);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10 && String(numValue) === value) {
      onEnergyLevelChange(value);
    }
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
        <TextField
          label="Energy Level (1–10)"
          size="small"
          type="number"
          sx={{ width: "200px" }}
          value={energyLevel || 10}
          onChange={handleEnergyLevelChange}
          slotProps={{
            htmlInput: {
              min: 1,
              max: 10,
            },
          }}
        />
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
