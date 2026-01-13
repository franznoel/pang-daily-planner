# Firebase Emulators Setup Guide

## Overview

This project uses Firebase Emulators for local development and testing. The Cloud Functions that handle API requests need to be properly built and the emulators need to be started correctly.

## Prerequisites

Before running the emulators, make sure functions are built:

```bash
cd functions && npm install && npm run build && cd ..
```

## Emulator Configuration

The emulators are configured in `firebase.json`:

- **Auth Emulator**: `localhost:9099`
- **Firestore Emulator**: `localhost:8081`
- **Functions Emulator**: `localhost:5001`
- **Hosting Emulator**: `localhost:5002` (serves Next.js app + routes to functions)
- **Emulator UI**: `localhost:4000`

## Starting the Emulators

### Step 1: Build Functions

```bash
cd functions
npm install
npm run build
cd ..
```

### Step 2: Start All Emulators

```bash
npm run emulators
```

Or use Firebase CLI directly:

```bash
firebase emulators:start
```

This starts all emulators including hosting which enables function rewrites.

## Testing Cloud Functions

### Method 1: Through Hosting Emulator (Recommended - Mirrors Production)

When emulators are running, access functions through the **hosting emulator** which handles rewrites:

```bash
# Test myStatusSummary
curl -X POST http://localhost:5002/api/chat/my-status-summary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'

# Test aboutMe  
curl -X POST http://localhost:5002/api/chat/about-me \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "message": "Hello", "conversationHistory": []}'

# Test aboutUser
curl -X POST http://localhost:5002/api/chat/about-user \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "viewerEmail": "viewer@example.com", "message": "Hello", "conversationHistory": []}'

# Test statusSummary
curl -X POST http://localhost:5002/api/chat/status-summary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "viewerEmail": "viewer@example.com"}'
```

### Method 2: Direct Function Access (Bypassing Rewrites)

For debugging, call functions directly on the functions emulator:

```bash
# Direct function call (full path required)
curl -X POST http://localhost:5001/pang-daily-planner/us-central1/myStatusSummary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

Format: `http://localhost:5001/{project-id}/{region}/{functionName}`

## Important Notes

### Hosting Emulator vs Functions Emulator

- **Port 5002 (Hosting)**: ✅ Use this for `/api/chat/*` paths (uses rewrites from firebase.json)
- **Port 5001 (Functions)**: Use full path `/pang-daily-planner/us-central1/functionName`
- **Port 3000 (Next.js dev)**: ❌ Does NOT have access to Cloud Functions

### Why Both Ports?

- **Functions Emulator (5001)**: Runs the Cloud Functions code
- **Hosting Emulator (5002)**: Serves Next.js app AND proxies `/api/chat/*` requests to functions emulator based on rewrites

The hosting emulator reads the rewrites in `firebase.json` and forwards matching requests to the functions emulator.

## Running Next.js Dev Server Separately

If you want hot-reload for frontend development:

**Terminal 1 - Emulators (for backend functions):**
```bash
npm run emulators
```

**Terminal 2 - Next.js Dev (for frontend hot-reload):**
```bash
npm run dev
```

Note: Next.js dev server (port 3000) won't have access to functions. You'll need to update frontend code to call `http://localhost:5002/api/chat/*` instead of `/api/chat/*` when developing locally, OR just use the hosting emulator at port 5002 for everything.

## Environment Variables

Cloud Functions in the emulator will attempt to access:

```bash
APP_ENV=development
OPENAI_API_KEY_DEV=your-dev-key-here
OPENAI_API_KEY_PROD=your-prod-key-here
```

For local development, these are typically accessed through Firebase Secret Manager or environment variables. Make sure to set them before deploying or testing functions that require OpenAI.

## Troubleshooting

### Issue: 404 on `/api/chat/*`

**Problem**: Getting 404 when accessing `http://localhost:5002/api/chat/my-status-summary`

**Solutions**:
1. Make sure hosting emulator is running (check port 5002 is active)
2. Verify functions are built: `cd functions && npm run build`
3. Check firebase.json has correct rewrites configuration
4. Restart emulators: Stop and run `npm run emulators` again

### Issue: "Not Found" from Functions Emulator  

**Problem**: `http://localhost:5001/api/chat/my-status-summary` returns "Not Found"

**Solution**: Functions emulator doesn't handle rewrites. Use the full function path:
```bash
curl -X POST http://localhost:5001/pang-daily-planner/us-central1/myStatusSummary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

### Issue: Functions Not Deploying to Emulator

**Problem**: Emulators start but functions aren't available

**Solutions**:
1. Ensure functions are compiled: `cd functions && npm run build`
2. Check `functions/lib/` directory exists with `.js` files
3. Verify `functions/package.json` has correct dependencies installed
4. Look at emulator logs for TypeScript or runtime errors

### Issue: TypeScript Build Errors

**Problem**: `npm run build` fails in functions directory

**Solution**: 
```bash
cd functions
npm install  # Make sure all dependencies are installed
npm run build
```

If you get type errors, check `functions/tsconfig.json` configuration.

## Production Deployment

When deploying to production, both functions and hosting are deployed:

```bash
# Build functions first
cd functions && npm run build && cd ..

# Deploy everything
firebase deploy

# Or deploy separately
firebase deploy --only functions
firebase deploy --only hosting
```

The same URL paths (`/api/chat/*`) work in production through Firebase Hosting rewrites to Cloud Functions.

## Quick Reference

| Service | Port | URL Pattern | Purpose |
|---------|------|-------------|---------|
| Hosting | 5002 | `/api/chat/*` | Production-like access with rewrites |
| Functions | 5001 | `/pang-daily-planner/us-central1/{functionName}` | Direct function access |
| Firestore | 8081 | N/A | Database emulator |
| Auth | 9099 | N/A | Authentication emulator |
| UI | 4000 | N/A | Emulator suite UI dashboard |
| Next.js Dev | 3000 | `/*` | Frontend hot-reload (no functions) |

