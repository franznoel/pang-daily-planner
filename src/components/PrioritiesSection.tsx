import React from "react";
import { Typography, Stack, Checkbox, TextField } from "@mui/material";

const BoxList = ({ title }: { title: string }) => (
  <Stack spacing={1} sx={{ mt: 2 }}>
    <Typography fontWeight={600}>{title}</Typography>
    {[1,2,3].map(i => (
      <Stack direction="row" alignItems="center" spacing={1} key={i}>
        <Checkbox />
        <TextField fullWidth size="small" />
      </Stack>
    ))}
  </Stack>
);

const PrioritiesSection = () => (
  <Stack>
    <BoxList title="Top Priorities" />
    <BoxList title="Professional" />
    <BoxList title="Personal" />
  </Stack>
);

export default PrioritiesSection;
