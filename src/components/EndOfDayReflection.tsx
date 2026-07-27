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
    <Typography variant="h5" fontWeight={750} gutterBottom>
      End of Day Reflection
    </Typography>

    <Stack spacing={1.25}>
      <TextField
        label="What inspired me today?"
        fullWidth
        multiline
        minRows={1}
        value={whatInspiredMe}
        onChange={(e) => onWhatInspiredMeChange(e.target.value)}
      />

      <Typography fontWeight={700} fontSize="0.82rem" color="text.secondary">Three positive things</Typography>
      <Stack spacing={0.75}>
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
        minRows={1}
        value={whatDidIDoWell}
        onChange={(e) => onWhatDidIDoWellChange(e.target.value)}
      />

      <TextField
        label="What did I learn about myself or life today?"
        fullWidth
        multiline
        minRows={1}
        value={whatDidILearn}
        onChange={(e) => onWhatDidILearnChange(e.target.value)}
      />
    </Stack>
  </Box>
);

export default EndOfDayReflection;
