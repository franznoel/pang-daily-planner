"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "@/lib/AuthContext";
import { getSharedWithMe, SharedOwnerDocument } from "@/lib/dailyPlannerService";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppBar from "@/components/AppBar";

function SharedWithMeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [sharedOwners, setSharedOwners] = useState<SharedOwnerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSharedOwners = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);
    try {
      const owners = await getSharedWithMe(user.email);
      setSharedOwners(owners);
    } catch (err) {
      console.error("Error loading shared owners:", err);
      setError("Failed to load shared planners. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadSharedOwners();
  }, [loadSharedOwners]);

  const handleViewPlanner = (ownerId: string) => {
    router.push(`/view/${ownerId}`);
  };

  return (
    <>
      <AppBar title="Shared With Me" showHomeLink />

      <Card sx={{ p: 4, maxWidth: 800, margin: "auto", mt: 4, mb: 7 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Planners Shared With You
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These users have shared their daily planners with you. Click on any to view their plans.
        </Typography>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "20vh",
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

        {!loading && !error && sharedOwners.length === 0 && (
          <Alert severity="info" sx={{ my: 2 }}>
            No planners have been shared with you yet. When someone shares their planner with your email ({user?.email}), it will appear here.
          </Alert>
        )}

        {!loading && sharedOwners.length > 0 && (
          <List>
            {sharedOwners.map((owner) => (
              <ListItem key={owner.ownerId} disablePadding>
                <ListItemButton onClick={() => handleViewPlanner(owner.ownerId)}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={owner.ownerEmail || owner.ownerId}
                    secondary={
                      <>
                        Shared on {new Date(owner.sharedAt).toLocaleDateString()}
                        {owner.type === "global" ? " • Access to all plans" : " • Limited access"}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </>
  );
}

export default function SharedWithMePage() {
  return (
    <ProtectedRoute>
      <SharedWithMeContent />
    </ProtectedRoute>
  );
}
