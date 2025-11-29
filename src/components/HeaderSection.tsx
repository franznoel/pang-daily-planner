"use client";

import React from "react";
import { Box, TextField, Typography, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

interface HeaderSectionProps {
  date: Dayjs | null;
  energyLevel: string;
  mood: string;
  onDateChange: (date: Dayjs | null) => void;
  onEnergyLevelChange: (value: string) => void;
  onMoodChange: (value: string) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  date,
  energyLevel,
  mood,
  onDateChange,
  onEnergyLevelChange,
  onMoodChange,
}) => {
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
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Daily Planner
      </Typography>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={date}
            onChange={onDateChange}
            format="MMMM D, YYYY"
            slotProps={{ textField: { size: "small" } }}
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
