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
eval $(minikube docker-env)
```

### 2. Build and deploy `risk-scorer`

```bash
cd kube-guard-agent/risk-scorer
docker build -t risk-scorer:latest .
kubectl apply -f risk-scorer.yaml
```

### 3. Build and deploy `kubeguard-agent`

```bash
# Create the configuration for the kubeguard-agent
cat <<EOF > kubeguard-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubeguard-config
data:
  THRESHOLD: "0.6"
  KEYWORDS: "nmap,nc,nc-,netcat,masscan,curl,wget,powershell,bash -i,chmod 777,chattr,base64 -d,openssl,mkfifo"
EOF

# Apply the ConfigMap
kubectl apply -f kubeguard-config.yaml

# Build and deploy the agent
docker build -t kubeguard-agent:latest .
kubectl apply -f kubeguard-agent.yaml
```

### 4. Start the dashboard

```bash
cd kubeguard-dashboard
npm install
npm run dev
```

Access: [http://localhost:5173](http://localhost:5173)

### 5. Port forward for dashboard

```bash
kubectl get pods
kubectl port-forward <kubeguard-agent-pod-name> 9000:9000
```

### 6. Simulate test data

```bash
kubectl exec -it deploy/kubeguard-agent -- sh
echo "curl http://evil" >> /tmp/history.log
echo "nmap 10.0.0.1" >> /tmp/history.log
echo "ls -la" >> /tmp/history.log
exit
```

### 7. Port forward for dashboard

```bash
kubectl port-forward deploy/kubeguard-agent 9000:9000
```

Refresh the dashboard to see the events.
