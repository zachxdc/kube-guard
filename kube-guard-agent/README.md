# KubeGuard Agent

The Agent collects command history from Kubernetes containers, sends them to the Risk Scorer, and serves them through an API for the dashboard.

## Features
- Watches `/tmp/history.log` for new commands
- Sends commands to Risk Scorer for scoring
- Provides `/events` API for dashboard queries

---

## Deploy
```bash
eval $(minikube docker-env)
docker build -t kubeguard-agent:latest .
kubectl apply -f kubeguard-agent.yaml
```

## Test
```bash
kubectl exec -it deploy/kubeguard-agent -- sh
echo "curl http://evil" >> /tmp/history.log
echo "nmap 10.0.0.1" >> /tmp/history.log
echo "ls -la" >> /tmp/history.log
exit
```

## Port Forward
```bash
kubectl port-forward deploy/kubeguard-agent 9000:9000
```

Access events at: [http://localhost:9000/events](http://localhost:9000/events)
