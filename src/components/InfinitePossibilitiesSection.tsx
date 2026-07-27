import React from "react";
import { TextField, Typography, Box } from "@mui/material";

interface InfinitePossibilitiesSectionProps {
  infinitePossibilities: string;
  onInfinitePossibilitiesChange: (value: string) => void;
}

const InfinitePossibilitiesSection: React.FC<
  InfinitePossibilitiesSectionProps
> = ({ infinitePossibilities, onInfinitePossibilitiesChange }) => (
  <Box sx={{ mt: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
    <Typography fontWeight={700} fontSize="0.82rem" color="text.secondary">Space for infinite possibilities</Typography>
    <TextField
      fullWidth
      multiline
      rows={2}
      sx={{ mt: 1 }}
      value={infinitePossibilities}
      onChange={(e) => onInfinitePossibilitiesChange(e.target.value)}
    />
  </Box>
);

export default InfinitePossibilitiesSection;
