import React from "react";
import { TextField, Typography, Box } from "@mui/material";

interface IAmSectionProps {
  iAm: string;
  onIAmChange: (value: string) => void;
}

const IAmSection: React.FC<IAmSectionProps> = ({ iAm, onIAmChange }) => (
  <Box sx={{ mt: 3 }}>
    <Typography fontWeight={600}>I Am:</Typography>
    <TextField
      fullWidth
      multiline
      sx={{ mt: 1 }}
      value={iAm}
      onChange={(e) => onIAmChange(e.target.value)}
    />
  </Box>
);

export default IAmSection;
