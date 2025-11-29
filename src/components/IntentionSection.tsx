import React from "react";
import { TextField, Typography, Box } from "@mui/material";

interface IntentionSectionProps {
  intention: string;
  onIntentionChange: (value: string) => void;
}

const IntentionSection: React.FC<IntentionSectionProps> = ({
  intention,
  onIntentionChange,
}) => (
  <Box sx={{ mt: 3 }}>
    <Typography fontWeight={600}>Today&apos;s Intention:</Typography>
    <TextField
      fullWidth
      multiline
      sx={{ mt: 1 }}
      value={intention}
      onChange={(e) => onIntentionChange(e.target.value)}
    />
  </Box>
);

export default IntentionSection;
