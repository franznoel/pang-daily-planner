import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import OpenAI from "openai";

admin.initializeApp();

// Initialize OpenAI with API key from Firebase config
const getOpenAIClient = () => {
  const config = functions.config();
  const apiKey = config.openai?.key;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Run: firebase functions:config:set openai.key=\"YOUR_API_KEY\"");
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
};

interface DailyPlannerDocument {
  date: string;
  energyLevel: string;
  mood: string;
  gratefulFor: string[];
  excitedAbout: string[];
  peopleToSee: string[];
  mindHabits: Array<{ text: string; checked: boolean }>;
  bodyHabits: Array<{ text: string; checked: boolean }>;
  spiritHabits: Array<{ text: string; checked: boolean }>;
  meals: string;
  water: string;
  intention: string;
  iAm: string;
  scheduleEvents: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
  }>;
  topPriorities: Array<{ text: string; checked: boolean }>;
  professionalPriorities: Array<{ text: string; checked: boolean }>;
  personalPriorities: Array<{ text: string; checked: boolean }>;
  infinitePossibilities: string;
  whatInspiredMe: string;
  positiveThings: string[];
  whatDidIDoWell: string;
  whatDidILearn: string;
  updatedAt?: string;
  createdAt?: string;
}

/**
 * Check if the requesting user has viewer access to the owner's daily plans
 */
async function hasViewerAccess(ownerUserId: string, viewerEmail: string): Promise<boolean> {
  const db = admin.firestore();
  const viewerRef = db.doc(`user/${ownerUserId}/viewers/${viewerEmail}`);
  const viewerSnap = await viewerRef.get();
  
  return viewerSnap.exists;
}

/**
 * Get the last N daily planner entries for a user
 */
async function getLastNEntries(userId: string, count: number): Promise<DailyPlannerDocument[]> {
  const db = admin.firestore();
  const plansRef = db.collection(`user/${userId}/daily-plans`);
  
  const querySnapshot = await plansRef
    .orderBy("date", "desc")
    .limit(count)
    .get();
  
  return querySnapshot.docs.map(doc => doc.data() as DailyPlannerDocument);
}

/**
 * Format daily planner entries into a summary for ChatGPT
 */
function formatEntriesForChatGPT(entries: DailyPlannerDocument[]): string {
  const summaries = entries.map(entry => {
    const completedHabits = [
      ...entry.mindHabits.filter(h => h.checked && h.text),
      ...entry.bodyHabits.filter(h => h.checked && h.text),
      ...entry.spiritHabits.filter(h => h.checked && h.text),
    ];
    
    const completedPriorities = [
      ...entry.topPriorities.filter(p => p.checked && p.text),
      ...entry.professionalPriorities.filter(p => p.checked && p.text),
      ...entry.personalPriorities.filter(p => p.checked && p.text),
    ];
    
    return `
Date: ${entry.date}
Energy Level: ${entry.energyLevel}/10
Mood: ${entry.mood}
Grateful For: ${entry.gratefulFor.filter(Boolean).join(", ")}
Excited About: ${entry.excitedAbout.filter(Boolean).join(", ")}
People to See: ${entry.peopleToSee.filter(Boolean).join(", ")}
Completed Habits: ${completedHabits.map(h => h.text).join(", ")}
Completed Priorities: ${completedPriorities.map(p => p.text).join(", ")}
Intention: ${entry.intention}
I Am: ${entry.iAm}
What Inspired Me: ${entry.whatInspiredMe}
What Did I Do Well: ${entry.whatDidIDoWell}
What Did I Learn: ${entry.whatDidILearn}
Positive Things: ${entry.positiveThings.filter(Boolean).join(", ")}
`;
  }).join("\n---\n");
  
  return summaries;
}

/**
 * Get user status summary from ChatGPT
 * This endpoint fetches the last 30 entries and generates an initial summary
 */
export const getUserStatusSummary = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to access this function"
    );
  }
  
  const { userId } = data;
  const viewerEmail = context.auth.token.email;
  
  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "userId is required"
    );
  }
  
  if (!viewerEmail) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User email is required"
    );
  }
  
  // Check if user has viewer access
  const hasAccess = await hasViewerAccess(userId, viewerEmail);
  if (!hasAccess) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not have permission to view this user's status"
    );
  }
  
  try {
    // Get last 30 entries
    const entries = await getLastNEntries(userId, 30);
    
    if (entries.length === 0) {
      throw new functions.https.HttpsError(
        "not-found",
        "No daily planner entries found for this user"
      );
    }
    
    // Format entries for ChatGPT
    const formattedEntries = formatEntriesForChatGPT(entries);
    
    // Get OpenAI client and generate summary
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes daily planner data and provides insights about a person's habits, mood patterns, productivity, and overall wellbeing. Provide a thoughtful, empathetic summary highlighting trends, achievements, and areas of focus."
        },
        {
          role: "user",
          content: `Please analyze the following daily planner entries from the past 30 days and provide a comprehensive summary of this person's status, including their mood patterns, energy levels, habits, achievements, and overall wellbeing:\n\n${formattedEntries}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const summary = completion.choices[0]?.message?.content || "Unable to generate summary";
    
    return {
      success: true,
      summary,
      entriesCount: entries.length,
    };
  } catch (error) {
    console.error("Error generating user status summary:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate status summary"
    );
  }
});

/**
 * Chat with ChatGPT about user status
 * Allows follow-up questions and interactions
 */
export const chatAboutUserStatus = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to access this function"
    );
  }
  
  const { userId, messages } = data;
  const viewerEmail = context.auth.token.email;
  
  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "userId is required"
    );
  }
  
  if (!messages || !Array.isArray(messages)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "messages array is required"
    );
  }
  
  if (!viewerEmail) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User email is required"
    );
  }
  
  // Check if user has viewer access
  const hasAccess = await hasViewerAccess(userId, viewerEmail);
  if (!hasAccess) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not have permission to view this user's status"
    );
  }
  
  try {
    // Get last 30 entries for context
    const entries = await getLastNEntries(userId, 30);
    
    if (entries.length === 0) {
      throw new functions.https.HttpsError(
        "not-found",
        "No daily planner entries found for this user"
      );
    }
    
    // Format entries for ChatGPT
    const formattedEntries = formatEntriesForChatGPT(entries);
    
    // Get OpenAI client and generate response
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that analyzes daily planner data and provides insights about a person's habits, mood patterns, productivity, and overall wellbeing. Here is the context of their last ${entries.length} daily planner entries:\n\n${formattedEntries}\n\nUse this information to answer questions about their status, patterns, and wellbeing.`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const response = completion.choices[0]?.message?.content || "Unable to generate response";
    
    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error("Error chatting about user status:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate chat response"
    );
  }
});
