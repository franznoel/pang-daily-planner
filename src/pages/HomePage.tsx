import DailyPlannerPage from "@/components/DailyPlannerPage";
import AppBar from "@/components/AppBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <AppBar />
      <DailyPlannerPage />
    </ProtectedRoute>
  );
}
