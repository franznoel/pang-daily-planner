"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "@/lib/AuthContext";
import {
  getSharedDailyPlan,
  getSharedDatesWithPlans,
  getUserInfo,
  DailyPlannerDocument,
} from "@/lib/dailyPlannerService";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppBar from "@/components/AppBar";

// Read-only display components
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || "—"}</Typography>
    </Box>
  );
}

function ReadOnlyList({ label, items }: { label: string; items: string[] }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      {items.filter(Boolean).length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {items.filter(Boolean).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No items
        </Typography>
      )}
    </Box>
  );
}

function ReadOnlyHabits({
  label,
  habits,
}: {
  label: string;
  habits: { text: string; checked: boolean }[];
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      {habits.filter((h) => h.text).length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {habits
            .filter((h) => h.text)
            .map((habit, index) => (
              <li
                key={index}
                style={{
                  textDecoration: habit.checked ? "line-through" : "none",
                }}
              >
                {habit.text} {habit.checked ? "✓" : ""}
              </li>
            ))}
        </ul>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No habits
        </Typography>
      )}
    </Box>
  );
}

function ReadOnlyPriorities({
  label,
  priorities,
}: {
  label: string;
  priorities: { text: string; checked: boolean }[];
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      {priorities.filter((p) => p.text).length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {priorities
            .filter((p) => p.text)
            .map((priority, index) => (
              <li
                key={index}
                style={{
                  textDecoration: priority.checked ? "line-through" : "none",
                }}
              >
                {priority.text} {priority.checked ? "✓" : ""}
              </li>
            ))}
        </ul>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No priorities
        </Typography>
      )}
    </Box>
  );
}

function ReadOnlySchedule({
  events,
}: {
  events: { id: string; title: string; start: string; end: string }[];
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Schedule
      </Typography>
      {events.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {events.map((event) => (
            <li key={event.id}>
              {event.start.split("T")[1]?.slice(0, 5) || event.start} -{" "}
              {event.end.split("T")[1]?.slice(0, 5) || event.end}: {event.title}
            </li>
          ))}
        </ul>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No events scheduled
        </Typography>
      )}
    </Box>
  );
}

function SharedPlanViewContent() {
  const params = useParams();
  const userId = params.userId as string;
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [plan, setPlan] = useState<DailyPlannerDocument | null>(null);
  const [datesWithPlans, setDatesWithPlans] = useState<string[]>([]);
  const [ownerDisplayName, setOwnerDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOwnerInfo = useCallback(async () => {
    try {
      const userInfo = await getUserInfo(userId);
      if (userInfo) {
        setOwnerDisplayName(userInfo.displayName?.trim() || userInfo.email?.trim() || userId);
      } else {
        setOwnerDisplayName(userId);
      }
    } catch (err) {
      console.error("Error loading owner info:", err);
      setOwnerDisplayName(userId);
    }
  }, [userId]);

  const loadPlan = useCallback(
    async (dateStr: string) => {
      if (!user?.email) return;

      setLoading(true);
      setError(null);
      try {
        const planData = await getSharedDailyPlan(userId, dateStr, user.email);
        setPlan(planData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load the daily plan. You may not have access."
        );
        setPlan(null);
      } finally {
        setLoading(false);
      }
    },
    [userId, user?.email]
  );

  const loadDatesWithPlans = useCallback(async () => {
    if (!user?.email) return;

    try {
      const dates = await getSharedDatesWithPlans(userId, user.email);
      setDatesWithPlans(dates);
    } catch (err) {
      console.error("Error loading dates:", err);
    }
  }, [userId, user?.email]);

  useEffect(() => {
    if (selectedDate) {
      loadPlan(selectedDate.format("YYYY-MM-DD"));
    }
  }, [selectedDate, loadPlan]);

  useEffect(() => {
    loadDatesWithPlans();
  }, [loadDatesWithPlans]);

  useEffect(() => {
    loadOwnerInfo();
  }, [loadOwnerInfo]);

  const datesWithPlansSet = React.useMemo(
    () => new Set(datesWithPlans),
    [datesWithPlans]
  );

  return (
    <>
      <AppBar title="Shared Daily Planner" showHomeLink />

      <Card sx={{ p: 4, maxWidth: 1200, margin: "auto", mt: 4, mb: 7 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Viewing Shared Plan
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are viewing plans shared by: {ownerDisplayName || userId}
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newDate) => {
                // Only allow selection if newDate is in datesWithPlansSet
                if (newDate && datesWithPlansSet.has(newDate.format("YYYY-MM-DD"))) {
                  setSelectedDate(newDate);
                }
              }}
              format="MMMM D, YYYY"
              slotProps={{ textField: { size: "small" } }}
              slots={{
                day: (dayProps: PickersDayProps) => {
                  const day = dayProps.day as Dayjs | undefined;
                  if (!day) {
                    return null;
                  }
                  const dateStr = day.format("YYYY-MM-DD");
                  const hasRecord = datesWithPlansSet.has(dateStr);
                  const { selected, ...other } = dayProps;
                  const shouldShowBorder = hasRecord && !selected;

                  return (
                    <PickersDay
                      {...other}
                      day={day}
                      selected={selected}
                      disabled={!hasRecord}
                      sx={{
                        border: shouldShowBorder ? "2px solid" : "none",
                        borderColor: shouldShowBorder ? "primary.main" : undefined,
                        borderRadius: "50%",
                        opacity: hasRecord ? 1 : 0.5,
                        cursor: hasRecord ? "pointer" : "not-allowed",
                        "&.Mui-disabled": {
                          opacity: 0.5,
                        },
                      }}
                    />
                  );
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "30vh",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && !plan && (
          <Alert severity="info" sx={{ my: 2 }}>
            No plan found for this date.
          </Alert>
        )}

        {!loading && plan && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {plan.date ? dayjs(plan.date).format("MMMM D, YYYY") : selectedDate?.format("MMMM D, YYYY") || "Today"}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <ReadOnlyField
                    label="Energy Level"
                    value={plan.energyLevel ? `${plan.energyLevel}/10` : ""}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <ReadOnlyField label="Mood" value={plan.mood} />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReadOnlyList label="Grateful For" items={plan.gratefulFor} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReadOnlyList label="Excited About" items={plan.excitedAbout} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReadOnlyList label="People to See" items={plan.peopleToSee} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReadOnlyHabits label="Mind Habits" habits={plan.mindHabits} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReadOnlyHabits label="Body Habits" habits={plan.bodyHabits} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReadOnlyHabits label="Spirit Habits" habits={plan.spiritHabits} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReadOnlyField label="Meals" value={plan.meals} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReadOnlyField label="Water" value={plan.water} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <ReadOnlyField label="Intention" value={plan.intention} />
            <ReadOnlyField label="I Am..." value={plan.iAm} />

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <ReadOnlySchedule events={plan.scheduleEvents} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReadOnlyPriorities
                  label="Top Priorities"
                  priorities={plan.topPriorities}
                />
                <ReadOnlyPriorities
                  label="Professional Priorities"
                  priorities={plan.professionalPriorities}
                />
                <ReadOnlyPriorities
                  label="Personal Priorities"
                  priorities={plan.personalPriorities}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <ReadOnlyField
              label="Infinite Possibilities"
              value={plan.infinitePossibilities}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              End of Day Reflection
            </Typography>
            <ReadOnlyField label="What Inspired Me" value={plan.whatInspiredMe} />
            <ReadOnlyList label="Positive Things" items={plan.positiveThings} />
            <ReadOnlyField label="What Did I Do Well" value={plan.whatDidIDoWell} />
            <ReadOnlyField label="What Did I Learn" value={plan.whatDidILearn} />
          </>
        )}
      </Card>
    </>
  );
}

export default function SharedPlanView() {
  return (
    <ProtectedRoute>
      <SharedPlanViewContent />
    </ProtectedRoute>
  );
}
