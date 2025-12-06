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
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    // Get last 5 daily plans for the current user
    const plans = await getLast5Plans(userId);

    // Log plans temporarily if not in production
    if (process.env.NODE_ENV !== "production") {
      console.log(`[my-status-summary] Fetched ${plans.length} plans for user ${userId}`);
      console.log("[my-status-summary] Plans data:", JSON.stringify(plans, null, 2));
    }

    if (plans.length === 0) {
      return NextResponse.json(
        { error: "No daily plans found" },
        { status: 404 }
      );
    }

    // Get user info
    const userInfo = await getUserInfo(userId);
    const userName = userInfo?.displayName || userInfo?.email || "You";

    // Format plans data for ChatGPT
    const plansData = formatPlansForAI(plans);

    // Log formatted plans data if not in production
    if (process.env.NODE_ENV !== "production") {
      console.log("[my-status-summary] Formatted plans for AI:");
      console.log(plansData);
    }

    // Create prompt for ChatGPT
    const prompt = `You are an AI coach analyzing daily planner entries. Below are the last ${plans.length} daily planner entries. Please provide a comprehensive analysis and advice.

${plansData}

Please provide:
1. Overall status and well-being summary
2. Common habits and patterns you've observed
3. Mood and energy level trends
4. Key priorities and goals you're working on
5. Areas of focus (personal, professional, etc.)
6. Insights and advice for improvement
7. Strengths to continue leveraging
8. Potential areas for growth or adjustment

Keep the summary conversational, supportive, and actionable - as if you're a personal coach who wants to help achieve goals and maintain well-being.`;

    // Call OpenAI API
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive and insightful AI personal coach analyzing daily planner entries to provide helpful summaries, insights, and actionable advice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
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

// Helper function to get last 5 plans
async function getLast5Plans(userId: string): Promise<DailyPlannerDocument[]> {
  try {
    const plansSnapshot = await adminDb
      .collection("user")
      .doc(userId)
      .collection("daily-plans")
      .orderBy("date", "desc")
      .limit(5)
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
