"use client";

import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "./firebase";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UserStatusSummaryResponse {
  success: boolean;
  summary: string;
  entriesCount: number;
}

export interface ChatAboutUserStatusResponse {
  success: boolean;
  response: string;
}

/**
 * Get an initial summary of a user's status based on their last 30 daily planner entries
 */
export async function getUserStatusSummary(userId: string): Promise<string> {
  const functions = getFirebaseFunctions();
  
  const getUserStatusSummaryFn = httpsCallable<
    { userId: string },
    UserStatusSummaryResponse
  >(functions, "getUserStatusSummary");
  
  const result = await getUserStatusSummaryFn({ userId });
  
  if (!result.data.success) {
    throw new Error("Failed to get user status summary");
  }
  
  return result.data.summary;
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
  const functions = getFirebaseFunctions();
  
  const chatAboutUserStatusFn = httpsCallable<
    { userId: string; messages: ChatMessage[] },
    ChatAboutUserStatusResponse
  >(functions, "chatAboutUserStatus");
  
  const result = await chatAboutUserStatusFn({ userId, messages });
  
  if (!result.data.success) {
    throw new Error("Failed to get chat response");
  }
  
  return result.data.response;
}
