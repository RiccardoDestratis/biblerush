#!/bin/bash
echo "🛑 Killing Next.js dev server..."
pkill -f "next dev" || echo "No running server found"

echo "🧹 Clearing cache..."
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null || true

echo "🚀 Starting dev server..."
pnpm dev
