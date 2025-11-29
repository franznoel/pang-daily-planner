import React from "react";
import { TextField, Typography, Box } from "@mui/material";

interface InfinitePossibilitiesSectionProps {
  infinitePossibilities: string;
  onInfinitePossibilitiesChange: (value: string) => void;
}

const InfinitePossibilitiesSection: React.FC<
  InfinitePossibilitiesSectionProps
> = ({ infinitePossibilities, onInfinitePossibilitiesChange }) => (
  <Box sx={{ mt: 5 }}>
    <Typography fontWeight={600}>Space for Infinite Possibilities:</Typography>
    <TextField
      fullWidth
      multiline
      rows={3}
      sx={{ mt: 1 }}
      value={infinitePossibilities}
      onChange={(e) => onInfinitePossibilitiesChange(e.target.value)}
    />
  </Box>
);

export default InfinitePossibilitiesSection;
