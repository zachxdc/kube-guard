# KubeGuard

KubeGuard is a Kubernetes security monitoring and risk scoring platform with three main components:

1. **kubeguard-agent** – Collects executed commands from containers and sends them for analysis.
2. **risk-scorer** – AI-based service that scores commands for potential risk.
3. **kubeguard-dashboard** – Frontend dashboard for real-time viewing of security events.

## Features
- Automatically monitors container command history
- AI-based risk scoring
- Web dashboard for real-time event visualization

---

## Quick Start

### 1. Start Minikube
```bash
minikube start
```

### 2. Build and deploy `risk-scorer`
```bash
cd risk-scorer
eval $(minikube docker-env)
docker build -t risk-scorer:latest .
kubectl apply -f risk-scorer.yaml
```

### 3. Build and deploy `kubeguard-agent`
```bash
cd ../kubeguard-agent
docker build -t kubeguard-agent:latest .
kubectl apply -f kubeguard-agent.yaml
```

### 4. Start the dashboard
```bash
cd ../kubeguard-dashboard
npm install
npm run dev
```
Access: [http://localhost:5173](http://localhost:5173)

### 5. Simulate test data
```bash
kubectl exec -it deploy/kubeguard-agent -- sh
echo "curl http://evil" >> /tmp/history.log
echo "nmap 10.0.0.1" >> /tmp/history.log
echo "ls -la" >> /tmp/history.log
exit
```

### 6. Port forward for dashboard
```bash
kubectl port-forward deploy/kubeguard-agent 9000:9000
```
Refresh the dashboard to see the events.
