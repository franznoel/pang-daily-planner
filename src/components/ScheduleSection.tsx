import React from 'react';
import { Box, TextField, Typography, Stack } from '@mui/material';

const hours = [
  "6:00","7:00","8:00","9:00","10:00","11:00",
  "12:00","1:00","2:00","3:00","4:00","5:00",
  "6:00","7:00","8:00","9:00","10:00"
];

const ScheduleSection = () => (
  <Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      Schedule
    </Typography>

    {hours.map((h, index) => (
      <Stack direction="row" spacing={2} alignItems="center" key={`${h}-${index}`} sx={{ mb: 1 }}>
        <Typography width={60}>{h}</Typography>
        <TextField fullWidth size="small" />
      </Stack>
    ))}
  </Box>
);

export default ScheduleSection;
