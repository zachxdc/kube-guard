#!/bin/bash

# KubeGuard Dashboard Start Script
# Automatically installs dependencies and starts the dashboard

cd "$(dirname "$0")"

echo "🎨 Starting KubeGuard Dashboard..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting development server..."
npm run dev