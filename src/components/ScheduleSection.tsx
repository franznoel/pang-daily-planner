import React from 'react';
import { Box, TextField, Typography, Stack } from '@mui/material';

const hours = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM"
];

const ScheduleSection = () => (
  <Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      Schedule
    </Typography>

    {hours.map((h, index) => (
      <Stack direction="row" spacing={2} alignItems="center" key={`${h}-${index}`} sx={{ mb: 1 }}>
        <Typography width={80} textAlign="right">{h}</Typography>
        <TextField fullWidth size="small" />
      </Stack>
    ))}
  </Box>
);

export default ScheduleSection;
