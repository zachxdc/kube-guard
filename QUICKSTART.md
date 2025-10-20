# KubeGuard Quick Start

## Fastest Way (1 Command)

```bash
export GEMINI_API_KEY="your-key"  # Get from https://aistudio.google.com/app/apikey
./quick-start.sh
```

Open http://localhost:5173 in your browser. That's it! 🎉

## Fast Way (2 Commands)

If already deployed:

```bash
./start-all.sh  # Start everything
./test.sh       # Generate test data
```

## Manual Way (Step by Step)

### 1. Get API Key

Visit https://aistudio.google.com/app/apikey

```bash
export GEMINI_API_KEY="AIzaSy..."
```

### 2. Deploy

```bash
./deploy.sh
```

### 3. Start Services

**Fast:**
```bash
./start-all.sh
```

**Manual (3 terminals):**
```bash
# Terminal 1
cd kubeguard-dashboard && npm run dev

# Terminal 2  
./port-forward.sh
```

### 4. Test

```bash
./test.sh
```

## What You'll See

Dashboard at http://localhost:5173 showing:

**High Risk (Red):**
```
SCORE: 0.95 | chmod 777 /etc/passwd
Reason: Granting full permissions to a critical system file
```

**Safe (Green):**
```
SCORE: 0.05 | ls -la
Reason: Normal file listing command
```

## Commands Reference

```bash
./quick-start.sh   # Deploy + start everything (first time)
./start-all.sh     # Start dashboard + port forward (daily)
./stop-all.sh      # Stop all services
./test.sh          # Generate sample data
./cleanup.sh       # Remove from Kubernetes
```

## View Logs

```bash
kubectl logs -f -l app=kubeguard-agent     # AI scoring results
kubectl logs -f -l app=risk-scorer         # Gemini API calls
```

## Troubleshooting

### Dashboard empty?

```bash
./test.sh  # Generate data
```

### No AI scoring?

```bash
kubectl logs -l app=risk-scorer | grep "Gemini API initialized"
```

Should see: `✅ Gemini API initialized successfully`

### Port already in use?

```bash
./stop-all.sh  # Clean up old processes
./start-all.sh # Restart
```
