import React from "react";
import { Grid, TextField, Typography, Stack } from "@mui/material";

interface ListColumnProps {
  title: string;
  values: string[];
  onChange: (index: number, value: string) => void;
}

const ListColumn: React.FC<ListColumnProps> = ({ title, values, onChange }) => (
  <Stack spacing={1}>
    <Typography fontWeight={600}>{title}</Typography>
    {values.map((value, index) => (
      <TextField
        key={index}
        size="small"
        fullWidth
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
      />
    ))}
  </Stack>
);

interface ThreeListSectionProps {
  gratefulFor: string[];
  excitedAbout: string[];
  peopleToSee: string[];
  onGratefulForChange: (index: number, value: string) => void;
  onExcitedAboutChange: (index: number, value: string) => void;
  onPeopleToSeeChange: (index: number, value: string) => void;
}

const ThreeListSection: React.FC<ThreeListSectionProps> = ({
  gratefulFor,
  excitedAbout,
  peopleToSee,
  onGratefulForChange,
  onExcitedAboutChange,
  onPeopleToSeeChange,
}) => {
  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <ListColumn
          title="I am grateful for"
          values={gratefulFor}
          onChange={onGratefulForChange}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ListColumn
          title="I am excited about"
          values={excitedAbout}
          onChange={onExcitedAboutChange}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ListColumn
          title="People I want to see"
          values={peopleToSee}
          onChange={onPeopleToSeeChange}
        />
      </Grid>
    </Grid>
  );
};

export default ThreeListSection;
