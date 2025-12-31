# GitHub Copilot Agent – Project Instructions

These instructions guide how GitHub Copilot should generate, modify, and refactor code inside this repository.  
The project uses **Next.js, TypeScript, GraphQL, Firebase, React, and ESLint with the Next.js Web Vitals configuration**.

---

## 🧩 GENERAL PROJECT RULES

1. **Always write TypeScript**, not JavaScript.
2. **Never hardcode secrets** (use environment variables, not Firebase config).
3. For any backend logic that interacts with external APIs (OpenAI, Stripe, etc.),
   **use Next.js server-only API routes** under `app/api/*` or Next.js Server Actions — not client-side code. Do NOT create a separate Firebase Functions project/directory inside this repo; all server-side "functions" belong inside the Next.js app.
4. When generating new files:
   - Place React components in `src/components/`
   - Place hooks in `src/hooks/`
   - Place GraphQL schemas/resolvers in `src/graphql/`
   - Place Firebase integration code in `src/lib/firebase/` (see notes below for admin vs client SDK)
5. When modifying existing code, preserve:
   - Existing style patterns  
   - File structure  
   - Function signatures (unless asked explicitly to refactor)
6. When creating new server routes:
   - Prefer **Next.js App Router** (`app/api/.../route.ts`)
   - Use **POST** for any API involving data writes
   - Keep routes small and single-purpose (one responsibility per route file)
   - Place main GraphQL endpoint at `src/app/api/graphql.ts` (if applicable)

---

## ⚡ NEXT.JS / REACT RULES

### Follow the Next.js Core Web Vitals standards:
- Avoid `any`
- Avoid unused variables
- Avoid synchronous server/client mismatches
- Use server components when possible
- Avoid blocking rendering (expensive operations → server components or `app/api/*` routes)
- Use `use client` only when truly needed

### Component Guidelines
- Prefer function components
- Use React hooks correctly (no conditional hooks)
- Use controlled form components
- Avoid deeply nested props; create smaller components

---

## 🛡️ TYPESCRIPT RULES

Copilot must follow these by default:

- `strict` TypeScript mode
- No `any` unless explicitly commented with `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
- All new functions must include **explicit return types**
- Use interfaces instead of types when extending objects
- Use `zod` schemas if creating API input validation

---

## 🚀 GRAPHQL RULES

When touching GraphQL code:

- Follow schema-first design
- All resolvers must use correct `Context` typing
- Never return nullable fields unless the schema specifies `nullable`
- Avoid circular imports
- Mutations that modify Firestore must run server-side (Next.js server-only code under `app/api/*` or Next.js Server Actions). Do not run Admin-level mutations in client components.
- Ensure the repository's primary GraphQL library is used for the main GraphQL endpoint located at `src/app/api/graphql.ts`. Do not introduce a second GraphQL server implementation in this repo. If the project already uses a specific GraphQL server library (Apollo Server, GraphQL Yoga, Mercurius, or the `graphql` reference implementation), reuse that same library and its canonical adapters when implementing `src/app/api/graphql.ts`. Prefer using the existing patterns found elsewhere in the repository (imports, helpers, and server adapters).

---

## 🔥 FIREBASE RULES

### CRITICAL: Firebase SDK Separation

**Backend (Server-side) Code:**
- **MUST** use `src/lib/firebase-admin.ts` (Firebase Admin SDK)
- **MUST** import `adminDb`, `adminAuth`, `adminApp` from `@/lib/firebase-admin`
- Used in:
  - Next.js API routes (`src/app/api/**/*.ts`)
  - Next.js Server Actions (files with `"use server"` directive)
  - Server Components (components without `"use client"` directive)
  - Any server-side utility functions

**Frontend (Client-side) Code:**
- **MUST** use `src/lib/firebase.ts` (Firebase Client SDK)
- **MUST** import `getFirebaseAuth`, `getFirestoreDb`, `getGoogleProvider` from `@/lib/firebase`
- Used in:
  - React Client Components (files with `"use client"` directive)
  - Client-side hooks and utilities
  - Browser-only code

### Protection Against Mixing SDKs
- The file `src/lib/firebase.ts` has `import "client-only"` at the top, which will cause a build error if accidentally imported into server code
- The file `src/lib/types.ts` contains shared types (like `DailyPlannerDocument`) that can be safely imported by both client and server code
- **NEVER** import `src/lib/firebase.ts` (or any module that imports it) from server-side code
- **NEVER** import `src/lib/firebase-admin.ts` from client-side code

### Shared Types
- All types that need to be shared between client and server (e.g., `DailyPlannerDocument`, `UserInfoDocument`) are defined in `src/lib/types.ts`
- This file must NOT import any Firebase SDK (neither client nor admin)
- Use `import type { ... } from "@/lib/types"` in both client and server code

### File layout
- `src/lib/firebase.ts` — Client SDK initialization (browser only, has `import "client-only"`)
- `src/lib/firebase-admin.ts` — Admin SDK initialization (server only)
- `src/lib/types.ts` — Shared types (no Firebase imports)
- `src/lib/dailyPlannerService.ts` — Client-side Firestore operations (uses client SDK, has `"use client"`)

### Absolutely forbidden:
- Using Admin SDK in the browser or client components
- Using Client SDK in API routes, server actions, or server components
- Importing `src/lib/firebase.ts` or `src/lib/dailyPlannerService.ts` from server-side code
- Calling OpenAI API from client components
- Committing Firebase service account JSON

### Environment Variables
- Client SDK uses `NEXT_PUBLIC_*` environment variables (available in browser)
- Admin SDK uses server-only environment variables (not prefixed with `NEXT_PUBLIC_`)
- Always use `process.env.NODE_ENV` to check environment (not custom env vars)

Notes:
- Do not create or rely on a separate Firebase Functions project/directory in this repository. All backend logic that requires the Admin SDK should be placed in `app/api/...` route handlers (or in server-only modules imported by those handlers).
- If you need background jobs, long-running tasks, or scheduled tasks that cannot run in serverless route handlers, discuss an external service (Cloud Run/Cron or a managed Cloud Function outside this repo). But the default for this project is to keep everything inside `app/api/*`.

---

## 🎨 PRETTIER & FORMAT RULES

Copilot should automatically format code as:

- 2 spaces indentation  
- Semicolons enabled  
- Trailing commas on objects/arrays  
- Double quotes in JSON  
- Single quotes in TS/TSX  

---

## 📏 ESLINT RULES SUMMARY  
This project extends the following configs:

- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Copilot must adhere to these **default rules**, including:

### ✔ React/Next.js Best Practices
- `react/no-unknown-property`
- `react/jsx-no-target-blank`
- `react-hooks/rules-of-hooks`
- `react-hooks/exhaustive-deps`
- `@next/next/no-html-link-for-pages`
- `@next/next/no-img-element`
- `@next/next/no-unwanted-polyfillio`
- `@next/next/no-assign-module-variable`

### ✔ Performance Rules
- Avoid synchronous blocking functions
- Avoid large inline objects in JSX
- Avoid directly mutating props/state

### ✔ TypeScript Rules
- `@typescript-eslint/no-unused-vars`
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/consistent-type-imports`
- No implicit `any` in functions
- Always annotate return types

### ✔ Global Ignores (Copilot should NEVER write files here)
- `.next/**`
- `out/**`
- `build/**`
- `next-env.d.ts`

---

## 🧪 TESTS

When creating tests:
- Use Jest or Vitest based on existing test files
- All tests must be TypeScript
- Prefer testing pure functions instead of components
- Mock Firebase and GraphQL APIs

---

## 🤖 PULL REQUEST BEHAVIOR

The Copilot Agent must:

1. Create **minimal, atomic PRs**.
2. Include a markdown list of:
   - What was added  
   - What was changed  
   - Why it was changed  
3. Run automated linting and formatting:

```
npm run lint -- --fix
npm run format
```

4. Never introduce breaking changes without an explanation.
5. If a task is ambiguous, Copilot should:
- Ask clarifying questions in the PR description  
- Or proceed with the safest minimal implementation  

---

## 🧘 HUMAN FEEDBACK LOOP

When instructions from the user conflict with these rules:

- Follow **the user’s instructions**,  
- But warn them about breaking conventions or introducing issues.

---

## 🏁 SUMMARY FOR COPILOT

**Write clean, typed, Next.js-compliant, Web-Vitals-friendly TypeScript code.  
Respect ESLint rules.  
Never expose secrets.  
Always prefer server-side for sensitive logic — and in this repository, server-side logic lives in Next.js server-only API routes (`app/api/*`) or Server Actions.  
Always keep code modular and readable.**
