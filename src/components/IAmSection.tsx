import React from "react";
import { TextField, Typography, Box } from "@mui/material";

interface IAmSectionProps {
  iAm: string;
  onIAmChange: (value: string) => void;
}

const IAmSection: React.FC<IAmSectionProps> = ({ iAm, onIAmChange }) => (
  <Box sx={{ p: 1.5, height: "100%", bgcolor: "action.hover", borderRadius: 2 }}>
    <Typography fontWeight={700} fontSize="0.82rem" color="text.secondary">I am</Typography>
    <TextField
      fullWidth
      multiline
      minRows={3}
      sx={{ mt: 1 }}
      value={iAm}
      onChange={(e) => onIAmChange(e.target.value)}
    />
  </Box>
);

export default IAmSection;
