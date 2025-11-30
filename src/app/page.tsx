"use client";

import { useState } from "react";
import DailyPlannerPage from "@/components/DailyPlannerPage";
import AppBar from "@/components/AppBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  return (
    <ProtectedRoute>
      <AppBar currentDate={currentDate} />
      <DailyPlannerPage onCurrentDateChange={setCurrentDate} />
    </ProtectedRoute>
  );
}
