"use client";

import { useState, useTransition } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import { createTask, toggleTask, deleteTask, Task } from "@/app/actions/tasks";

interface TaskListProps {
  initialTasks?: Task[];
}

export default function TaskList({ initialTasks = [] }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const formData = new FormData();
    formData.append("title", inputValue);

    startTransition(async () => {
      const newTask = await createTask(formData);
      setTasks((prev) => [...prev, newTask]);
      setInputValue("");
    });
  };

  const handleToggle = (taskId: string) => {
    startTransition(async () => {
      const updatedTask = await toggleTask(taskId);
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: updatedTask.completed } : t))
        );
      }
    });
  };

  const handleDelete = (taskId: string) => {
    startTransition(async () => {
      const success = await deleteTask(taskId);
      if (success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Daily Tasks
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add a new task..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isPending}
        />
        <Button type="submit" variant="contained" disabled={isPending || !inputValue.trim()}>
          {isPending ? <CircularProgress size={20} /> : "Add"}
        </Button>
      </Box>

      <List>
        {tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No tasks yet. Add one above!
          </Typography>
        ) : (
          tasks.map((task) => (
            <ListItem
              key={task.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(task.id)}
                  disabled={isPending}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  disabled={isPending}
                />
              </ListItemIcon>
              <ListItemText
                primary={task.title}
                sx={{
                  textDecoration: task.completed ? "line-through" : "none",
                  color: task.completed ? "text.secondary" : "text.primary",
                }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}
