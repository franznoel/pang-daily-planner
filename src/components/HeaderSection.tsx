"use client";

import React from "react";
import {
  Box,
  TextField,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
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
  const energyLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
          label="Mood"
          size="small"
          value={mood}
          onChange={(e) => onMoodChange(e.target.value)}
        />        
        <FormControl>
          <FormLabel>Energy Level (1–10)</FormLabel>
          <RadioGroup
            row
            value={energyLevel}
            onChange={(e) => onEnergyLevelChange(e.target.value)}
          >
            {energyLevels.map((level) => (
              <FormControlLabel
                key={level}
                value={String(level)}
                control={<Radio size="small" />}
                label={String(level)}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default HeaderSection;
