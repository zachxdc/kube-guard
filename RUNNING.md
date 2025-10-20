# KubeGuard - Complete Running Guide

## Prerequisites Check

Before starting, ensure you have:

```bash
docker --version        # Docker
minikube version       # Minikube
kubectl version        # kubectl
node --version         # Node.js 18+
```

## Step-by-Step Running Instructions

### Step 1: Get Gemini API Key (Optional but Recommended)

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy the key (starts with `AIzaSy...`)

### Step 2: Set Environment Variable

```bash
# In your terminal
export GEMINI_API_KEY="AIzaSy..."  # Replace with your actual key
```

**Important:** This needs to be set in the same terminal where you run `deploy.sh`.

### Step 3: Deploy KubeGuard to Kubernetes

```bash
cd /Users/zchen/Documents/GitHub/kube-guard
./deploy.sh
```

**What happens:**
- Starts Minikube (if not running)
- Builds Docker images for Risk Scorer and Agent
- Creates Kubernetes Secret with your API key
- Deploys all components
- Waits for pods to be ready (~2 minutes)

**Expected output:**
```
🚀 Starting KubeGuard deployment...
🐳 Setting up Docker environment...
⚙️  Creating configuration...
🔑 Creating Gemini API Key Secret...
✅ Gemini API Key configured
🤖 Building and deploying Risk Scorer...
🛡️  Building and deploying KubeGuard Agent...
⏳ Waiting for deployments to be ready...
✅ KubeGuard deployed successfully!
```

### Step 4: Start Dashboard (Terminal 1)

**Open a NEW terminal** and run:

```bash
cd /Users/zchen/Documents/GitHub/kube-guard/kubeguard-dashboard
npm install    # Only needed first time
npm run dev
```

**Expected output:**
```
  VITE v7.1.11  ready in 338 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal running** - don't close it!

### Step 5: Setup Port Forwarding (Terminal 2)

**Open ANOTHER new terminal** and run:

```bash
cd /Users/zchen/Documents/GitHub/kube-guard
./port-forward.sh
```

**Expected output:**
```
🔗 Setting up port forwarding for KubeGuard Agent...
📡 Found agent pod: kubeguard-agent-xxxx
🌐 Starting port forward on http://localhost:9000
Forwarding from 127.0.0.1:9000 -> 9000
Forwarding from [::1]:9000 -> 9000
```

**Keep this terminal running too!**

### Step 6: Access Dashboard

Open your browser and go to:

```
http://localhost:5173
```

You should see the KubeGuard dashboard loading data.

### Step 7: Generate Test Data

**Open a THIRD terminal** and run:

```bash
cd /Users/zchen/Documents/GitHub/kube-guard
./test.sh
```

**What happens:**
- Injects sample commands into the test log
- Commands are picked up by Agent
- Agent sends to Risk Scorer for AI analysis
- Results appear in Dashboard

**Expected in Dashboard:**
- High-risk commands (red) like `nmap`, `chmod 777 /etc/passwd`
- Low-risk commands (green) like `ls`, `ps aux`
- Each with AI-generated threat explanation in English

### Step 8: View Real-Time Logs (Optional)

To see what's happening behind the scenes:

**Terminal 4:**
```bash
# View Agent logs (scoring results)
kubectl logs -f -l app=kubeguard-agent
```

**Terminal 5:**
```bash
# View Risk Scorer logs (Gemini API calls)
kubectl logs -f -l app=risk-scorer
```

## Current Running Status

You should now have:

✅ **3 terminals running:**
1. Dashboard (port 5173)
2. Port forwarding (port 9000)
3. Available for commands/logs

✅ **Browser open:**
- http://localhost:5173 showing live security events

✅ **Kubernetes pods running:**
```bash
kubectl get pods
# Should show:
# kubeguard-agent-xxx    1/1  Running
# risk-scorer-xxx        1/1  Running
```

## Example Session

Here's what a complete session looks like:

**Terminal 1 - Dashboard:**
```
$ cd kubeguard-dashboard
$ npm run dev
  ➜  Local:   http://localhost:5173/
```

**Terminal 2 - Port Forward:**
```
$ ./port-forward.sh
Forwarding from 127.0.0.1:9000 -> 9000
```

**Terminal 3 - Testing:**
```
$ ./test.sh
✅ Test data generated successfully!

$ kubectl logs -f -l app=kubeguard-agent
✨ Gemini | SCORE: 0.95 | 🚨 ALERT
   Command: chmod 777 /etc/passwd
   Reason: Granting full permissions to a critical system file...
```

**Browser - Dashboard:**
```
[Live view showing:]
- 6 alerts (high risk)
- 4 safe commands (low risk)
- Real-time updates every 5 seconds
- AI-generated threat explanations
```

## Stopping Everything

To stop KubeGuard:

1. **Stop Dashboard:** Press `Ctrl+C` in Terminal 1
2. **Stop Port Forward:** Press `Ctrl+C` in Terminal 2
3. **Remove from Kubernetes:**
   ```bash
   ./cleanup.sh
   ```

## Restarting

If you want to restart after stopping:

1. Kubernetes pods are still running, just restart:
   - Dashboard: `cd kubeguard-dashboard && npm run dev`
   - Port forward: `./port-forward.sh`

2. To fully redeploy everything:
   ```bash
   ./cleanup.sh
   export GEMINI_API_KEY="your-key"
   ./deploy.sh
   # Then start Dashboard + Port Forward again
   ```

## Quick Checks

### Is everything running?

```bash
# Check pods
kubectl get pods
# Both should be "Running"

# Check dashboard
curl http://localhost:5173
# Should return HTML

# Check backend
curl http://localhost:9000/events
# Should return JSON with events
```

### Dashboard shows no data?

1. Check port forward is running
2. Check backend: `curl http://localhost:9000/events`
3. Generate test data: `./test.sh`

### No AI scoring?

```bash
# Check if Gemini is initialized
kubectl logs -l app=risk-scorer | grep "Gemini API initialized"

# Should see:
# ✅ Gemini API initialized successfully with model: gemini-2.5-flash
```

If not, your API key might not be set. Redeploy:
```bash
export GEMINI_API_KEY="your-key"
kubectl delete pod -l app=risk-scorer
```

## Summary

**You need 3 things running simultaneously:**

1. ✅ Dashboard (Terminal 1: `npm run dev`)
2. ✅ Port Forward (Terminal 2: `./port-forward.sh`)
3. ✅ Kubernetes Pods (deployed once with `./deploy.sh`)

**Then access:** http://localhost:5173

That's it! 🎉

