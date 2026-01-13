import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { adminDb } from '../../src/lib/firebase-admin';
import { DailyPlannerDocument } from '../../src/lib/dailyPlannerService';
import { formatPlansForAI, getOpenAIApiKey } from '../../src/lib/ai-utils';

const router = express.Router();

// Lazy initialize OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    apiKey: getOpenAIApiKey(),
  });
}

// Helper function to check viewer access
async function checkViewerAccess(
  ownerUserId: string,
  viewerEmail: string
): Promise<boolean> {
  try {
    const viewerDoc = await adminDb
      .collection('user')
      .doc(ownerUserId)
      .collection('viewers')
      .doc(viewerEmail)
      .get();

    return viewerDoc.exists;
  } catch (error) {
    console.error('Error checking viewer access:', error);
    return false;
  }
}

// Helper function to get last 5 plans
async function getLast5Plans(userId: string): Promise<DailyPlannerDocument[]> {
  try {
    const plansSnapshot = await adminDb
      .collection('user')
      .doc(userId)
      .collection('daily-plans')
      .orderBy('date', 'desc')
      .limit(5)
      .get();

    return plansSnapshot.docs.map((doc) => doc.data() as DailyPlannerDocument);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

// Helper function to get last 1 plan
async function getLast1Plan(userId: string): Promise<DailyPlannerDocument[]> {
  try {
    const plansSnapshot = await adminDb
      .collection('user')
      .doc(userId)
      .collection('daily-plans')
      .orderBy('date', 'desc')
      .limit(1)
      .get();

    return plansSnapshot.docs.map((doc) => doc.data() as DailyPlannerDocument);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

// Helper function to get user info
async function getUserInfo(
  userId: string
): Promise<{ email?: string; displayName?: string } | null> {
  try {
    const userDoc = await adminDb.collection('user').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data() as { email?: string; displayName?: string };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

// POST /api/chat/about-me
router.post('/about-me', async (req: Request, res: Response) => {
  try {
    const { userId, message, conversationHistory } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        error: 'Missing required fields: userId and message',
      });
    }

    // Get last 5 daily plans
    const plans = await getLast5Plans(userId);

    // Log plans temporarily if not in production
    if (process.env.APP_ENV !== 'production') {
      console.log(`[about-me] Fetched ${plans.length} plans for user ${userId}`);
      console.log('[about-me] Plans data:', JSON.stringify(plans, null, 2));
    }

    if (plans.length === 0) {
      return res.status(404).json({
        error: 'No daily plans found',
      });
    }

    // Get user info
    const userInfo = await getUserInfo(userId);
    const userName = userInfo?.displayName || userInfo?.email || 'You';

    // Format plans data for ChatGPT context
    const plansData = formatPlansForAI(plans);

    // Log formatted plans data if not in production
    if (process.env.APP_ENV !== 'production') {
      console.log('[about-me] Formatted plans for AI:');
      console.log(plansData);
    }

    // Build conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
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
      role: 'user',
      content: message,
    });

    // Call OpenAI API
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 700,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    return res.json({
      reply,
      userName,
    });
  } catch (error) {
    console.error('Error in chat about me:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
    });
  }
});

// POST /api/chat/my-status-summary
router.post('/my-status-summary', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId',
      });
    }

    const plans = await getLast5Plans(userId);

    if (process.env.APP_ENV !== 'production') {
      console.log(`[my-status-summary] Fetched ${plans.length} plans for user ${userId}`);
    }

    if (plans.length === 0) {
      return res.status(404).json({
        error: 'No daily plans found',
      });
    }

    const userInfo = await getUserInfo(userId);
    const userName = userInfo?.displayName || userInfo?.email || 'You';
    const plansData = formatPlansForAI(plans);

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

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a supportive and insightful AI personal coach analyzing daily planner entries to provide helpful summaries, insights, and actionable advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary available';

    return res.json({
      summary,
      planCount: plans.length,
      userName,
    });
  } catch (error) {
    console.error('Error generating status summary:', error);
    return res.status(500).json({
      error: 'Failed to generate status summary',
    });
  }
});

// POST /api/chat/status-summary
router.post('/status-summary', async (req: Request, res: Response) => {
  try {
    const { userId, viewerEmail } = req.body;

    if (!userId || !viewerEmail) {
      return res.status(400).json({
        error: 'Missing required fields: userId and viewerEmail',
      });
    }

    const hasAccess = await checkViewerAccess(userId, viewerEmail);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'You do not have permission to view this user\'s data',
      });
    }

    const plans = await getLast1Plan(userId);

    if (process.env.APP_ENV !== 'production') {
      console.log(`[status-summary] Fetched ${plans.length} plans for user ${userId}`);
    }

    if (plans.length === 0) {
      return res.status(404).json({
        error: 'No daily plans found for this user',
      });
    }

    const userInfo = await getUserInfo(userId);
    const userName = userInfo?.displayName || userInfo?.email || userId;
    const plansData = formatPlansForAI(plans);

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

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a supportive and insightful AI coach analyzing daily planner entries to provide helpful summaries and insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary available';

    return res.json({
      summary,
      planCount: plans.length,
      userName,
    });
  } catch (error) {
    console.error('Error generating status summary:', error);
    return res.status(500).json({
      error: 'Failed to generate status summary',
    });
  }
});

// POST /api/chat/about-user
router.post('/about-user', async (req: Request, res: Response) => {
  try {
    const { userId, viewerEmail, message, conversationHistory } = req.body;

    if (!userId || !viewerEmail || !message) {
      return res.status(400).json({
        error: 'Missing required fields: userId, viewerEmail, and message',
      });
    }

    const hasAccess = await checkViewerAccess(userId, viewerEmail);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'You do not have permission to view this user\'s data',
      });
    }

    const plans = await getLast1Plan(userId);

    if (process.env.APP_ENV !== 'production') {
      console.log(`[about-user] Fetched ${plans.length} plans for user ${userId}`);
    }

    if (plans.length === 0) {
      return res.status(404).json({
        error: 'No daily plans found for this user',
      });
    }

    const userInfo = await getUserInfo(userId);
    const userName = userInfo?.displayName || userInfo?.email || userId;
    const plansData = formatPlansForAI(plans);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a supportive and insightful AI assistant helping someone understand another person's status and well-being based on their daily planner entries. 

Here are the last ${plans.length} daily planner entries for ${userName}:

${plansData}

Use this information to answer questions about ${userName}'s habits, mood, priorities, and overall well-being. Be conversational, empathetic, and provide insights based on the data you have.`,
      },
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    messages.push({
      role: 'user',
      content: message,
    });

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    return res.json({
      reply,
      userName,
    });
  } catch (error) {
    console.error('Error in chat about user:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
    });
  }
});

export default router;
