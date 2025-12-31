# Firebase SDK Separation Guide

This document explains how Firebase SDKs are separated in this project to prevent server-side errors.

## The Problem

The original issue was that the Firebase Web (client) SDK (`src/lib/firebase.ts`) was being imported into server-side code (API routes), causing 500 errors in production. This happened because:

1. API routes imported `DailyPlannerDocument` type from `src/lib/dailyPlannerService.ts`
2. `dailyPlannerService.ts` imported the client Firebase SDK
3. The client SDK tried to initialize in the server environment, causing crashes

## The Solution

We've implemented a strict separation between client and server Firebase usage:

### 1. Client-Only Protection

The file `src/lib/firebase.ts` now starts with:
```typescript
import "client-only";
```

This ensures that Next.js will throw a **build-time error** if this file is accidentally imported into server-side code.

### 2. Shared Types File

Created `src/lib/types.ts` which contains all types that need to be shared between client and server code:
- `DailyPlannerDocument`
- `UserInfoDocument`
- `ViewerDocument`
- `SharedOwnerDocument`

**Important:** This file does NOT import any Firebase SDK (neither client nor admin).

### 3. Updated Imports

All API routes now import types from `@/lib/types` instead of `@/lib/dailyPlannerService`:

```typescript
// ✅ Correct - API route import
import type { DailyPlannerDocument } from "@/lib/types";
import { adminDb } from "@/lib/firebase-admin";

// ❌ Wrong - Would cause build error
import { DailyPlannerDocument } from "@/lib/dailyPlannerService"; // This has "use client"
```

## File Structure

```
src/lib/
├── firebase.ts              # Client SDK (browser only) - has "client-only" import
├── firebase-admin.ts        # Admin SDK (server only)
├── types.ts                 # Shared types (no Firebase imports)
├── dailyPlannerService.ts   # Client-side Firestore operations (has "use client")
└── ai-utils.ts              # Utility functions (no Firebase imports)
```

## Usage Rules

### Backend (Server-side) Code

**Files:**
- `src/app/api/**/*.ts` (API routes)
- Server Actions (files with `"use server"`)
- Server Components (no `"use client"`)

**Must use:**
```typescript
import { adminDb, adminAuth, adminApp } from "@/lib/firebase-admin";
import type { DailyPlannerDocument } from "@/lib/types";
```

**Must NOT use:**
- `src/lib/firebase.ts` (protected by `client-only`)
- `src/lib/dailyPlannerService.ts` (has `"use client"`)

### Frontend (Client-side) Code

**Files:**
- Client Components (files with `"use client"`)
- Client-side hooks and utilities

**Must use:**
```typescript
import { getFirebaseAuth, getFirestoreDb, getGoogleProvider } from "@/lib/firebase";
import { saveDailyPlan, getDailyPlan } from "@/lib/dailyPlannerService";
import type { DailyPlannerDocument } from "@/lib/types"; // or from dailyPlannerService
```

**Must NOT use:**
- `src/lib/firebase-admin.ts` (server only)

## Environment Variables

### Client SDK
Uses `NEXT_PUBLIC_*` environment variables (available in browser):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- etc.

### Admin SDK
Uses server-only environment variables (NOT prefixed with `NEXT_PUBLIC_`):
- `FIREBASE_PROJECT_ID` (or auto-detected from `__FIREBASE_DEFAULTS__`)
- Application Default Credentials in production

## Environment Detection

Always use `process.env.NODE_ENV` to check the environment:

```typescript
const isDevelopment = process.env.NODE_ENV !== "production";
```

Do NOT use custom environment variables like `APP_ENV` as they may not be available or consistent.

## How to Prevent Future Issues

1. **When creating a new API route:**
   - Import types from `@/lib/types`
   - Import database from `@/lib/firebase-admin`
   - Never import from `@/lib/firebase` or `@/lib/dailyPlannerService`

2. **When creating a new type that needs to be shared:**
   - Add it to `src/lib/types.ts`
   - Ensure the types file doesn't import any Firebase SDK

3. **When creating client-side components:**
   - Add `"use client"` directive at the top
   - Import from `@/lib/firebase` and `@/lib/dailyPlannerService`
   - Never import from `@/lib/firebase-admin`

4. **Before deploying:**
   - Run `npm run build` to ensure no build errors
   - The build will fail if server code tries to import client-only modules

## Copilot Instructions

The file `.github/workflows/copilot-instructions.md` has been updated with detailed rules about Firebase SDK separation to guide future AI-assisted code generation.

## Verification

To verify the separation is maintained:

```bash
# Check that API routes don't import client SDK
grep -r "from.*@/lib/firebase\"" src/app/api

# Check that API routes don't import dailyPlannerService
grep -r "from.*@/lib/dailyPlannerService" src/app/api

# Both commands should return nothing (or an error), which is good!
```

## Summary

This separation ensures:
- ✅ No client SDK in server code (build-time protection)
- ✅ No admin SDK in client code (security)
- ✅ Clean type sharing between client and server
- ✅ Clear documentation for future development
- ✅ Production-safe deployment
