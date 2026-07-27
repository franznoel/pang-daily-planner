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
  <Box sx={{ p: 1.5, height: "100%", bgcolor: "action.hover", borderRadius: 2 }}>
    <Typography fontWeight={700} fontSize="0.82rem" color="text.secondary">Today&apos;s intention</Typography>
    <TextField
      fullWidth
      multiline
      minRows={3}
      sx={{ mt: 1 }}
      value={intention}
      onChange={(e) => onIntentionChange(e.target.value)}
    />
  </Box>
);

export default IntentionSection;
