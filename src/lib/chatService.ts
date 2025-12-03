"use client";

import { getFirebaseAuth } from "./firebase";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UserStatusSummaryResponse {
  success: boolean;
  summary?: string;
  entriesCount?: number;
  error?: string;
}

export interface ChatAboutUserStatusResponse {
  success: boolean;
  response?: string;
  error?: string;
}

/**
 * Get the current user's email from Firebase Auth
 */
async function getUserEmail(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  
  if (!user?.email) {
    throw new Error("User must be authenticated");
  }
  
  return user.email;
}

/**
 * Get an initial summary of a user's status based on their last 30 daily planner entries
 */
export async function getUserStatusSummary(userId: string): Promise<string> {
  const userEmail = await getUserEmail();
  
  const response = await fetch("/api/chat/status-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, userEmail }),
  });

  const data: UserStatusSummaryResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to get user status summary");
  }

  return data.summary || "";
}

/**
 * Chat with ChatGPT about a user's status
 * @param userId - The user whose status is being discussed
 * @param messages - The conversation history (excluding system message)
 */
export async function chatAboutUserStatus(
  userId: string,
  messages: ChatMessage[]
): Promise<string> {
  const userEmail = await getUserEmail();
  
  const response = await fetch("/api/chat/about-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, userEmail, messages }),
  });

  const data: ChatAboutUserStatusResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to get chat response");
  }

  return data.response || "";
}
