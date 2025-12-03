# ChatGPT Integration - User Status Chat

This feature allows users to get AI-powered insights about another user's status based on their daily planner entries.

## Overview

The ChatGPT integration provides:
- **Automatic Status Summary**: AI-generated analysis of a user's habits, mood patterns, and productivity
- **Interactive Chat**: Ask follow-up questions about the user's status
- **Historical Context**: Analysis based on the last 30 daily planner entries

## How to Use

### 1. Access the Feature

1. Navigate to a shared daily planner view at `/view/[userId]`
2. You must have viewer permissions to access this user's plans
3. Click the **"Chat About Status"** button in the header

### 2. View the Initial Summary

When the status chat page loads:
- The system automatically fetches the last 30 daily planner entries
- ChatGPT analyzes the data and generates a comprehensive summary
- The summary includes insights about:
  - Mood patterns and trends
  - Energy level fluctuations
  - Completed habits and priorities
  - Overall wellbeing and productivity

### 3. Ask Follow-up Questions

After the initial summary, you can interact with the AI:
- Type your question in the input field
- Press Enter or click "Send"
- The AI will respond based on the context of the user's entries

Example questions:
- "What are their most consistent habits?"
- "How has their energy level changed over time?"
- "What seems to make them most excited?"
- "Are there any patterns in their mood?"

## Technical Details

### API Endpoints

The feature uses two Firebase Functions:

1. **getUserStatusSummary**
   - Automatically called when the status page loads
   - Analyzes the last 30 entries
   - Returns an AI-generated summary

2. **chatAboutUserStatus**
   - Called for each message in the conversation
   - Maintains conversation context
   - Provides contextual responses

### Security

- Authentication required (Firebase Auth)
- Viewer permission verification
- Only authorized users can access status information

### Environment Setup

See [functions/README.md](../functions/README.md) for setup instructions.

## Privacy Considerations

- Only users with explicit viewer permissions can access status information
- Data is processed through OpenAI's API (see OpenAI's privacy policy)
- The last 30 entries are used for context (not all historical data)

## Limitations

- Requires an active OpenAI API key
- Based on the last 30 entries only
- AI responses are generated and may not be 100% accurate
- Requires viewer access to the target user's daily plans
