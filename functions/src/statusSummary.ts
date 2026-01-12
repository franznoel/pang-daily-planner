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
 * Cloud Function: statusSummary
 * Generate status summary for other users (with permission check)
 */
export const statusSummary = functions.https.onRequest(
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
      const { userId, viewerEmail } = request.body;

      if (!userId || !viewerEmail) {
        response.status(400).json({
          error: "Missing required fields: userId and viewerEmail",
        });
        return;
      }

      // Verify viewer has access
      const viewerDoc = await db
        .collection("user")
        .doc(userId)
        .collection("viewers")
        .doc(viewerEmail)
        .get();

      if (!viewerDoc.exists) {
        response.status(403).json({
          error: "You do not have permission to view this user's data",
        });
        return;
      }

      // Get last 1 daily plan
      const plansSnapshot = await db
        .collection("user")
        .doc(userId)
        .collection("daily-plans")
        .orderBy("date", "desc")
        .limit(1)
        .get();

      const plans = plansSnapshot.docs.map(
        (doc) => doc.data() as DailyPlannerDocument
      );

      // Log plans temporarily if not in production
      if (process.env.APP_ENV !== "production") {
        console.log(
          `[status-summary] Fetched ${plans.length} plans for user ${userId}`
        );
        console.log(
          "[status-summary] Plans data:",
          JSON.stringify(plans, null, 2)
        );
      }

      if (plans.length === 0) {
        response
          .status(404)
          .json({ error: "No daily plans found for this user" });
        return;
      }

      // Get user info
      const userDoc = await db.collection("user").doc(userId).get();
      const userInfo = userDoc.exists
        ? (userDoc.data() as UserInfoDocument)
        : null;
      const userName =
        userInfo?.displayName || userInfo?.email || userId;

      // Format plans data for ChatGPT
      const plansData = formatPlansForAI(plans);

      // Log formatted plans data if not in production
      if (process.env.APP_ENV !== "production") {
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

      const summary =
        completion.choices[0]?.message?.content || "No summary available";

      response.json({
        summary,
        planCount: plans.length,
        userName,
      });
    } catch (error) {
      console.error("Error in statusSummary function:", error);
      response.status(500).json({ error: "Failed to generate status summary" });
    }
  }
);
