import React from "react";
import { TextField, Stack } from "@mui/material";

const MealsWaterSection = () => (
  <Stack spacing={2} sx={{ mt: 3 }}>
    <TextField label="Meals" fullWidth multiline />
    <TextField label="Water" fullWidth />
  </Stack>
);

export default MealsWaterSection;
