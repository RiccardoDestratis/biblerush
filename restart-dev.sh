#!/bin/bash
echo "🛑 Killing Next.js dev server..."
pkill -f "next dev" || echo "No running server found"

echo "🔌 Killing any process on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"

echo "🧹 Clearing cache..."
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null || true

echo "🚀 Starting dev server..."
pnpm dev
