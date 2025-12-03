"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme } from "@/lib/ThemeContext";
import { themes, ThemeId } from "@/lib/themes";

interface ThemeDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ThemeDialog({ open, onClose }: ThemeDialogProps) {
  const { themeId, setThemeId } = useTheme();

  const handleThemeSelect = (id: ThemeId) => {
    setThemeId(id);
    onClose();
  };

  // Group themes by category
  const classicThemes = themes.filter((t) => t.category === "Classic");
  const generationThemes = themes.filter((t) => t.category === "Generation");
  const identityThemes = themes.filter((t) => t.category === "Identity");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaletteIcon />
          <Typography variant="h6">Choose Your Theme</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Classic Themes
        </Typography>
        <List>
          {classicThemes.map((theme) => (
            <ListItem key={theme.id} disablePadding>
              <ListItemButton
                onClick={() => handleThemeSelect(theme.id)}
                selected={themeId === theme.id}
              >
                <ListItemIcon>
                  {themeId === theme.id ? (
                    <CheckCircleIcon color="primary" />
                  ) : (
                    <PaletteIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={theme.name}
                  secondary={theme.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Generation Themes
        </Typography>
        <List>
          {generationThemes.map((theme) => (
            <ListItem key={theme.id} disablePadding>
              <ListItemButton
                onClick={() => handleThemeSelect(theme.id)}
                selected={themeId === theme.id}
              >
                <ListItemIcon>
                  {themeId === theme.id ? (
                    <CheckCircleIcon color="primary" />
                  ) : (
                    <PaletteIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={theme.name}
                  secondary={theme.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Identity Themes
        </Typography>
        <List>
          {identityThemes.map((theme) => (
            <ListItem key={theme.id} disablePadding>
              <ListItemButton
                onClick={() => handleThemeSelect(theme.id)}
                selected={themeId === theme.id}
              >
                <ListItemIcon>
                  {themeId === theme.id ? (
                    <CheckCircleIcon color="primary" />
                  ) : (
                    <PaletteIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={theme.name}
                  secondary={theme.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
