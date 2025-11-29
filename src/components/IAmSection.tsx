import React from "react";
import { TextField, Typography, Box } from "@mui/material";

const IAmSection = () => (
  <Box sx={{ mt: 3 }}>
    <Typography fontWeight={600}>I Am:</Typography>
    <TextField fullWidth multiline sx={{ mt: 1 }} />
  </Box>
);

export default IAmSection;
