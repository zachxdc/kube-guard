# KubeGuard

KubeGuard is a Kubernetes security monitoring platform that automatically detects suspicious commands in containers using AI-based risk scoring.

![KubeGuard Dashboard](https://img.shields.io/badge/TypeScript-Dashboard-blue?logo=typescript)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes)
![AI Scoring](https://img.shields.io/badge/AI-Risk%20Scoring-orange)

## ✨ Features

- 🛡️ **Real-time monitoring** of container command execution
- 🤖 **AI-powered risk scoring** for security threat detection  
- 🎨 **Interactive dashboard** built with React + TypeScript
- ⚡ **Auto-refresh** security events every 5 seconds
- 🔍 **Search & filter** by command or security reason

---

## 🚀 Quick Start (3 Steps!)

### 1. Deploy KubeGuard
```bash
./deploy.sh
```

### 2. Start Dashboard (in new terminal)
```bash
cd kubeguard-dashboard && ./start.sh
```

### 3. Setup Port Forwarding (in another terminal)
```bash
./port-forward.sh
```

**That's it!** 🎉 Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

---

## 🧪 Test with Sample Data

```bash
./test.sh
```

This generates realistic security events to see KubeGuard in action!

---

## 📋 What Each Script Does

| Script | Purpose |
|--------|---------|
| `./deploy.sh` | 🚀 Deploys all KubeGuard components to Kubernetes |
| `./kubeguard-dashboard/start.sh` | 🎨 Installs dependencies and starts the React dashboard |
| `./port-forward.sh` | 🔗 Automatically connects dashboard to the agent |
| `./test.sh` | 🧪 Generates sample security events for testing |
| `./cleanup.sh` | 🧹 Removes all KubeGuard components from cluster |

## 🔧 Manual Setup (if needed)

<details>
<summary>Click to expand manual setup instructions</summary>

### Prerequisites
- Minikube or Kubernetes cluster
- Docker
- Node.js 18+
- kubectl

### 1. Start Minikube
```bash
minikube start
eval $(minikube docker-env)
```

### 2. Deploy Services
```bash
# Deploy Risk Scorer
cd kube-guard-agent/risk-scorer
docker build -t risk-scorer:latest .
kubectl apply -f risk-scorer.yaml

# Deploy Agent
cd ../
docker build -t kubeguard-agent:latest .
kubectl apply -f kubeguard-config.yaml
kubectl apply -f kubeguard-agent.yaml
```

### 3. Start Dashboard
```bash
cd kubeguard-dashboard
npm install
npm run dev
```

</details>

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Container      │───▶│  KubeGuard       │───▶│  Risk Scorer    │
│  Commands       │    │  Agent           │    │  (AI Service)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Dashboard       │
                       │  (React + TS)    │
                       └──────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Go (Agent), Python + FastAPI (Risk Scorer)
- **Frontend**: React + TypeScript + Vite
- **Infrastructure**: Kubernetes, Docker
- **AI**: Custom scoring algorithm with security keywords

---
