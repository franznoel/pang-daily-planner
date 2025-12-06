"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppBar from "@/components/AppBar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function MyStatusContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load initial summary on mount
  useEffect(() => {
    if (!user?.uid || hasLoadedRef.current) return;

    const loadInitialSummary = async () => {
      hasLoadedRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat/my-status-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load status summary");
        }

        const data = await response.json();
        setMessages([
          {
            role: "assistant",
            content: data.summary,
          },
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load status summary."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialSummary();
  }, [user?.uid]);

  const handleSendMessage = async () => {
    if (!input.trim() || sending || !user?.uid) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Add user message to chat
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const response = await fetch("/api/chat/about-me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          message: userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();

      // Add assistant response to chat
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send message"
      );
      // Remove user message on error
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <AppBar title="My AI Coach" showHomeLink />

      <Card sx={{ p: 0, maxWidth: 900, margin: "auto", mt: 4, mb: 7, height: "70vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => router.push("/")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6">Chat with Your AI Coach</Typography>
            <Typography variant="caption" color="text.secondary">
              Get personalized advice based on your last 5 daily planner entries
            </Typography>
          </Box>
        </Box>

        {/* Messages area */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && messages.length === 0 && (
            <Alert severity="info">
              No messages yet. Start a conversation!
            </Alert>
          )}

          {messages.map((message, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: message.role === "user" ? "primary.light" : "grey.100",
                color: message.role === "user" ? "primary.contrastText" : "text.primary",
                ml: message.role === "user" ? "auto" : 0,
                mr: message.role === "user" ? 0 : "auto",
                maxWidth: "80%",
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </Typography>
            </Paper>
          ))}

          {sending && (
            <Paper
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: "grey.100",
                maxWidth: "80%",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            </Paper>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask about your habits, patterns, or get advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || sending}
              size="small"
              multiline
              maxRows={3}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading || sending}
              sx={{ minWidth: 0, px: 2 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Card>
    </>
  );
}

export default function MyStatus() {
  return (
    <ProtectedRoute>
      <MyStatusContent />
    </ProtectedRoute>
  );
}
