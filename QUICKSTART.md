# Quick Start: Firebase Functions with Emulators

This guide will help you get the Firebase Functions working with the emulator.

## Setup Steps (First Time Only)

### 1. Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### 2. Build the Functions

```bash
cd functions
npm run build
cd ..
```

You should see output like:
```
> functions@1.0.0 build
> tsc
```

Verify the build succeeded by checking for compiled files:
```bash
ls functions/lib/
```

You should see: `aboutMe.js`, `aboutUser.js`, `index.js`, `myStatusSummary.js`, `statusSummary.js`, and a `lib/` directory.

## Running the Emulators

### Start Emulators (Terminal 1)

```bash
npm run emulators
```

This starts all emulators. You should see output like:
```
✔  hub: emulator hub started at http://127.0.0.1:4400
✔  hosting: Hosting Emulator started at http://127.0.0.1:5002
✔  functions: Functions Emulator started at http://127.0.0.1:5001
✔  firestore: Firestore Emulator started at http://127.0.0.1:8081
```

**IMPORTANT:** Leave this terminal running! The emulators need to stay active.

### Test the Setup (Terminal 2)

Open a **new terminal** and run:

```bash
./test-emulators.sh
```

This script will verify:
- Emulators are running
- Functions are accessible via direct calls
- Rewrites are working correctly

## Testing Functions Manually

Once emulators are running, test a function:

```bash
# Test via hosting emulator (with rewrites) - RECOMMENDED
curl -X POST http://localhost:5002/api/chat/my-status-summary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'

# Test via direct function call
curl -X POST http://localhost:5001/pang-daily-planner/us-central1/myStatusSummary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'
```

## Common Issues

### "Emulators are not running"

**Solution:** Make sure you ran `npm run emulators` and it's still running in another terminal.

### "404 Not Found" when calling functions

**Causes:**
1. Functions weren't built - Run: `cd functions && npm run build && cd ..`
2. Using wrong port - Use port 5002 for `/api/chat/*` paths
3. Emulators need restart - Stop with Ctrl+C and restart

**Solution:**
```bash
# Stop emulators (Ctrl+C)
# Rebuild functions
cd functions && npm run build && cd ..
# Restart emulators
npm run emulators
```

### Functions build fails

**Error:** TypeScript compilation errors

**Solution:**
```bash
cd functions
npm install  # Make sure dependencies are installed
npm run build
```

Check the error output - it should show specific files/lines with issues.

## Emulator Ports

| Service | Port | Purpose |
|---------|------|---------|
| Hosting | 5002 | Next.js app + function rewrites |
| Functions | 5001 | Direct function access |
| Firestore | 8081 | Database emulator |
| Auth | 9099 | Authentication emulator |
| UI | 4000 | Emulator dashboard |

## Next Steps

1. ✅ Build functions: `cd functions && npm run build && cd ..`
2. ✅ Start emulators: `npm run emulators` (keep running)
3. ✅ Test setup: `./test-emulators.sh` (in new terminal)
4. ✅ Call functions from your frontend using `/api/chat/*` paths

For more details, see [EMULATORS.md](./EMULATORS.md).
