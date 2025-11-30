"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useAuth } from "@/lib/AuthContext";
import {
  addGlobalViewer,
  removeGlobalViewer,
  getGlobalViewers,
  addDailyPlanViewer,
  removeDailyPlanViewer,
  getDailyPlanViewers,
  ViewerDocument,
} from "@/lib/dailyPlannerService";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  currentDate: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`share-tabpanel-${index}`}
      aria-labelledby={`share-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ShareDialog({ open, onClose, currentDate }: ShareDialogProps) {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [globalViewers, setGlobalViewers] = useState<ViewerDocument[]>([]);
  const [dailyPlanViewers, setDailyPlanViewers] = useState<ViewerDocument[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadViewers = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const global = await getGlobalViewers(user.uid);
      setGlobalViewers(global);
      
      if (currentDate) {
        const daily = await getDailyPlanViewers(user.uid, currentDate);
        setDailyPlanViewers(daily);
      }
    } catch (err) {
      console.error("Error loading viewers:", err);
      setError("Failed to load viewers. Please try closing and reopening this dialog.");
    } finally {
      setLoading(false);
    }
  }, [user, currentDate]);

  useEffect(() => {
    if (open) {
      loadViewers();
    }
  }, [open, loadViewers]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddGlobalViewer = async () => {
    if (!user || !newEmail.trim()) return;
    
    if (!validateEmail(newEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addGlobalViewer(user.uid, newEmail.trim(), user.email || undefined);
      setSuccess(`${newEmail.trim()} can now view all your daily plans`);
      setNewEmail("");
      await loadViewers();
    } catch (err) {
      console.error("Error adding viewer:", err);
      setError("Failed to add viewer. Please check the email address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGlobalViewer = async (email: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      await removeGlobalViewer(user.uid, email);
      await loadViewers();
    } catch (err) {
      console.error("Error removing viewer:", err);
      setError("Failed to remove viewer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDailyPlanViewer = async () => {
    if (!user || !currentDate || !newEmail.trim()) return;
    
    if (!validateEmail(newEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addDailyPlanViewer(user.uid, currentDate, newEmail.trim());
      setSuccess(`${newEmail.trim()} can now view your plan for ${currentDate}`);
      setNewEmail("");
      await loadViewers();
    } catch (err) {
      console.error("Error adding viewer:", err);
      setError("Failed to add viewer. Please check the email address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDailyPlanViewer = async (email: string) => {
    if (!user || !currentDate) return;
    
    setLoading(true);
    setError(null);
    try {
      await removeDailyPlanViewer(user.uid, currentDate, email);
      await loadViewers();
    } catch (err) {
      console.error("Error removing viewer:", err);
      setError("Failed to remove viewer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
    setNewEmail("");
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setNewEmail("");
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Your Daily Planner</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="share tabs">
          <Tab label="Share All Plans" id="share-tab-0" aria-controls="share-tabpanel-0" />
          <Tab 
            label={`Share Today (${currentDate || 'N/A'})`} 
            id="share-tab-1" 
            aria-controls="share-tabpanel-1"
            disabled={!currentDate}
          />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            People you add here can view all your daily plans when they sign in.
          </Typography>
          
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="Email address"
              type="email"
              size="small"
              fullWidth
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddGlobalViewer()}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={handleAddGlobalViewer}
              disabled={loading || !newEmail.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
            >
              Add
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            People with access to all plans
          </Typography>
          
          {loading && globalViewers.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : globalViewers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No one has access to your plans yet.
            </Typography>
          ) : (
            <List dense>
              {globalViewers.map((viewer) => (
                <ListItem key={viewer.email}>
                  <ListItemText 
                    primary={viewer.email}
                    secondary={`Added ${new Date(viewer.addedAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="remove"
                      onClick={() => handleRemoveGlobalViewer(viewer.email)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            People you add here can only view your plan for {currentDate}.
          </Typography>
          
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="Email address"
              type="email"
              size="small"
              fullWidth
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddDailyPlanViewer()}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={handleAddDailyPlanViewer}
              disabled={loading || !newEmail.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
            >
              Add
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            People with access to this day&apos;s plan
          </Typography>
          
          {loading && dailyPlanViewers.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : dailyPlanViewers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No one has specific access to this day&apos;s plan.
            </Typography>
          ) : (
            <List dense>
              {dailyPlanViewers.map((viewer) => (
                <ListItem key={viewer.email}>
                  <ListItemText 
                    primary={viewer.email}
                    secondary={`Added ${new Date(viewer.addedAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="remove"
                      onClick={() => handleRemoveDailyPlanViewer(viewer.email)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
