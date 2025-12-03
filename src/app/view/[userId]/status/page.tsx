"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Alert,
  TextField,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "@/lib/AuthContext";
import { getUserInfo } from "@/lib/dailyPlannerService";
import {
  getUserStatusSummary,
  chatAboutUserStatus,
  ChatMessage,
} from "@/lib/chatService";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppBar from "@/components/AppBar";

interface DisplayMessage extends ChatMessage {
  id: string;
}

function UserStatusChatContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user } = useAuth();

  const [ownerDisplayName, setOwnerDisplayName] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load owner info
  useEffect(() => {
    const loadOwnerInfo = async () => {
      try {
        const userInfo = await getUserInfo(userId);
        if (userInfo) {
          setOwnerDisplayName(
            userInfo.displayName?.trim() ||
              userInfo.email?.trim() ||
              userId
          );
        } else {
          setOwnerDisplayName(userId);
        }
      } catch (err) {
        console.error("Error loading owner info:", err);
        setOwnerDisplayName(userId);
      }
    };

    loadOwnerInfo();
  }, [userId]);

  // Load initial summary on mount
  useEffect(() => {
    const loadInitialSummary = async () => {
      if (!user?.email) return;

      setLoading(true);
      setError(null);
      try {
        const summary = await getUserStatusSummary(userId);
        setMessages([
          {
            id: Date.now().toString(),
            role: "assistant",
            content: summary,
          },
        ]);
      } catch (err) {
        console.error("Error loading initial summary:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load user status. You may not have access."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialSummary();
  }, [userId, user?.email]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setSending(true);
    setError(null);

    try {
      // Prepare messages for API (convert to ChatMessage format)
      const apiMessages: ChatMessage[] = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      apiMessages.push({
        role: userMessage.role,
        content: userMessage.content,
      });

      const response = await chatAboutUserStatus(userId, apiMessages);

      const assistantMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again."
      );
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
      <AppBar title="User Status Chat" showHomeLink />

      <Card sx={{ p: 4, maxWidth: 1000, margin: "auto", mt: 4, mb: 7 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={() => router.push(`/view/${userId}`)}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight={600}>
              Chat About User Status
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Discussing status of: {ownerDisplayName || userId}
          </Typography>
        </Box>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "40vh",
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

        {!loading && (
          <>
            {/* Messages Container */}
            <Box
              sx={{
                height: "500px",
                overflowY: "auto",
                mb: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.default",
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent:
                      message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: "80%",
                      backgroundColor:
                        message.role === "user" ? "primary.main" : "grey.100",
                      color: message.role === "user" ? "white" : "text.primary",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 0.5,
                        fontWeight: 600,
                        opacity: 0.8,
                      }}
                    >
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {sending && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mb: 2,
                  }}
                >
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: "grey.100" }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about the user's status, habits, or patterns..."
                disabled={sending}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sending}
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            </Box>
          </>
        )}
      </Card>
    </>
  );
}

export default function UserStatusChat() {
  return (
    <ProtectedRoute>
      <UserStatusChatContent />
    </ProtectedRoute>
  );
}
