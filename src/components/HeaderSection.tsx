import React from "react";
import { Box, TextField, Typography, Stack } from "@mui/material";

const HeaderSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Daily Planner
      </Typography>

      <Stack direction="row" spacing={3}>
        <TextField label="Date" size="small" />
        <TextField label="Energy Level (1–10)" size="small" />
        <TextField label="Mood" size="small" />
      </Stack>
    </Box>
  );
};

export default HeaderSection;
