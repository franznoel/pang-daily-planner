/**
 * Script to generate seed data for Firebase Firestore emulator
 * This creates mock users and daily planner entries for testing
 */

const fs = require('fs');
const path = require('path');

// Mock user IDs (simulating Firebase Auth UIDs)
const USERS = {
  owner: {
    uid: 'mock-user-owner-uid-001',
    email: 'owner@example.com',
    displayName: 'John Owner'
  },
  viewer: {
    uid: 'mock-user-viewer-uid-002',
    email: 'viewer@example.com',
    displayName: 'Jane Viewer'
  }
};

// Helper to generate a date string (YYYY-MM-DD) going back N days
function getDateString(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Helper to generate random energy level
function randomEnergyLevel() {
  return String(Math.floor(Math.random() * 3) + 7); // 7-10
}

// Helper to generate random mood
function randomMood() {
  const moods = ['Energized', 'Focused', 'Calm', 'Motivated', 'Grateful', 'Happy', 'Productive'];
  return moods[Math.floor(Math.random() * moods.length)];
}

// Generate a single daily plan entry
function generateDailyPlan(daysAgo) {
  const date = getDateString(daysAgo);
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    date,
    energyLevel: randomEnergyLevel(),
    mood: randomMood(),
    gratefulFor: [
      'Good health',
      'Supportive family',
      'Meaningful work'
    ],
    excitedAbout: [
      'New projects',
      isWeekend ? 'Weekend plans' : 'Team collaboration',
      'Learning opportunities'
    ],
    peopleToSee: isWeekend ? ['Family', 'Friends'] : ['Team members', 'Manager'],
    mindHabits: [
      { text: 'Morning meditation', checked: true },
      { text: 'Reading for 30 minutes', checked: Math.random() > 0.3 },
      { text: 'Journaling', checked: Math.random() > 0.4 }
    ],
    bodyHabits: [
      { text: 'Morning workout', checked: Math.random() > 0.2 },
      { text: 'Drink 8 glasses of water', checked: Math.random() > 0.3 },
      { text: 'Walk 10,000 steps', checked: Math.random() > 0.4 }
    ],
    spiritHabits: [
      { text: 'Practice gratitude', checked: true },
      { text: 'Help someone', checked: Math.random() > 0.5 },
      { text: 'Connect with nature', checked: isWeekend }
    ],
    meals: isWeekend ? 'Healthy brunch, family dinner' : 'Oatmeal breakfast, salad lunch, chicken dinner',
    water: '2 liters',
    intention: isWeekend 
      ? 'Enjoy quality time with family and recharge for the week ahead'
      : 'Focus on important priorities and maintain work-life balance',
    iAm: 'capable, focused, and growing every day',
    scheduleEvents: isWeekend ? [
      {
        id: `event-${date}-1`,
        title: 'Morning exercise',
        start: `${date}T08:00:00`,
        end: `${date}T09:00:00`,
        description: 'Yoga or jogging'
      },
      {
        id: `event-${date}-2`,
        title: 'Family time',
        start: `${date}T14:00:00`,
        end: `${date}T17:00:00`,
        description: 'Quality time with family'
      }
    ] : [
      {
        id: `event-${date}-1`,
        title: 'Team standup',
        start: `${date}T09:00:00`,
        end: `${date}T09:30:00`,
        description: 'Daily sync'
      },
      {
        id: `event-${date}-2`,
        title: 'Deep work block',
        start: `${date}T10:00:00`,
        end: `${date}T12:00:00`,
        description: 'Focus on key deliverables'
      },
      {
        id: `event-${date}-3`,
        title: 'Lunch break',
        start: `${date}T12:00:00`,
        end: `${date}T13:00:00`
      },
      {
        id: `event-${date}-4`,
        title: 'Project meeting',
        start: `${date}T14:00:00`,
        end: `${date}T15:00:00`,
        description: 'Sprint planning'
      }
    ],
    topPriorities: [
      { text: isWeekend ? 'Rest and recharge' : 'Complete project milestone', checked: Math.random() > 0.3 },
      { text: isWeekend ? 'Spend time with family' : 'Review and respond to key emails', checked: Math.random() > 0.4 },
      { text: 'Exercise and stay healthy', checked: Math.random() > 0.3 }
    ],
    professionalPriorities: isWeekend ? [] : [
      { text: 'Finish code review', checked: Math.random() > 0.2 },
      { text: 'Update project documentation', checked: Math.random() > 0.5 },
      { text: 'Prepare for client presentation', checked: Math.random() > 0.6 }
    ],
    personalPriorities: [
      { text: 'Call a friend', checked: Math.random() > 0.5 },
      { text: 'Plan next week', checked: isWeekend },
      { text: 'Organize workspace', checked: Math.random() > 0.6 }
    ],
    infinitePossibilities: 'Every day is a new opportunity to learn, grow, and make a positive impact',
    whatInspiredMe: isWeekend 
      ? 'Spending quality time with loved ones and appreciating the simple things'
      : 'Making progress on challenging problems and seeing the team collaborate effectively',
    positiveThings: [
      'Completed morning routine',
      isWeekend ? 'Great family time' : 'Productive meetings',
      'Felt energized throughout the day'
    ],
    whatDidIDoWell: isWeekend
      ? 'Took time to rest and connect with family, which recharged my energy'
      : 'Stayed focused on priorities, communicated clearly with team, maintained good energy',
    whatDidILearn: 'Consistency in daily habits creates momentum and better outcomes',
    createdAt: new Date(date).toISOString(),
    updatedAt: new Date(date).toISOString()
  };
}

// Generate user document
function generateUserDocument(user) {
  return {
    email: user.email,
    displayName: user.displayName,
    createdAt: new Date('2024-01-01').toISOString()
  };
}

// Generate viewer access document
function generateViewerDocument(viewerEmail) {
  return {
    email: viewerEmail,
    addedAt: new Date('2024-01-15').toISOString()
  };
}

// Generate shared-with-me document
function generateSharedWithMeDocument(ownerId, ownerEmail) {
  return {
    ownerId,
    ownerEmail,
    sharedAt: new Date('2024-01-15').toISOString(),
    type: 'global'
  };
}

// Main function to generate all seed data
function generateSeedData() {
  const seedData = {
    __collections__: {}
  };

  // Create user collection
  seedData.__collections__.user = {};

  // Add owner user
  const ownerId = USERS.owner.uid;
  seedData.__collections__.user[ownerId] = {
    ...generateUserDocument(USERS.owner),
    __collections__: {
      'daily-plans': {},
      'viewers': {}
    }
  };

  // Add 100 daily plans for owner (going back 100 days)
  for (let i = 0; i < 100; i++) {
    const plan = generateDailyPlan(i);
    seedData.__collections__.user[ownerId].__collections__['daily-plans'][plan.date] = plan;
  }

  // Add viewer access for the owner's plans
  seedData.__collections__.user[ownerId].__collections__.viewers[USERS.viewer.email] = 
    generateViewerDocument(USERS.viewer.email);

  // Add viewer user
  const viewerId = USERS.viewer.uid;
  seedData.__collections__.user[viewerId] = {
    ...generateUserDocument(USERS.viewer),
    __collections__: {
      'daily-plans': {}
    }
  };

  // Add a few daily plans for viewer (going back 10 days)
  for (let i = 0; i < 10; i++) {
    const plan = generateDailyPlan(i);
    seedData.__collections__.user[viewerId].__collections__['daily-plans'][plan.date] = plan;
  }

  // Create sharedWithMe collection for viewer
  seedData.__collections__.sharedWithMe = {};
  seedData.__collections__.sharedWithMe[USERS.viewer.email] = {
    __collections__: {
      owners: {}
    }
  };
  seedData.__collections__.sharedWithMe[USERS.viewer.email].__collections__.owners[ownerId] = 
    generateSharedWithMeDocument(ownerId, USERS.owner.email);

  return seedData;
}

// Generate and save the seed data
const seedData = generateSeedData();
const outputPath = path.join(__dirname, 'firestore-seed.json');
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));

console.log('✅ Seed data generated successfully!');
console.log(`📄 File: ${outputPath}`);
console.log('\n📊 Summary:');
console.log(`  - Owner: ${USERS.owner.email} (${USERS.owner.uid})`);
console.log(`  - Viewer: ${USERS.viewer.email} (${USERS.viewer.uid})`);
console.log(`  - Daily plans for owner: 100 entries`);
console.log(`  - Daily plans for viewer: 10 entries`);
console.log(`  - Viewer has access to owner's plans`);
console.log('\n🚀 To use this data:');
console.log('  1. Start emulators: npm run emulators');
console.log('  2. Import seed data: npm run seed:import');
console.log('  3. Or combine: npm run emulators:seed');
