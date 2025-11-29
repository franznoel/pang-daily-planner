import React from "react";
import { Grid, Divider, Card } from "@mui/material";

import HeaderSection from "./HeaderSection";
import ThreeListSection from "./ThreeListSection";
import HabitsSection from "./HabitsSection";
import MealsWaterSection from "./MealsWaterSection";
import IntentionSection from "./IntentionSection";
import IAmSection from "./IAmSection";
import ScheduleSection from "./ScheduleSection";
import PrioritiesSection from "./PrioritiesSection";
import InfinitePossibilitiesSection from "./InfinitePossibilitiesSection";
import EndOfDayReflection from "./EndOfDayReflection";

const DailyPlannerPage: React.FC = () => {
  return (
    <Card sx={{ p: 4, maxWidth: 1200, margin: "auto" }}>
      <HeaderSection />

      <ThreeListSection />

      <Divider sx={{ my: 3 }} />

      <HabitsSection />

      <MealsWaterSection />

      <IntentionSection />

      <IAmSection />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ScheduleSection />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PrioritiesSection />
        </Grid>
      </Grid>

      <InfinitePossibilitiesSection />

      <Divider sx={{ my: 5 }} />

      <EndOfDayReflection />
    </Card>
  );
};

export default DailyPlannerPage;
