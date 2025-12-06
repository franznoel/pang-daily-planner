import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adminDb } from "@/lib/firebase-admin";
import { DailyPlannerDocument } from "@/lib/dailyPlannerService";
import { formatPlansForAI } from "@/lib/ai-utils";

// Set max duration to 60 seconds
export const maxDuration = 60;

// Lazy initialize OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, viewerEmail, message, conversationHistory } = await request.json();

    if (!userId || !viewerEmail || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, viewerEmail, and message" },
        { status: 400 }
      );
    }

    // Verify viewer has access
    const hasAccess = await checkViewerAccess(userId, viewerEmail);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to view this user's data" },
        { status: 403 }
      );
    }

    // Get last 1 daily plan (cached context)
    const plans = await getLast1Plan(userId);

    // Log plans temporarily if not in production
    if (process.env.NODE_ENV !== "production") {
      console.log(`[about-user] Fetched ${plans.length} plans for user ${userId}`);
      console.log("[about-user] Plans data:", JSON.stringify(plans, null, 2));
    }

    if (plans.length === 0) {
      return NextResponse.json(
        { error: "No daily plans found for this user" },
        { status: 404 }
      );
    }

    // Get user info
    const userInfo = await getUserInfo(userId);
    const userName = userInfo?.displayName || userInfo?.email || userId;

    // Format plans data for ChatGPT context
    const plansData = formatPlansForAI(plans);

    // Log formatted plans data if not in production
    if (process.env.NODE_ENV !== "production") {
      console.log("[about-user] Formatted plans for AI:");
      console.log(plansData);
    }

    // Build conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a supportive and insightful AI assistant helping someone understand another person's status and well-being based on their daily planner entries. 

Here are the last ${plans.length} daily planner entries for ${userName}:

${plansData}

Use this information to answer questions about ${userName}'s habits, mood, priorities, and overall well-being. Be conversational, empathetic, and provide insights based on the data you have.`,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add the new user message
    messages.push({
      role: "user",
      content: message,
    });

    // Call OpenAI API
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({
      reply,
      userName,
    });
  } catch (error) {
    console.error("Error in chat about user:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

// Helper function to check viewer access
async function checkViewerAccess(
  ownerUserId: string,
  viewerEmail: string
): Promise<boolean> {
  try {
    // Check global viewer access
    const viewerDoc = await adminDb
      .collection("user")
      .doc(ownerUserId)
      .collection("viewers")
      .doc(viewerEmail)
      .get();

    return viewerDoc.exists;
  } catch (error) {
    console.error("Error checking viewer access:", error);
    return false;
  }
}

// Helper function to get last 1 plan
async function getLast1Plan(userId: string): Promise<DailyPlannerDocument[]> {
  try {
    const plansSnapshot = await adminDb
      .collection("user")
      .doc(userId)
      .collection("daily-plans")
      .orderBy("date", "desc")
      .limit(1)
      .get();

    return plansSnapshot.docs.map((doc) => doc.data() as DailyPlannerDocument);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

// Helper function to get user info
async function getUserInfo(userId: string): Promise<{ email?: string; displayName?: string } | null> {
  try {
    const userDoc = await adminDb.collection("user").doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data() as { email?: string; displayName?: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}
