import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import { formatPlansForAI, getOpenAIApiKey } from "./lib/ai-utils";
import type { DailyPlannerDocument, UserInfoDocument } from "./lib/types";

// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Lazy initialize OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    apiKey: getOpenAIApiKey(),
  });
}

/**
 * Cloud Function: about-me
 * Personal AI coach for self-reflection based on user's daily plans
 */
export const aboutMe = functions.https.onRequest(
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
      const { userId, message, conversationHistory } = request.body;

      if (!userId || !message) {
        response.status(400).json({
          error: "Missing required fields: userId and message",
        });
        return;
      }

      // Get last 5 daily plans
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
          `[about-me] Fetched ${plans.length} plans for user ${userId}`
        );
        console.log("[about-me] Plans data:", JSON.stringify(plans, null, 2));
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

      // Format plans data for ChatGPT context
      const plansData = formatPlansForAI(plans);

      // Log formatted plans data if not in production
      if (process.env.APP_ENV !== "production") {
        console.log("[about-me] Formatted plans for AI:");
        console.log(plansData);
      }

      // Build conversation messages
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are a supportive and insightful AI personal coach helping someone understand their own habits, patterns, and well-being based on their daily planner entries. 

Here are the last ${plans.length} daily planner entries:

${plansData}

Use this information to provide personalized advice, answer questions, and offer insights about habits, mood, priorities, and overall well-being. Be conversational, empathetic, supportive, and provide actionable advice based on the data you have.`,
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
        max_tokens: 700,
      });

      const reply =
        completion.choices[0]?.message?.content ||
        "I'm sorry, I couldn't generate a response.";

      response.json({
        reply,
        userName,
      });
    } catch (error) {
      console.error("Error in aboutMe function:", error);
      response.status(500).json({ error: "Failed to process chat message" });
    }
  }
);
