import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adminDb } from "@/lib/firebase-admin";
import { DailyPlannerDocument } from "@/lib/dailyPlannerService";
import { formatPlansForAI } from "@/lib/ai-utils";

// Lazy initialize OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, viewerEmail } = await request.json();

    if (!userId || !viewerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: userId and viewerEmail" },
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

    // Get last 30 daily plans
    const plans = await getLast30Plans(userId);

    // Log plans temporarily if not in production
    if (process.env.NODE_ENV !== "production") {
      console.log(`[status-summary] Fetched ${plans.length} plans for user ${userId}`);
      console.log("[status-summary] Plans data:", JSON.stringify(plans, null, 2));
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

    // Format plans data for ChatGPT
    const plansData = formatPlansForAI(plans);

    // Log formatted plans data if not in production
    if (process.env.NODE_ENV !== "production") {
      console.log("[status-summary] Formatted plans for AI:");
      console.log(plansData);
    }

    // Create prompt for ChatGPT
    const prompt = `You are an AI assistant analyzing a user's daily planner entries. Below are the last ${plans.length} daily planner entries for ${userName}. Please provide a comprehensive summary of their status, habits, mood patterns, priorities, and overall well-being.

${plansData}

Please provide:
1. Overall status and well-being summary
2. Common habits and patterns
3. Mood and energy level trends
4. Key priorities and goals
5. Areas of focus (personal, professional, etc.)
6. Any notable patterns or insights

Keep the summary conversational and insightful, as if you're a supportive coach who understands their journey.`;

    // Call OpenAI API
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive and insightful AI coach analyzing daily planner entries to provide helpful summaries and insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || "No summary available";

    return NextResponse.json({
      summary,
      planCount: plans.length,
      userName,
    });
  } catch (error) {
    console.error("Error generating status summary:", error);
    return NextResponse.json(
      { error: "Failed to generate status summary" },
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

// Helper function to get last 30 plans
async function getLast30Plans(userId: string): Promise<DailyPlannerDocument[]> {
  try {
    const plansSnapshot = await adminDb
      .collection("user")
      .doc(userId)
      .collection("daily-plans")
      .orderBy("date", "desc")
      .limit(30)
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
