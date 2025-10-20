#!/bin/bash

echo "🛑 Stopping KubeGuard services..."

# Kill port forwarding
pkill -f "kubectl port-forward.*9000:9000" 2>/dev/null && echo "✅ Port forwarding stopped"

# Kill dashboard
pkill -f "vite.*kubeguard-dashboard" 2>/dev/null && echo "✅ Dashboard stopped"

# Kill any npm/node processes from kubeguard-dashboard
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✅ Port 5173 freed"

echo ""
echo "✅ All services stopped"
echo ""
echo "Note: Kubernetes pods are still running. To remove them: ./cleanup.sh"

