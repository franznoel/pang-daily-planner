import React from "react";
import { TextField, Stack } from "@mui/material";

interface MealsWaterSectionProps {
  meals: string;
  water: string;
  onMealsChange: (value: string) => void;
  onWaterChange: (value: string) => void;
}

const MealsWaterSection: React.FC<MealsWaterSectionProps> = ({
  meals,
  water,
  onMealsChange,
  onWaterChange,
}) => (
  <Stack spacing={2} sx={{ mt: 3 }}>
    <TextField
      label="Meals"
      fullWidth
      multiline
      value={meals}
      onChange={(e) => onMealsChange(e.target.value)}
    />
    <TextField
      label="Water"
      fullWidth
      value={water}
      onChange={(e) => onWaterChange(e.target.value)}
    />
  </Stack>
);

export default MealsWaterSection;
