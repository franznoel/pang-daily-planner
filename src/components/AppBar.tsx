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
import HomeIcon from "@mui/icons-material/Home";
import PaletteIcon from "@mui/icons-material/Palette";
import { useAuth } from "@/lib/AuthContext";
import ShareDialog from "./ShareDialog";
import ThemeDialog from "./ThemeDialog";

interface AppBarProps {
  title?: string;
  showHomeLink?: boolean;
}

export default function AppBar({ title = "Daily Planner", showHomeLink = false }: AppBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
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

  const handleThemeSelect = () => {
    handleClose();
    setThemeDialogOpen(true);
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
          {showHomeLink && (
            <IconButton
              color="inherit"
              onClick={() => router.push("/")}
              aria-label="home"
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
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
                <MenuItem onClick={handleThemeSelect}>
                  <ListItemIcon>
                    <PaletteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Select Theme</ListItemText>
                </MenuItem>
                <Divider />
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
      />
      <ThemeDialog
        open={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
      />
    </>
  );
}
