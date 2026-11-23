"use client";

import DailyPlannerPage from "@/components/DailyPlannerPage";
import AppBar from "@/components/AppBar";
import ProtectedRoute from "@/components/ProtectedRoute";

import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <AppBar />
      <DailyPlannerPage key={user?.uid} />
    </ProtectedRoute>
  );
}
