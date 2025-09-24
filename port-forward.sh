#!/bin/bash

# KubeGuard Port Forward Script
# Automatically finds the agent pod and starts port forwarding

echo "🔗 Setting up port forwarding for KubeGuard Agent..."

# Find the agent pod
AGENT_POD=$(kubectl get pods -l app=kubeguard-agent -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$AGENT_POD" ]; then
    echo "❌ No KubeGuard Agent pod found. Make sure it's deployed first."
    echo "Run: ./deploy.sh"
    exit 1
fi

echo "📡 Found agent pod: $AGENT_POD"
echo "🌐 Starting port forward on http://localhost:9000"
echo "💡 Dashboard will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop port forwarding"

kubectl port-forward "$AGENT_POD" 9000:9000