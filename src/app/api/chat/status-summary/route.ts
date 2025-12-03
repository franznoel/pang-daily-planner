import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adminDb } from "@/lib/firebase-admin";
import { DailyPlannerDocument } from "@/lib/dailyPlannerService";

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

// Helper function to format plans for AI
function formatPlansForAI(plans: DailyPlannerDocument[]): string {
  return plans
    .map((plan, index) => {
      const entries: string[] = [
        `\n--- Entry ${index + 1}: ${plan.date} ---`,
      ];

      if (plan.energyLevel) entries.push(`Energy Level: ${plan.energyLevel}/10`);
      if (plan.mood) entries.push(`Mood: ${plan.mood}`);
      if (plan.intention) entries.push(`Intention: ${plan.intention}`);
      if (plan.iAm) entries.push(`I Am: ${plan.iAm}`);

      if (plan.gratefulFor?.length > 0) {
        entries.push(`Grateful For: ${plan.gratefulFor.filter(Boolean).join(", ")}`);
      }
      if (plan.excitedAbout?.length > 0) {
        entries.push(`Excited About: ${plan.excitedAbout.filter(Boolean).join(", ")}`);
      }

      // Habits
      const completedMindHabits = plan.mindHabits?.filter((h) => h.text && h.checked).map((h) => h.text) || [];
      const completedBodyHabits = plan.bodyHabits?.filter((h) => h.text && h.checked).map((h) => h.text) || [];
      const completedSpiritHabits = plan.spiritHabits?.filter((h) => h.text && h.checked).map((h) => h.text) || [];

      if (completedMindHabits.length > 0) entries.push(`Completed Mind Habits: ${completedMindHabits.join(", ")}`);
      if (completedBodyHabits.length > 0) entries.push(`Completed Body Habits: ${completedBodyHabits.join(", ")}`);
      if (completedSpiritHabits.length > 0) entries.push(`Completed Spirit Habits: ${completedSpiritHabits.join(", ")}`);

      // Priorities
      const completedTopPriorities = plan.topPriorities?.filter((p) => p.text && p.checked).map((p) => p.text) || [];
      if (completedTopPriorities.length > 0) {
        entries.push(`Completed Priorities: ${completedTopPriorities.join(", ")}`);
      }

      // Reflection
      if (plan.whatInspiredMe) entries.push(`What Inspired Me: ${plan.whatInspiredMe}`);
      if (plan.whatDidIDoWell) entries.push(`What I Did Well: ${plan.whatDidIDoWell}`);
      if (plan.whatDidILearn) entries.push(`What I Learned: ${plan.whatDidILearn}`);

      return entries.join("\n");
    })
    .join("\n");
}
