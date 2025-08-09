# Risk Scorer

Risk Scorer is a lightweight AI service that scores shell commands for potential risk.

## Features
- Parses command text
- Matches against known dangerous keywords
- Returns a risk score between 0 and 1

---

## Deploy
```bash
eval $(minikube docker-env)
docker build -t risk-scorer:latest .
kubectl apply -f risk-scorer.yaml
```

## API Example
**Request:**
```bash
POST /score
{
  "command": "curl http://evil"
}
```

**Response:**
```json
{
  "score": 0.87,
  "status": "🚨"
}
```
