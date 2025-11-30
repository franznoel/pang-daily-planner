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
  AppBar as MuiAppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "@/lib/AuthContext";
import { getSharedWithMe, SharedOwnerDocument } from "@/lib/dailyPlannerService";
import ProtectedRoute from "@/components/ProtectedRoute";

function SharedWithMeContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sharedOwners, setSharedOwners] = useState<SharedOwnerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

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

  const displayName = user?.displayName || user?.email || "User";

  return (
    <>
      <MuiAppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => router.push("/")}
            aria-label="home"
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Shared With Me
          </Typography>
          {user && (
            <Box>
              <Button
                id="user-menu-button"
                color="inherit"
                onClick={handleClick}
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                {displayName}
              </Button>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "user-menu-button",
                }}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </MuiAppBar>

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
