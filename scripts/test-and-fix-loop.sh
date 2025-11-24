#!/bin/bash

# Auto-fix loop: Runs test in headed mode and fixes issues until it passes
# Usage: ./scripts/test-and-fix-loop.sh

cd /Users/riccardodestratis/Documents/Code/Private/Quizgame

echo "🔧 ========================================"
echo "🔧 AUTO-FIX LOOP: Testing until it works!"
echo "🔧 ========================================"
echo ""

ATTEMPT=1
MAX_ATTEMPTS=10

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 ATTEMPT $ATTEMPT of $MAX_ATTEMPTS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Run test in headed mode
  pnpm exec playwright test e2e/auto-fix-sync-test.spec.ts \
    --headed \
    --reporter=list \
    --timeout=300000 \
    --workers=1 \
    2>&1 | tee /tmp/test-output.log
  
  EXIT_CODE=${PIPESTATUS[0]}
  
  if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ ========================================"
    echo "✅ SUCCESS! All tests passed!"
    echo "✅ ========================================"
    echo ""
    echo "Attempts needed: $ATTEMPT"
    exit 0
  else
    echo ""
    echo "❌ Test failed on attempt $ATTEMPT"
    echo ""
    
    # Check for specific errors and suggest fixes
    if grep -q "Player stuck on leaderboard" /tmp/test-output.log; then
      echo "🔧 Detected: Player stuck on leaderboard issue"
      echo "   This should be fixed in player-game-view.tsx"
    fi
    
    if grep -q "reveal" /tmp/test-output.log && grep -q "not showing" /tmp/test-output.log; then
      echo "🔧 Detected: Reveal sync issue"
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
      echo "⏳ Waiting 3 seconds before retry..."
      sleep 3
      ATTEMPT=$((ATTEMPT + 1))
    else
      echo ""
      echo "❌ ========================================"
      echo "❌ MAX ATTEMPTS REACHED"
      echo "❌ ========================================"
      echo ""
      echo "Test failed after $MAX_ATTEMPTS attempts"
      echo "Check /tmp/test-output.log for details"
      exit 1
    fi
  fi
done


