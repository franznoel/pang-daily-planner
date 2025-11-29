import React from "react";
import { Grid, TextField, Typography, Stack } from "@mui/material";

const ListColumn = ({ title }: { title: string }) => (
  <Stack spacing={1}>
    <Typography fontWeight={600}>{title}</Typography>
    <TextField size="small" fullWidth />
    <TextField size="small" fullWidth />
    <TextField size="small" fullWidth />
  </Stack>
);

const ThreeListSection = () => {
  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <ListColumn title="I am grateful for" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ListColumn title="I am excited about" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ListColumn title="People I want to see" />
      </Grid>
    </Grid>
  );
};

export default ThreeListSection;
