import React from "react";
import { TextField, Typography, Box } from "@mui/material";

const InfinitePossibilitiesSection = () => (
  <Box sx={{ mt: 5 }}>
    <Typography fontWeight={600}>Space for Infinite Possibilities:</Typography>
    <TextField fullWidth multiline rows={3} sx={{ mt: 1 }} />
  </Box>
);

export default InfinitePossibilitiesSection;
