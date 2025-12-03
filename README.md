# Pang Daily Planner

A daily planner application built with Next.js 14 (App Router), MUI 7, Apollo Client 4, and Storybook. Configured for Firebase deployment.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **MUI 7** - Material UI component library
- **Apollo Client 4** - GraphQL client
- **Storybook 10** - Component documentation and testing
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript 5** - Type safety
- **Firebase** - Hosting and deployment

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run storybook` | Start Storybook development server on port 6006 |
| `npm run build-storybook` | Build Storybook for static deployment |
| `npm run deploy` | Deploy to Firebase |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server Actions
│   │   └── tasks.ts       # Task management actions
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── TaskList.tsx       # Task list component
│   └── TaskList.stories.ts # Storybook stories
├── lib/                   # Utility libraries
│   ├── apollo-client.ts   # Apollo Client configuration
│   ├── ApolloWrapper.tsx  # Apollo Provider wrapper
│   ├── theme.ts           # MUI theme configuration
│   └── ThemeRegistry.tsx  # MUI Theme Provider wrapper
└── stories/               # Storybook example stories
```

## Features

- **Server Actions**: Task management with create, toggle, and delete operations
- **MUI Components**: Material UI components with custom theming
- **Apollo Client**: Ready for GraphQL integration
- **Storybook**: Component documentation with MUI theme support
- **TypeScript**: Full type safety throughout the application
- **ChatGPT Integration**: AI-powered user status summaries and chat functionality
  - View AI-generated insights about user habits, mood patterns, and productivity
  - Interactive chat to ask questions about user status
  - Based on analysis of the last 30 daily planner entries

## Firebase Deployment

This project is configured for Firebase Hosting and Functions:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Update `.firebaserc` with your project ID
4. Deploy: `npm run deploy`

### Firebase Functions Setup

The ChatGPT integration requires Firebase Functions with an OpenAI API key:

1. Navigate to the functions directory: `cd functions`
2. Install dependencies: `npm install`
3. Configure the OpenAI API key:
   - For local development: Create a `.env` file with `OPENAI_API_KEY=your_api_key`
   - For production: Add `OPENAI_API_KEY` as a GitHub secret in your repository settings
4. Build the functions: `npm run build`
5. Deploy: The GitHub Actions workflow will automatically deploy functions with the API key

See [functions/README.md](functions/README.md) for more details.

## Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_GRAPHQL_URL=/api/graphql
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MUI Documentation](https://mui.com/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
