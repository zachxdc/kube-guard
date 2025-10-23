# KubeGuard

AI-powered Kubernetes security monitoring platform that detects suspicious commands in containers using Google Gemini.

![KubeGuard Dashboard](https://img.shields.io/badge/TypeScript-Dashboard-blue?logo=typescript)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes)
![AI Scoring](https://img.shields.io/badge/Gemini-2.5%20Flash-orange)

**[📖 Quick Start Guide](QUICKSTART.md)** | **[🔧 Risk Scorer Docs](kube-guard-agent/risk-scorer/README.md)**

## 🎭 Try Live Demo

**[🚀 Try Live Demo →](https://kube-guard-a4bs49wf2-zachs-projects-9379fc17.vercel.app/)** (Simulated data, no K8s required)

**🎯 Click "Generate Test Data" button to see more security events!**

## Features

- Real-time monitoring of container command execution
- AI-powered risk scoring with Google Gemini 2.5 Flash
- Smart caching with automatic keyword-based fallback
- Interactive React dashboard with detailed threat analysis
- Auto-refresh security events every 5 seconds

## Why KubeGuard?

| Before | After KubeGuard |
|--------|-----------------|
| Manual log checking | Real-time AI monitoring |
| Keyword-only detection | Context-aware threat analysis |
| No threat explanations | Detailed security reasons in English |
| Multiple terminals | One command startup |
| Hours of setup | 2 minutes deployment |

## Fast Running Instructions

**Ultra-fast (1 command):**

```bash
export GEMINI_API_KEY="your-key"  # Optional, for AI scoring
./quick-start.sh
```

Open http://localhost:5173 → Done! 🎉

**Or 2 commands if already deployed:**

```bash
./start-all.sh  # Start everything
./test.sh       # Generate test data
```

**Stop everything:**

```bash
./stop-all.sh
```

| Script | Purpose | When to use |
|--------|---------|-------------|
| `./quick-start.sh` | Deploy + Start everything | First time or full setup |
| `./start-all.sh` | Start dashboard + port forward | After deploy, daily use |
| `./stop-all.sh` | Stop all services | When done testing |
| `./cleanup.sh` | Remove from Kubernetes | Full cleanup |

---

## Detailed Quick Start

### Prerequisites

- Minikube or Kubernetes cluster
- Docker
- Node.js 18+
- kubectl

### 1. Get Gemini API Key (2 minutes, free forever)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)

```bash
export GEMINI_API_KEY="AIzaSy..."
```

> 💡 **Free tier:** 1,500 requests/day, perfect for dev/testing  
> 📝 **Note:** Without an API key, KubeGuard uses keyword-based scoring automatically.

### 2. Deploy KubeGuard

```bash
./deploy.sh
```

### 3. Start Services

**Option A - Fast (Recommended):**
```bash
./start-all.sh  # Starts everything in background
```

**Option B - Manual (3 terminals):**

Terminal 1:
```bash
cd kubeguard-dashboard && npm run dev
```

Terminal 2:
```bash
./port-forward.sh
```

### 4. Access Dashboard

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing

Generate sample security events:

```bash
./test.sh
```

This injects test commands like:
- `nmap -sS 192.168.1.0/24` (High risk: Network scanning)
- `chmod 777 /etc/passwd` (High risk: Privilege escalation)
- `ls -la /home` (Low risk: Normal operation)

## What You'll See

Dashboard at http://localhost:5173 will show real-time security events:

**High Risk Commands (Red Alert):**
```
🚨 SCORE: 0.95 | nmap -sS 192.168.1.0/24
Reason: Network scanning tool used for reconnaissance
Source: ✨ Gemini AI
```

```
🚨 SCORE: 0.90 | chmod 777 /etc/passwd
Reason: Granting full permissions to a critical system file 
        is a severe privilege escalation attempt
Source: ✨ Gemini AI
```

**Safe Commands (Green):**
```
✅ SCORE: 0.05 | ls -la /home
Reason: Normal file listing command
Source: ⚡ Cache (instant response)
```

```
✅ SCORE: 0.10 | ps aux
Reason: Standard command for displaying running processes
Source: ⚡ Cache
```

## Viewing Logs

```bash
# Agent logs (shows AI scoring results)
kubectl logs -f -l app=kubeguard-agent

# Risk Scorer logs (shows Gemini API calls)
kubectl logs -f -l app=risk-scorer
```

## Cleanup

Remove all KubeGuard components:

```bash
./cleanup.sh
```

## Tech Stack

- **Backend**: Go (Agent), Python + FastAPI (Risk Scorer)
- **Frontend**: React + TypeScript + Vite
- **AI**: Google Gemini 2.5 Flash
- **Infrastructure**: Kubernetes, Docker

## Architecture

```
Container Commands → KubeGuard Agent → Risk Scorer (Gemini AI) → Dashboard
```

## License

MIT
