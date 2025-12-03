# Firebase Functions for ChatGPT Integration

This directory contains Firebase Functions that integrate with OpenAI's ChatGPT API to provide user status summaries and chat functionality.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure OpenAI API Key

The functions require an OpenAI API key to be configured as an environment variable.

#### For Local Development (Emulators)

Create a `.env` file in the `functions` directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

#### For Production Deployment

The API key is provided through the GitHub Actions deployment workflow as a secret. Configure it in your GitHub repository:

1. Go to Settings > Secrets and variables > Actions
2. Add a new secret named `OPENAI_API_KEY` with your OpenAI API key value
3. The deployment workflow will automatically pass this to Firebase Functions

### 3. Build the Functions

```bash
npm run build
```

## Available Functions

### `getUserStatusSummary`

Generates an initial AI-powered summary of a user's status based on their last 30 daily planner entries.

**Parameters:**
- `userId` (string): The ID of the user whose status should be summarized

**Returns:**
- `success` (boolean): Whether the operation was successful
- `summary` (string): The AI-generated summary
- `entriesCount` (number): Number of entries analyzed

### `chatAboutUserStatus`

Allows interactive chat about a user's status with follow-up questions.

**Parameters:**
- `userId` (string): The ID of the user being discussed
- `messages` (array): Array of chat messages in the format `{ role: "user" | "assistant", content: string }`

**Returns:**
- `success` (boolean): Whether the operation was successful
- `response` (string): The AI's response

## Development

### Run Locally with Emulators

```bash
npm run serve
```

### Deploy to Production

```bash
npm run deploy
```

## Security

Both functions require:
1. User authentication (Firebase Auth)
2. Viewer permissions (user must have viewer access to the target user's daily plans)

The functions check these permissions before processing any requests.
