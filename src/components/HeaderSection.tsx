"use client";

import React, { useState } from "react";
import { Box, TextField, Typography, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

const HeaderSection: React.FC = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const handleDateChange = (newDate: Dayjs | null) => {
    setDate(newDate);
    // Value stored in "2025-11-28" format
    if (newDate) {
      const storedValue = newDate.format("YYYY-MM-DD");
      console.log("Stored value:", storedValue);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Daily Planner
      </Typography>

      <Stack direction="row" spacing={3}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={date}
            onChange={handleDateChange}
            format="MMMM D, YYYY"
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
        <TextField label="Energy Level (1–10)" size="small" />
        <TextField label="Mood" size="small" />
      </Stack>
    </Box>
  );
};

export default HeaderSection;
