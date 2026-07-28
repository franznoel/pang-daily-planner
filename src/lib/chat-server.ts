import { NextRequest, NextResponse } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebase-admin";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4_000;

export class ChatRequestError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 401 | 403 | 404
  ) {
    super(message);
    this.name = "ChatRequestError";
  }
}

export async function authenticateChatRequest(
  request: NextRequest
): Promise<DecodedIdToken> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new ChatRequestError("Authentication is required", 401);
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new ChatRequestError("Authentication is required", 401);
  }

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    throw new ChatRequestError("Invalid or expired authentication token", 401);
  }
}

export async function readChatRequestBody(
  request: NextRequest
): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ChatRequestError("Request body must be a JSON object", 400);
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ChatRequestError) throw error;
    throw new ChatRequestError("Request body must be valid JSON", 400);
  }
}

export function validateChatMessage(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ChatRequestError("Message is required", 400);
  }

  const message = value.trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ChatRequestError(
      `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
      400
    );
  }

  return message;
}

export function validateConversationHistory(value: unknown): ChatMessage[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ChatRequestError("Conversation history must be an array", 400);
  }

  const history = value.slice(-MAX_HISTORY_MESSAGES);
  const isValid = history.every(
    (entry) =>
      entry !== null &&
      typeof entry === "object" &&
      !Array.isArray(entry) &&
      ((entry as { role?: unknown }).role === "user" ||
        (entry as { role?: unknown }).role === "assistant") &&
      typeof (entry as { content?: unknown }).content === "string" &&
      Boolean((entry as { content: string }).content.trim()) &&
      (entry as { content: string }).content.length <= MAX_MESSAGE_LENGTH
  );

  if (!isValid) {
    throw new ChatRequestError("Conversation history is invalid", 400);
  }

  return history.map((entry) => {
    const message = entry as ChatMessage;
    return { role: message.role, content: message.content.trim() };
  });
}

export function chatErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof ChatRequestError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
