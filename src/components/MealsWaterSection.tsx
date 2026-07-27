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
  <Stack spacing={1} sx={{ p: 1.5, height: "100%", bgcolor: "action.hover", borderRadius: 2 }}>
    <TextField
      label="Meals"
      fullWidth
      multiline
      minRows={1}
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
