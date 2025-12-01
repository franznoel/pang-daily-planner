"use client";

import DailyPlannerPage from "@/components/DailyPlannerPage";
import AppBar from "@/components/AppBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <AppBar />
      <DailyPlannerPage />
    </ProtectedRoute>
  );
}
