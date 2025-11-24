#!/bin/bash

# Script to run both Next.js dev servers simultaneously
# Usage: ./run-both-servers.sh

echo "Starting server on port 3000..."
pnpm dev &
SERVER_3000_PID=$!

sleep 3

echo "Starting server on port 3002..."
# Use a different approach - run in background with output redirection
NEXT_DIST_DIR=.next-3002 pnpm dev:3002 &
SERVER_3002_PID=$!

echo ""
echo "✓ Both servers starting..."
echo "  - Port 3000: http://localhost:3000 (PID: $SERVER_3000_PID)"
echo "  - Port 3002: http://localhost:3002 (PID: $SERVER_3002_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $SERVER_3000_PID $SERVER_3002_PID

