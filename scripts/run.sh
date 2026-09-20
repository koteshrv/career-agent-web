#!/bin/bash

# Kill any existing processes on port 5174
lsof -t -i:5174 | xargs -r kill -9 2>/dev/null || true

# Change to the project root directory
cd "$(dirname "$0")/.."

# Start Vite Frontend
echo "✨ Starting CareerAgent Web Frontend on port 5174..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

npm run dev -- --port 5174 &
FRONTEND_PID=$!

echo "====================================="
echo "✅ Web Frontend running on http://localhost:5174"
echo "====================================="
echo "Press Ctrl+C to stop the server."

trap "kill $FRONTEND_PID; exit" INT TERM
wait

