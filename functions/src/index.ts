/**
 * Firebase Cloud Functions for Pang Daily Planner
 * 
 * These functions replace the Next.js API routes for AI-powered chat functionality.
 * Each function is deployed separately and accessible via its own endpoint.
 */

// Export all functions
export { aboutMe } from "./aboutMe";
export { aboutUser } from "./aboutUser";
export { myStatusSummary } from "./myStatusSummary";
export { statusSummary } from "./statusSummary";
