# KubeGuard Dashboard

React + TypeScript dashboard for real-time Kubernetes security monitoring with AI-powered threat detection.

## 🎭 Demo Modes

This dashboard supports two modes:

### 1. Demo Mode (for Vercel/public hosting)
- Uses simulated security events
- No backend required
- Perfect for showcasing the UI
- Set `VITE_API_URL=demo`

### 2. Production Mode (for real monitoring)
- Connects to KubeGuard Agent API
- Real-time data from Kubernetes cluster
- Requires backend deployment
- Set `VITE_API_URL=http://your-agent-url/events`

## 🚀 Quick Start

### Local Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

See [VERCEL_DEPLOY.md](../VERCEL_DEPLOY.md) for detailed instructions.

Quick deploy:
```bash
npm install -g vercel
vercel --prod
```

Set environment variable: `VITE_API_URL=demo`

## 🔧 Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# For demo mode (simulated data)
VITE_API_URL=demo

# For local K8s development
VITE_API_URL=http://localhost:9000/events

# For production with real backend
VITE_API_URL=https://your-api-endpoint.com/events
```

### Features

- ✨ Real-time event monitoring (5s refresh)
- 🔍 Search and filter capabilities
- 📊 Sortable columns (time, score, command)
- 🚨 Alert highlighting
- 📱 Responsive design
- 🎭 Demo mode with realistic mock data

## 📁 Project Structure

```
src/
├── App.tsx          # Main dashboard component
├── mockData.ts      # Demo mode data generator
├── main.tsx         # App entry point
└── index.css        # Global styles
```

## 🧪 Testing

### Test Demo Mode Locally

```bash
echo "VITE_API_URL=demo" > .env.local
npm run dev
```

Open http://localhost:5173 - you should see "🎭 Demo" in the header.

### Test Production Mode Locally

```bash
# Start KubeGuard backend first
kubectl port-forward deploy/kubeguard-agent 9000:9000

# Then start dashboard
echo "VITE_API_URL=http://localhost:9000/events" > .env.local
npm run dev
```

## 📚 Learn More

- [Full Documentation](../README.md)
- [Vercel Deployment Guide](../VERCEL_DEPLOY.md)
- [Quick Start Guide](../QUICKSTART.md)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
