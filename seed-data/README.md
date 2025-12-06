# Seed Data for Firebase Emulator

This directory contains scripts and data to populate the Firebase Firestore emulator with mock data for testing.

## Overview

The seed data includes:
- **2 Mock Users**: Owner and Viewer (created in Firebase Auth first)
- **100 Daily Plans** for the owner (last 100 days)
- **10 Daily Plans** for the viewer (last 10 days)
- **Viewer Access**: Viewer has permission to see owner's plans
- **Realistic Data**: Daily plans include varied habits, moods, schedules, and priorities

**Important**: The import script creates Firebase Auth users first, then uses their real UIDs to generate Firestore documents. This ensures the UIDs match between Auth and Firestore.

## Mock Users

### Owner Account
- **Email**: `owner@example.com`
- **Display Name**: John Owner
- **Password**: `password123`
- **UID**: Generated dynamically by Firebase Auth
- Has 100 daily planner entries

### Viewer Account
- **Email**: `viewer@example.com`
- **Display Name**: Jane Viewer
- **Password**: `password123`
- **UID**: Generated dynamically by Firebase Auth
- Has 10 daily planner entries
- Has global viewer access to owner's plans

## Usage

### Quick Start (Recommended)

1. **Generate and import seed data in one command**:
   ```bash
   npm run emulators:seed
   ```

This will:
- Generate the seed data JSON file
- Start the Firebase emulators
- Automatically import the seed data
- Keep emulators running for development

### Manual Steps

If you prefer to run steps individually:

1. **Generate seed data**:
   ```bash
   npm run seed:generate
   ```
   This creates `firestore-seed.json` with mock data.

2. **Start emulators**:
   ```bash
   npm run emulators
   ```

3. **Import seed data** (in another terminal):
   ```bash
   npm run seed:import
   ```

## Testing the Application

### Sign In as Owner
1. Go to the login page
2. Click "Sign in with Google"
3. In the Firebase Auth emulator popup, enter: `owner@example.com`
4. The Auth emulator will use the pre-created account with real UID
5. You'll see 100 days of daily planner data

### Sign In as Viewer
1. Go to the login page
2. Click "Sign in with Google"
3. In the Firebase Auth emulator popup, enter: `viewer@example.com`
4. The Auth emulator will use the pre-created account with real UID
5. Navigate to "Shared Plans" to see owner's plans
6. Click on owner's plans to view them
7. Use "Chat with AI" to get AI insights about the owner's status

**Note**: The seed import creates real Firebase Auth users, so the UIDs in Firestore match the Auth UIDs. You can also view the Auth emulator UI at http://localhost:9099 to see the created users.

### Testing AI Features

#### For Viewing Others (as Viewer)
1. Sign in as `viewer@example.com`
2. Go to Shared Plans
3. Click on John Owner's shared plans
4. Click "Chat with AI" button
5. Get AI summary based on owner's last 30 entries

#### For Personal AI Coach (as Owner)
1. Sign in as `owner@example.com`
2. On the Daily Planner page, click "Chat with AI" button
3. Get personalized coaching based on your last 90 entries

## Data Structure

The seed data follows this Firestore structure:

```
/user/{userId}
  - email: string
  - displayName: string
  - createdAt: timestamp
  
  /daily-plans/{date}
    - date: string (YYYY-MM-DD)
    - energyLevel: string
    - mood: string
    - gratefulFor: string[]
    - excitedAbout: string[]
    - peopleToSee: string[]
    - mindHabits: { text: string, checked: boolean }[]
    - bodyHabits: { text: string, checked: boolean }[]
    - spiritHabits: { text: string, checked: boolean }[]
    - meals: string
    - water: string
    - intention: string
    - iAm: string
    - scheduleEvents: { id, title, start, end, description? }[]
    - topPriorities: { text: string, checked: boolean }[]
    - professionalPriorities: { text: string, checked: boolean }[]
    - personalPriorities: { text: string, checked: boolean }[]
    - infinitePossibilities: string
    - whatInspiredMe: string
    - positiveThings: string[]
    - whatDidIDoWell: string
    - whatDidILearn: string
    - createdAt: timestamp
    - updatedAt: timestamp
  
  /viewers/{viewerEmail}
    - email: string
    - addedAt: timestamp

/sharedWithMe/{viewerEmail}
  /owners/{ownerId}
    - ownerId: string
    - ownerEmail: string
    - sharedAt: timestamp
    - type: 'global'
```

## Customization

To modify the seed data:

1. Edit `generate-seed-data.js`:
   - Change user emails/names in the `USERS` object
   - Adjust the number of daily plans generated
   - Modify the content of daily plans
   - Add more users or viewer relationships

2. Regenerate the seed data:
   ```bash
   npm run seed:generate
   ```

3. Re-import:
   ```bash
   npm run seed:import
   ```

## Troubleshooting

### "Firestore emulator is not running"
Make sure the emulators are started before importing:
```bash
npm run emulators
```

### "Seed data file not found"
Generate the seed data first:
```bash
npm run seed:generate
```

### Clear existing data
To start fresh, stop the emulators and delete the `emulator-data` directory:
```bash
rm -rf emulator-data
npm run emulators:seed
```

## Files

- `generate-seed-data.js` - Script to generate mock data JSON
- `import-seed-data.js` - Script to import data into emulator
- `firestore-seed.json` - Generated seed data (git-ignored)
- `README.md` - This file
