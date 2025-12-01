"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/lib/AuthContext";
import ShareDialog from "./ShareDialog";

interface AppBarProps {
  currentDate?: string | null;
}

export default function AppBar({ currentDate }: AppBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const handleSharedWithMe = () => {
    handleClose();
    router.push("/shared");
  };

  const handleSharePlanner = () => {
    handleClose();
    setShareDialogOpen(true);
  };

  // Get the first letter of the display name or email for fallback avatar
  const getAvatarLetter = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Daily Planner
          </Typography>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                id="user-menu-button"
                onClick={handleClick}
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={user.photoURL || undefined}
                  alt={user.displayName || user.email || "User"}
                  sx={{ width: 36, height: 36, bgcolor: "secondary.main" }}
                >
                  {getAvatarLetter()}
                </Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "user-menu-button",
                }}
              >
                <MenuItem onClick={handleSharedWithMe}>
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Shared With Me</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSharePlanner}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share your planner</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
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
