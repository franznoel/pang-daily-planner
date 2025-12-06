/**
 * Script to import seed data into Firebase Firestore emulator
 * Run this after starting the emulators
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
  projectId: "pang-daily-planner",
});

// Use default database (same as client-side Firebase)
const db = admin.firestore();
const auth = admin.auth();

// Explicitly use default database
db.settings({
  ignoreUndefinedProperties: true
});

// Mock users to create in Auth
const MOCK_USERS = [
  {
    email: 'owner@example.com',
    displayName: 'John Owner',
    password: 'password123',
    emailVerified: true
  },
  {
    email: 'viewer@example.com',
    displayName: 'Jane Viewer',
    password: 'password123',
    emailVerified: true
  }
];

// Create or get Firebase Auth user and return UID
async function createAuthUser(userData) {
  try {
    // Try to get existing user
    const existingUser = await auth.getUserByEmail(userData.email);
    console.log(`  ℹ User already exists: ${userData.email} (UID: ${existingUser.uid})`);
    return existingUser.uid;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Create new user
      const userRecord = await auth.createUser({
        email: userData.email,
        displayName: userData.displayName,
        password: userData.password,
        emailVerified: userData.emailVerified
      });
      console.log(`  ✓ Created Auth user: ${userData.email} (UID: ${userRecord.uid})`);
      return userRecord.uid;
    }
    throw error;
  }
}

// Map email to UID for seed data replacement
const userUidMap = {};

// Recursively import data from seed structure
async function importCollection(collectionPath, data) {
  for (const [docId, docData] of Object.entries(data)) {
    const { __collections__, ...documentData } = docData;
    
    // Set the document
    const docRef = db.collection(collectionPath).doc(docId);
    await docRef.set(documentData);
    console.log(`  ✓ Created document: ${collectionPath}/${docId}`);
    
    // Recursively import subcollections
    if (__collections__) {
      for (const [subCollectionName, subCollectionData] of Object.entries(__collections__)) {
        await importCollection(
          `${collectionPath}/${docId}/${subCollectionName}`,
          subCollectionData
        );
      }
    }
  }
}

async function importSeedData() {
  try {
    console.log('🌱 Starting seed data import...\n');
    
    // Step 1: Create Firebase Auth users first
    console.log('👤 Creating Firebase Auth users...\n');
    for (const userData of MOCK_USERS) {
      const uid = await createAuthUser(userData);
      userUidMap[userData.email] = uid;
    }
    
    console.log('\n📊 UID Mapping:');
    console.log(`  owner@example.com -> ${userUidMap['owner@example.com']}`);
    console.log(`  viewer@example.com -> ${userUidMap['viewer@example.com']}`);
    
    // Step 2: Load seed data
    console.log('\n📦 Loading seed data template...');
    const seedDataPath = path.join(__dirname, 'firestore-seed.json');
    
    if (!fs.existsSync(seedDataPath)) {
      console.error('❌ Seed data file not found. Please run: npm run seed:generate');
      process.exit(1);
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
    // Step 3: Replace mock UIDs with real Firebase Auth UIDs
    console.log('\n🔄 Replacing mock UIDs with real Firebase Auth UIDs...');
    if (seedData.__collections__ && seedData.__collections__.user) {
      const userCollection = seedData.__collections__.user;
      
      // Replace owner UID
      const ownerMockUid = 'mock-user-owner-uid-001';
      const ownerRealUid = userUidMap['owner@example.com'];
      if (userCollection[ownerMockUid] && ownerRealUid) {
        userCollection[ownerRealUid] = userCollection[ownerMockUid];
        delete userCollection[ownerMockUid];
        console.log(`  ✓ Replaced ${ownerMockUid} with ${ownerRealUid}`);
      }
      
      // Replace viewer UID
      const viewerMockUid = 'mock-user-viewer-uid-002';
      const viewerRealUid = userUidMap['viewer@example.com'];
      if (userCollection[viewerMockUid] && viewerRealUid) {
        userCollection[viewerRealUid] = userCollection[viewerMockUid];
        delete userCollection[viewerMockUid];
        console.log(`  ✓ Replaced ${viewerMockUid} with ${viewerRealUid}`);
      }
      
      // Update sharedWithMe collection to use real owner UID
      if (seedData.__collections__.sharedWithMe) {
        const sharedWithMe = seedData.__collections__.sharedWithMe;
        for (const [viewerEmail, viewerData] of Object.entries(sharedWithMe)) {
          if (viewerData.__collections__ && viewerData.__collections__.owners) {
            const owners = viewerData.__collections__.owners;
            // Replace mock owner UID with real UID
            if (owners[ownerMockUid] && ownerRealUid) {
              owners[ownerRealUid] = owners[ownerMockUid];
              owners[ownerRealUid].ownerId = ownerRealUid;
              delete owners[ownerMockUid];
              console.log(`  ✓ Updated sharedWithMe reference to use real owner UID`);
            }
          }
        }
      }
    }
    
    // Step 4: Import all collections with real UIDs
    console.log('\n📥 Importing Firestore data...\n');
    if (seedData.__collections__) {
      for (const [collectionName, collectionData] of Object.entries(seedData.__collections__)) {
        console.log(`📦 Importing collection: ${collectionName}`);
        await importCollection(collectionName, collectionData);
      }
    }
    
    console.log('\n✅ Seed data imported successfully!');
    console.log('\n👤 Test Users (with real Auth UIDs):');
    console.log(`  Owner: owner@example.com (UID: ${userUidMap['owner@example.com']})`);
    console.log(`  Viewer: viewer@example.com (UID: ${userUidMap['viewer@example.com']})`);
    console.log(`  Password for both: password123`);
    console.log('\n📝 Sign in using Firebase Auth emulator:');
    console.log('  1. Go to http://localhost:9099 to see Auth emulator UI');
    console.log('  2. Or sign in with Google Auth in the app using these emails');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing seed data:', error);
    process.exit(1);
  }
}

// Check if emulator is running
async function checkEmulator() {
  try {
    await db.collection('_test').limit(1).get();
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  const isEmulatorRunning = await checkEmulator();
  
  if (!isEmulatorRunning) {
    console.error('❌ Firestore emulator is not running!');
    console.error('   Please start it first: npm run emulators');
    process.exit(1);
  }
  
  await importSeedData();
})();
