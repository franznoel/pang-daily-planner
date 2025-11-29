import React from "react";
import { Box, TextField, Typography, Stack } from "@mui/material";

const EndOfDayReflection = () => (
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
      />

      <Typography fontWeight={600}>List 3 positive things:</Typography>
      <Stack spacing={1}>
        <TextField size="small" />
        <TextField size="small" />
        <TextField size="small" />
      </Stack>

      <TextField
        label="What did I do well today? Where did I make progress?"
        fullWidth
        multiline
        minRows={2}
      />

      <TextField
        label="What did I learn about myself or life today?"
        fullWidth
        multiline
        minRows={2}
      />
    </Stack>
  </Box>
);

export default EndOfDayReflection;
