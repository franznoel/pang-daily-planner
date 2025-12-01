import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
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

// Since the real AppBar uses AuthContext which requires Firebase,
// we create a mock version for Storybook demonstration
interface MockAppBarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
}

const MockAppBar = ({ photoURL, displayName, email }: MockAppBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getAvatarLetter = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Daily Planner
        </Typography>
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
              src={photoURL || undefined}
              alt={displayName || email || "User"}
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
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Shared With Me</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share your planner</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

const meta: Meta<typeof MockAppBar> = {
  title: "Components/AppBar",
  component: MockAppBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MockAppBar>;

export const WithProfilePhoto: Story = {
  args: {
    photoURL: "https://i.pravatar.cc/150?img=12",
    displayName: "John Doe",
    email: "john@example.com",
  },
};

export const WithoutProfilePhoto: Story = {
  args: {
    photoURL: null,
    displayName: "John Doe",
    email: "john@example.com",
  },
};

export const EmailOnlyUser: Story = {
  args: {
    photoURL: null,
    displayName: null,
    email: "jane@example.com",
  },
};
