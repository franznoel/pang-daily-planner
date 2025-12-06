"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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

function ChatStatusContent() {
  const params = useParams();
  const userId = params.userId as string;
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
    if (!user?.email || hasLoadedRef.current) return;

    const loadInitialSummary = async () => {
      hasLoadedRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat/status-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            viewerEmail: user.email,
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
            : "Failed to load status summary. You may not have access."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialSummary();
  }, [userId, user?.email]);

  const handleSendMessage = async () => {
    if (!input.trim() || sending || !user?.email) return;

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
      const response = await fetch("/api/chat/about-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          viewerEmail: user.email,
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
      <AppBar title="AI Status Chat" showHomeLink />

      <Card sx={{ p: 0, maxWidth: 900, margin: "auto", mt: 4, mb: 7, height: "70vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => router.push(`/view/${userId}`)} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6">Chat with AI</Typography>
            <Typography variant="caption" color="text.secondary">
              Ask questions about this user&apos;s status and habits
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
              placeholder="Ask about habits, mood, priorities..."
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

export default function ChatStatus() {
  return (
    <ProtectedRoute>
      <ChatStatusContent />
    </ProtectedRoute>
  );
}
