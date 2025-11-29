"use client";

import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useAuth } from "@/lib/AuthContext";
import ShareDialog from "./ShareDialog";

interface AppBarProps {
  currentDate?: string | null;
}

export default function AppBar({ currentDate }: AppBarProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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

  const displayName = user?.displayName || user?.email || "User";

  return (
    <>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Daily Planner
          </Typography>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Share your planner">
                <IconButton
                  color="inherit"
                  onClick={() => setShareDialogOpen(true)}
                  aria-label="share"
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
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
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        currentDate={currentDate ?? null}
      />
    </>
  );
}
