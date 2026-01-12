#!/bin/bash

# Test script for Firebase Functions Emulator
# This script tests if the Cloud Functions are accessible through the hosting emulator

echo "🧪 Testing Firebase Functions Emulator Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if emulators are running
echo "📡 Checking if emulators are running..."
if ! curl -s http://localhost:5002 > /dev/null 2>&1; then
    echo -e "${RED}❌ Hosting emulator (port 5002) is not running${NC}"
    echo ""
    echo "Please start the emulators first:"
    echo "  cd functions && npm run build && cd .."
    echo "  npm run emulators"
    echo ""
    exit 1
fi

if ! curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo -e "${RED}❌ Functions emulator (port 5001) is not running${NC}"
    echo ""
    echo "Please start the emulators first:"
    echo "  cd functions && npm run build && cd .."
    echo "  npm run emulators"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Emulators are running${NC}"
echo ""

# Test 1: Direct function call (bypassing rewrites)
echo "🔍 Test 1: Direct function call to myStatusSummary"
echo "URL: http://localhost:5001/pang-daily-planner/us-central1/myStatusSummary"
RESPONSE=$(curl -s -X POST http://localhost:5001/pang-daily-planner/us-central1/myStatusSummary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}' \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "404" ] || [ "$HTTP_STATUS" == "400" ]; then
    echo -e "${GREEN}✓ Function responded (Status: $HTTP_STATUS)${NC}"
    echo "Response: $BODY" | head -c 200
    echo ""
else
    echo -e "${YELLOW}⚠ Unexpected status: $HTTP_STATUS${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Through hosting emulator with rewrites
echo "🔍 Test 2: Function call through hosting emulator (with rewrites)"
echo "URL: http://localhost:5002/api/chat/my-status-summary"
RESPONSE=$(curl -s -X POST http://localhost:5002/api/chat/my-status-summary \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}' \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "404" ] || [ "$HTTP_STATUS" == "400" ]; then
    echo -e "${GREEN}✓ Rewrite works! (Status: $HTTP_STATUS)${NC}"
    echo "Response: $BODY" | head -c 200
    echo ""
else
    echo -e "${RED}❌ Rewrite failed (Status: $HTTP_STATUS)${NC}"
    echo "Response: $BODY"
    echo ""
    echo "This might mean:"
    echo "  1. Functions aren't built - run: cd functions && npm run build"
    echo "  2. Rewrites aren't configured correctly in firebase.json"
    echo "  3. Hosting emulator isn't routing to functions emulator"
fi
echo ""

# Test 3: aboutMe function
echo "🔍 Test 3: Testing aboutMe function"
echo "URL: http://localhost:5002/api/chat/about-me"
RESPONSE=$(curl -s -X POST http://localhost:5002/api/chat/about-me \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "message": "Hello", "conversationHistory": []}' \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)

if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "404" ] || [ "$HTTP_STATUS" == "400" ]; then
    echo -e "${GREEN}✓ aboutMe function accessible (Status: $HTTP_STATUS)${NC}"
else
    echo -e "${RED}❌ aboutMe function failed (Status: $HTTP_STATUS)${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 Summary"
echo "=============================================="
echo ""
echo "Emulator Endpoints:"
echo "  • Hosting: http://localhost:5002"
echo "  • Functions: http://localhost:5001"
echo "  • Firestore: http://localhost:8081"
echo "  • Auth: http://localhost:9099"
echo "  • UI Dashboard: http://localhost:4000"
echo ""
echo "To test functions from your app:"
echo "  Use: http://localhost:5002/api/chat/*"
echo ""
echo "See EMULATORS.md for detailed documentation."
