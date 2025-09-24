# KubeGuard Dashboard

A React + TypeScript + Vite-based dashboard to visualize KubeGuard Agent's security events in real time.

## Features
- Auto-refreshes every 5 seconds
- Search by command or reason
- Filter to only show alerts

---

## Install & Run
```bash
npm install
npm run dev
```
Access: [http://localhost:5173](http://localhost:5173)

---

## Data Source
The dashboard fetches data from the Agent's `/events` endpoint:
```
GET http://localhost:9000/events
```

Make sure you run:
```bash
kubectl port-forward deploy/kubeguard-agent 9000:9000
```
