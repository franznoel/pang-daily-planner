/**
 * Script to import seed data into Firebase Firestore emulator
 * Run this after starting the emulators
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';

admin.initializeApp({
  projectId: 'demo-project'
});

const db = admin.firestore();

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
    
    // Load seed data
    const seedDataPath = path.join(__dirname, 'firestore-seed.json');
    
    if (!fs.existsSync(seedDataPath)) {
      console.error('❌ Seed data file not found. Please run: npm run seed:generate');
      process.exit(1);
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
    // Import all collections
    if (seedData.__collections__) {
      for (const [collectionName, collectionData] of Object.entries(seedData.__collections__)) {
        console.log(`📦 Importing collection: ${collectionName}`);
        await importCollection(collectionName, collectionData);
      }
    }
    
    console.log('\n✅ Seed data imported successfully!');
    console.log('\n👤 Test Users:');
    console.log('  Owner: owner@example.com (UID: mock-user-owner-uid-001)');
    console.log('  Viewer: viewer@example.com (UID: mock-user-viewer-uid-002)');
    console.log('\n📝 Note: Use Firebase Auth emulator to sign in with these emails');
    console.log('  The emulator will create test accounts automatically');
    
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
