# Firebase Emulators Setup Guide

## Overview

This project uses Firebase Emulators for local development and testing. The Cloud Functions that handle API requests are accessible through the hosting emulator which routes requests according to the rewrites configuration.

## Emulator Configuration

The emulators are configured in `firebase.json`:

- **Auth Emulator**: `localhost:9099`
- **Firestore Emulator**: `localhost:8081`
- **Functions Emulator**: `localhost:5001`
- **Hosting Emulator**: `localhost:5002` (serves Next.js app + routes to functions)
- **Emulator UI**: `localhost:4000`

## Starting the Emulators

### Option 1: Start All Emulators (Recommended for testing functions)

```bash
npm run emulators
```

This starts:
- Auth emulator
- Firestore emulator  
- Functions emulator
- Hosting emulator (serves Next.js with function rewrites)
- Emulator UI

### Option 2: Start Only Firestore (for frontend development)

```bash
npm run dev:emulators
```

This only starts the Firestore emulator for frontend development.

## Testing Cloud Functions

### Important: Use the Hosting Emulator Port

When the emulators are running, Cloud Functions are accessible through the **hosting emulator** (port 5002), not directly through the functions emulator (port 5001).

**Correct URLs:**
- ✅ `http://localhost:5002/api/chat/my-status-summary` (via hosting emulator)
- ✅ `http://localhost:5002/api/chat/about-me`
- ✅ `http://localhost:5002/api/chat/about-user`
- ✅ `http://localhost:5002/api/chat/status-summary`

**Incorrect URLs:**
- ❌ `http://localhost:5001/api/chat/my-status-summary` (functions emulator doesn't handle rewrites)
- ❌ `http://localhost:3000/api/chat/my-status-summary` (Next.js dev server doesn't have the functions)

### Direct Function Access (without rewrites)

If you want to call functions directly (bypassing rewrites), use:

```
http://localhost:5001/pang-daily-planner/us-central1/myStatusSummary
```

Format: `http://localhost:5001/{project-id}/{region}/{functionName}`

## Example API Call

```bash
# Test myStatusSummary function
curl -X POST http://localhost:5002/api/chat/my-status-summary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

## Running Next.js + Emulators Together

To run the full development environment:

1. **Terminal 1**: Start Firebase Emulators
   ```bash
   npm run emulators
   ```

2. **Terminal 2**: Start Next.js Dev Server (optional, for frontend development)
   ```bash
   npm run dev
   ```

Note: When using the hosting emulator (port 5002), you get both the Next.js app AND the Cloud Functions accessible through rewrites. The Next.js dev server (port 3000) is only needed for hot-reload during frontend development.

## Environment Variables

Make sure you have the following environment variables set:

```bash
# .env.local
APP_ENV=development
OPENAI_API_KEY_DEV=your-dev-key
OPENAI_API_KEY_PROD=your-prod-key
```

For the emulators, secrets are accessed through Firebase Secret Manager emulation.

## Troubleshooting

### 404 Error on `/api/chat/*` paths

**Problem**: Getting Next.js 404 page when accessing function endpoints.

**Solution**: Make sure you're using the hosting emulator port (5002), not the functions emulator port (5001) or Next.js dev server port (3000).

### Functions not rebuilding

**Problem**: Changes to functions aren't reflected.

**Solution**: 
1. Stop the emulators
2. Rebuild functions: `cd functions && npm run build`
3. Restart emulators: `npm run emulators`

### CORS Errors

**Problem**: CORS errors when calling functions from frontend.

**Solution**: All functions have `cors: true` enabled. Make sure you're calling from an allowed origin.

## Production Deployment

When deploying to production:

```bash
# Deploy hosting + functions
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting
```

The same URL paths (`/api/chat/*`) work in production through Firebase Hosting rewrites.
