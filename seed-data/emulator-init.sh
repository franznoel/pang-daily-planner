#!/bin/bash
# Script to initialize Firebase emulators with seed data
# This ensures emulators are running before importing data

echo "🔧 Initializing Firebase Emulators with seed data..."
echo ""

# Generate seed data
echo "📝 Step 1: Generating seed data..."
npm run seed:generate
if [ $? -ne 0 ]; then
  echo "❌ Failed to generate seed data"
  exit 1
fi
echo ""

# Check if emulators are already running
echo "🔍 Step 2: Checking if emulators are running..."
if curl -s http://localhost:8081 > /dev/null 2>&1; then
  echo "✅ Emulators are already running"
  echo ""
  echo "📥 Step 3: Importing seed data..."
  npm run seed:import
else
  echo "⚠️  Emulators are not running yet"
  echo ""
  echo "🚀 Starting emulators in background..."
  firebase emulators:start > /tmp/emulator.log 2>&1 &
  EMULATOR_PID=$!
  
  echo "⏳ Waiting for emulators to be ready..."
  for i in {1..30}; do
    if curl -s http://localhost:8081 > /dev/null 2>&1; then
      echo "✅ Emulators are ready!"
      break
    fi
    sleep 1
  done
  
  if ! curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "❌ Emulators failed to start within 30 seconds"
    kill $EMULATOR_PID 2>/dev/null
    exit 1
  fi
  
  echo ""
  echo "📥 Step 3: Importing seed data..."
  npm run seed:import
  if [ $? -ne 0 ]; then
    echo "❌ Failed to import seed data"
    kill $EMULATOR_PID 2>/dev/null
    exit 1
  fi
  
  echo ""
  echo "✅ Emulators are running with seed data loaded!"
  echo "📊 Emulator UI: http://localhost:4000"
  echo ""
  echo "To view logs: tail -f /tmp/emulator.log"
  echo "To stop: kill $EMULATOR_PID"
  echo ""
  echo "Press Ctrl+C to stop the emulators..."
  wait $EMULATOR_PID
fi
