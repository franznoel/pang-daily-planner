# Migration from Next.js to Vite with React Router

This document describes the migration from Next.js to Vite with React Router Dom.

## What Changed

### Build Tool & Framework
- **From**: Next.js 16 (React framework with built-in routing and API routes)
- **To**: Vite 7 (Build tool) + React Router Dom 6 (Client-side routing) + Express (API server)

### Key Changes

1. **Routing**
   - Next.js App Router (`/app` directory) → React Router Dom with `src/pages` directory
   - File-based routing → Declarative routing in `src/App.tsx`
   - Dynamic routes `[userId]` → Route parameters `:userId`

2. **API Routes**
   - Next.js API Routes (`/app/api`) → Express server (`/server`)
   - Next.js Route Handlers → Express middleware and routes
   - Server Actions (`"use server"`) → Removed (not needed for this app)

3. **Navigation**
   - `useRouter` from `next/navigation` → `useNavigate` from `react-router-dom`
   - `useParams` from `next/navigation` → `useParams` from `react-router-dom`
   - `router.push()` → `navigate()`

4. **Metadata & Layout**
   - Next.js `layout.tsx` with metadata → Standard React App component
   - Next.js `Metadata` export → Standard HTML `<title>` tag in `index.html`

5. **Dependencies Removed**
   - `next`
   - `eslint-config-next`
   - `@mui/material-nextjs` (Next.js-specific MUI integration)
   - `client-only`

6. **Dependencies Added**
   - `react-router-dom` - Client-side routing
   - `express` - API server
   - `cors` - CORS middleware for Express
   - `tsx` - TypeScript execution for server
   - `@vitejs/plugin-react` - Vite React plugin

## Running the Application

### Development

**Option 1: Run frontend and backend separately**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run dev:server
```

**Option 2: Run both together (experimental)**
```bash
npm start
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3001`.

### Production Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Firebase Hosting

The app is now configured for static hosting:

```bash
npm run build
npm run deploy
```

**Note**: The API routes (Express server) need to be deployed separately to a backend service like:
- Firebase Cloud Functions
- Google Cloud Run
- Any Node.js hosting service

## File Structure

```
pang-daily-planner/
├── index.html              # HTML entry point
├── src/
│   ├── main.tsx           # Application entry point
│   ├── App.tsx            # Root component with routing
│   ├── pages/             # Page components (routes)
│   ├── components/        # Reusable components
│   └── lib/              # Utilities and services
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   └── routes/           # API routes
└── vite.config.ts        # Vite configuration
```

## Breaking Changes for Contributors

1. **No more "use client" directive** - All components are client-side by default in Vite
2. **Import changes** - Update any Next.js imports to React Router equivalents
3. **API calls** - API routes are now on a separate server (default: `http://localhost:3001`)
4. **No Server Components** - Everything is client-rendered

## Environment Variables

Environment variables should still be in `.env.local` but they now need to be prefixed with `VITE_` for client-side access:

Example:
```
VITE_FIREBASE_API_KEY=...
```

Access them with: `import.meta.env.VITE_FIREBASE_API_KEY`

Server-side variables (in `/server`) can use the regular `process.env` approach.
