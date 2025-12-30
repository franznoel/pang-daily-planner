import { DailyPlannerDocument } from "@/lib/dailyPlannerService";

/**
 * Get the appropriate OpenAI API key based on the environment
 * Uses OPENAI_API_KEY_PROD in production, OPENAI_API_KEY_DEV otherwise
 */
export function getOpenAIApiKey(): string {
  const isProduction = process.env.APP_ENV === "production";
  const apiKey = isProduction
    ? process.env.OPENAI_API_KEY_PROD
    : process.env.OPENAI_API_KEY_DEV;
  
  if (!apiKey) {
    throw new Error(
      `Missing OpenAI API key. Expected ${isProduction ? "OPENAI_API_KEY_PROD" : "OPENAI_API_KEY_DEV"} to be set.`
    );
  }
  
  return apiKey;
}

/**
 * Format daily planner entries for AI consumption
 * Extracts key information from plans in a readable format
 */
export function formatPlansForAI(plans: DailyPlannerDocument[]): string {
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
