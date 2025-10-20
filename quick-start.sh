#!/bin/bash

set -e

echo "⚡ KubeGuard Quick Start"
echo ""

# Check if already deployed
if kubectl get deployment kubeguard-agent &>/dev/null; then
    echo "✅ KubeGuard already deployed"
else
    echo "🚀 Deploying KubeGuard..."
    if [ -z "$GEMINI_API_KEY" ]; then
        echo "⚠️  GEMINI_API_KEY not set - will use keyword scoring"
        echo "   (Set it and redeploy for AI scoring)"
    fi
    ./deploy.sh
fi

echo ""
echo "🎬 Starting all services..."
./start-all.sh

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "🎉 KubeGuard is ready!"
echo ""
echo "   Dashboard: http://localhost:5173"
echo ""
echo "Next: Run './test.sh' to generate sample data"

