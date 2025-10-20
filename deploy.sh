#!/bin/bash

set -e

echo "🚀 Starting KubeGuard deployment..."

if ! minikube status &> /dev/null; then
    echo "📦 Starting Minikube..."
    minikube start
fi

echo "🐳 Setting up Docker environment..."
eval $(minikube docker-env)

echo "⚙️  Creating configuration..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubeguard-config
data:
  THRESHOLD: "0.6"
  KEYWORDS: "nmap,nc,nc-,netcat,masscan,curl,wget,powershell,bash -i,chmod 777,chattr,base64 -d,openssl,mkfifo"
EOF

if [ -n "$GEMINI_API_KEY" ]; then
    echo "🔑 Creating Gemini API Key Secret..."
    kubectl create secret generic gemini-api-key \
        --from-literal=api-key="$GEMINI_API_KEY" \
        --dry-run=client -o yaml | kubectl apply -f -
    echo "✅ Gemini API Key configured"
else
    echo "ℹ️  GEMINI_API_KEY not set, will use keyword-based scoring"
    echo "   To enable AI scoring, set GEMINI_API_KEY environment variable and redeploy"
fi

echo "🤖 Building and deploying Risk Scorer..."
cd kube-guard-agent/risk-scorer
docker build -t risk-scorer:latest .
kubectl apply -f risk-scorer.yaml
cd ../..

echo "🛡️  Building and deploying KubeGuard Agent..."
cd kube-guard-agent
docker build -t kubeguard-agent:latest .
kubectl apply -f kubeguard-agent.yaml
cd ..

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=120s deployment/risk-scorer
kubectl wait --for=condition=available --timeout=120s deployment/kubeguard-agent

AGENT_POD=$(kubectl get pods -l app=kubeguard-agent -o jsonpath='{.items[0].metadata.name}')

echo "✅ KubeGuard deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Install dashboard dependencies: cd kubeguard-dashboard && npm install"
echo "2. Start the dashboard: npm run dev"
echo "3. In another terminal, run port forwarding: kubectl port-forward $AGENT_POD 9000:9000"
echo "4. Access dashboard at: http://localhost:5173"
echo ""
echo "🧪 To test with sample data:"
echo "kubectl exec -it $AGENT_POD -- sh -c 'echo \"curl http://evil\" >> /tmp/fake_bash_history.log'"
echo "kubectl exec -it $AGENT_POD -- sh -c 'echo \"nmap 10.0.0.1\" >> /tmp/fake_bash_history.log'"
