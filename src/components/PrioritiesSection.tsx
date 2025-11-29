import React from "react";
import { Typography, Stack, Checkbox, TextField } from "@mui/material";
import { PriorityItem } from "./DailyPlannerPage";

interface BoxListProps {
  title: string;
  priorities: PriorityItem[];
  onTextChange: (index: number, text: string) => void;
  onCheckedChange: (index: number, checked: boolean) => void;
}

const BoxList: React.FC<BoxListProps> = ({
  title,
  priorities,
  onTextChange,
  onCheckedChange,
}) => (
  <Stack spacing={1} sx={{ mt: 2 }}>
    <Typography fontWeight={600}>{title}</Typography>
    {priorities.map((priority, index) => (
      <Stack direction="row" alignItems="center" spacing={1} key={index}>
        <Checkbox
          checked={priority.checked}
          onChange={(e) => onCheckedChange(index, e.target.checked)}
        />
        <TextField
          fullWidth
          size="small"
          value={priority.text}
          onChange={(e) => onTextChange(index, e.target.value)}
        />
      </Stack>
    ))}
  </Stack>
);

interface PrioritiesSectionProps {
  topPriorities: PriorityItem[];
  professionalPriorities: PriorityItem[];
  personalPriorities: PriorityItem[];
  onTopPriorityTextChange: (index: number, text: string) => void;
  onTopPriorityCheckedChange: (index: number, checked: boolean) => void;
  onProfessionalPriorityTextChange: (index: number, text: string) => void;
  onProfessionalPriorityCheckedChange: (index: number, checked: boolean) => void;
  onPersonalPriorityTextChange: (index: number, text: string) => void;
  onPersonalPriorityCheckedChange: (index: number, checked: boolean) => void;
}

const PrioritiesSection: React.FC<PrioritiesSectionProps> = ({
  topPriorities,
  professionalPriorities,
  personalPriorities,
  onTopPriorityTextChange,
  onTopPriorityCheckedChange,
  onProfessionalPriorityTextChange,
  onProfessionalPriorityCheckedChange,
  onPersonalPriorityTextChange,
  onPersonalPriorityCheckedChange,
}) => (
  <Stack>
    <BoxList
      title="Top Priorities"
      priorities={topPriorities}
      onTextChange={onTopPriorityTextChange}
      onCheckedChange={onTopPriorityCheckedChange}
    />
    <BoxList
      title="Professional"
      priorities={professionalPriorities}
      onTextChange={onProfessionalPriorityTextChange}
      onCheckedChange={onProfessionalPriorityCheckedChange}
    />
    <BoxList
      title="Personal"
      priorities={personalPriorities}
      onTextChange={onPersonalPriorityTextChange}
      onCheckedChange={onPersonalPriorityCheckedChange}
    />
  </Stack>
);

export default PrioritiesSection;
