import React from "react";
import { TextField, Typography, Box } from "@mui/material";

const IntentionSection = () => (
  <Box sx={{ mt: 3 }}>
    <Typography fontWeight={600}>Today&apos;s Intention:</Typography>
    <TextField fullWidth multiline sx={{ mt: 1 }} />
  </Box>
);

export default IntentionSection;
