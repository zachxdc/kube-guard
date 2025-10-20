#!/bin/bash

set -e

echo "🚀 Starting KubeGuard (Fast Mode)..."

# Check if pods are running
if ! kubectl get deployment kubeguard-agent &>/dev/null; then
    echo "❌ KubeGuard not deployed yet. Please run: ./deploy.sh"
    exit 1
fi

# Start port forwarding in background
echo "🔗 Starting port forwarding..."
AGENT_POD=$(kubectl get pods -l app=kubeguard-agent -o jsonpath='{.items[0].metadata.name}')
kubectl port-forward $AGENT_POD 9000:9000 &>/dev/null &
PORT_FORWARD_PID=$!
echo "✅ Port forwarding started (PID: $PORT_FORWARD_PID)"

# Wait for port forward to be ready
sleep 2

# Start dashboard in background
echo "🎨 Starting dashboard..."
cd kubeguard-dashboard
npm run dev &>/dev/null &
DASHBOARD_PID=$!
echo "✅ Dashboard started (PID: $DASHBOARD_PID)"

# Wait for dashboard to be ready
sleep 3

echo ""
echo "✅ KubeGuard is running!"
echo ""
echo "📱 Dashboard: http://localhost:5173"
echo "🔌 Backend:   http://localhost:9000"
echo ""
echo "🧪 Generate test data: ./test.sh"
echo "📊 View logs: kubectl logs -f -l app=kubeguard-agent"
echo ""
echo "🛑 To stop: ./stop-all.sh"
echo ""
echo "Press Ctrl+C to view this terminal, services will keep running in background"

