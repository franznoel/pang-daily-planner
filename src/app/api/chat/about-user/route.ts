import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/lib/firebase-admin";
import OpenAI from "openai";

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

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Check if the requesting user has viewer access to the owner's daily plans
 */
async function hasViewerAccess(ownerUserId: string, viewerEmail: string): Promise<boolean> {
  const db = getFirestoreAdmin();
  const viewerRef = db.doc(`user/${ownerUserId}/viewers/${viewerEmail}`);
  const viewerSnap = await viewerRef.get();
  
  return viewerSnap.exists;
}

/**
 * Get the last N daily planner entries for a user
 */
async function getLastNEntries(userId: string, count: number): Promise<DailyPlannerDocument[]> {
  const db = getFirestoreAdmin();
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
 * Get OpenAI client
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY environment variable.");
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, messages } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "userEmail is required" },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "messages array is required" },
        { status: 400 }
      );
    }

    // Check if user has viewer access
    const hasAccess = await hasViewerAccess(userId, userEmail);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to view this user's status" },
        { status: 403 }
      );
    }

    // Get last 30 entries for context
    const entries = await getLastNEntries(userId, 30);

    if (entries.length === 0) {
      return NextResponse.json(
        { success: false, error: "No daily planner entries found for this user" },
        { status: 404 }
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
        ...(messages as ChatMessage[])
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "Unable to generate response";

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Error chatting about user status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate chat response" },
      { status: 500 }
    );
  }
}
