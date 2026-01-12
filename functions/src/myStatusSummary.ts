import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import { formatPlansForAI, getOpenAIApiKey } from "./lib/ai-utils";
import type { DailyPlannerDocument, UserInfoDocument } from "./lib/types";

// Get shared admin instance
const db = admin.firestore();

// Lazy initialize OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    apiKey: getOpenAIApiKey(),
  });
}

/**
 * Cloud Function: myStatusSummary
 * Generate personal status summary based on user's recent plans
 */
export const myStatusSummary = functions.https.onRequest(
  {
    timeoutSeconds: 60,
    secrets: ["OPENAI_API_KEY_DEV", "OPENAI_API_KEY_PROD", "APP_ENV"],
    cors: true,
  },
  async (request, response) => {
    // Only allow POST requests
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { userId } = request.body;

      if (!userId) {
        response.status(400).json({
          error: "Missing required field: userId",
        });
        return;
      }

      // Get last 5 daily plans for the current user
      const plansSnapshot = await db
        .collection("user")
        .doc(userId)
        .collection("daily-plans")
        .orderBy("date", "desc")
        .limit(5)
        .get();

      const plans = plansSnapshot.docs.map(
        (doc) => doc.data() as DailyPlannerDocument
      );

      // Log plans temporarily if not in production
      if (process.env.APP_ENV !== "production") {
        console.log(
          `[my-status-summary] Fetched ${plans.length} plans for user ${userId}`
        );
        console.log(
          "[my-status-summary] Plans data:",
          JSON.stringify(plans, null, 2)
        );
      }

      if (plans.length === 0) {
        response.status(404).json({ error: "No daily plans found" });
        return;
      }

      // Get user info
      const userDoc = await db.collection("user").doc(userId).get();
      const userInfo = userDoc.exists
        ? (userDoc.data() as UserInfoDocument)
        : null;
      const userName =
        userInfo?.displayName || userInfo?.email || "You";

      // Format plans data for ChatGPT
      const plansData = formatPlansForAI(plans);

      // Log formatted plans data if not in production
      if (process.env.APP_ENV !== "production") {
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

      const summary =
        completion.choices[0]?.message?.content || "No summary available";

      response.json({
        summary,
        planCount: plans.length,
        userName,
      });
    } catch (error) {
      console.error("Error in myStatusSummary function:", error);
      response.status(500).json({ error: "Failed to generate status summary" });
    }
  }
);
