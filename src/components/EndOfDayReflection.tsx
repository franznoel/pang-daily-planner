import React from "react";
import { Box, TextField, Typography, Stack } from "@mui/material";

interface EndOfDayReflectionProps {
  whatInspiredMe: string;
  positiveThings: string[];
  whatDidIDoWell: string;
  whatDidILearn: string;
  onWhatInspiredMeChange: (value: string) => void;
  onPositiveThingsChange: (index: number, value: string) => void;
  onWhatDidIDoWellChange: (value: string) => void;
  onWhatDidILearnChange: (value: string) => void;
}

const EndOfDayReflection: React.FC<EndOfDayReflectionProps> = ({
  whatInspiredMe,
  positiveThings,
  whatDidIDoWell,
  whatDidILearn,
  onWhatInspiredMeChange,
  onPositiveThingsChange,
  onWhatDidIDoWellChange,
  onWhatDidILearnChange,
}) => (
  <Box>
    <Typography variant="h5" fontWeight={700} gutterBottom>
      End of Day Reflection
    </Typography>

    <Stack spacing={2}>
      <TextField
        label="What inspired me today?"
        fullWidth
        multiline
        minRows={2}
        value={whatInspiredMe}
        onChange={(e) => onWhatInspiredMeChange(e.target.value)}
      />

      <Typography fontWeight={600}>List 3 positive things:</Typography>
      <Stack spacing={1}>
        {positiveThings.map((value, index) => (
          <TextField
            key={index}
            size="small"
            value={value}
            onChange={(e) => onPositiveThingsChange(index, e.target.value)}
          />
        ))}
      </Stack>

      <TextField
        label="What did I do well today? Where did I make progress?"
        fullWidth
        multiline
        minRows={2}
        value={whatDidIDoWell}
        onChange={(e) => onWhatDidIDoWellChange(e.target.value)}
      />

      <TextField
        label="What did I learn about myself or life today?"
        fullWidth
        multiline
        minRows={2}
        value={whatDidILearn}
        onChange={(e) => onWhatDidILearnChange(e.target.value)}
      />
    </Stack>
  </Box>
);

export default EndOfDayReflection;
