# Risk Scorer

AI-powered risk scoring service using Google Gemini 2.5 Flash with intelligent caching and automatic fallback.

## Features

- Google Gemini 2.5 Flash integration for intelligent threat detection
- LRU cache with 1-hour TTL to minimize API calls
- Automatic fallback to keyword-based scoring
- Batch processing for efficient API usage
- Detailed threat explanations in English

## Quick Deploy

```bash
# Set API key (optional)
export GEMINI_API_KEY="your-key"

# Build and deploy
eval $(minikube docker-env)
docker build -t risk-scorer:latest .
kubectl apply -f risk-scorer.yaml
```

## API Endpoints

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "gemini_available": true,
  "cache_size": 45,
  "cache_max_size": 1000
}
```

### Score Commands

```bash
POST /score
Content-Type: application/json

{
  "lines": [
    "nmap -sV 192.168.1.1",
    "ls -la"
  ]
}
```

**Response:**
```json
{
  "scores": [0.95, 0.05],
  "reasons": [
    "Network scanning tool used for reconnaissance",
    "Normal file listing command"
  ],
  "source": "gemini"
}
```

**Source values:**
- `gemini`: Scored by Gemini AI
- `cache`: Retrieved from cache (instant)
- `keywords`: Fallback keyword-based scoring

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | No | None | Google Gemini API key |

### Cache Settings

Edit in `app.py`:

```python
CACHE_MAX_SIZE = 1000        # Maximum cached results
CACHE_TTL_SECONDS = 3600     # 1 hour expiration
```

## Gemini API Quotas (Free Tier)

- **15 requests/minute**
- **1,500 requests/day**
- **1M tokens/minute**

## Testing

```bash
# Port forward
kubectl port-forward svc/risk-scorer 8000:8000

# Test scoring
curl -X POST http://localhost:8000/score \
  -H "Content-Type: application/json" \
  -d '{"lines": ["nmap 10.0.0.1", "ls -la"]}'
```

## Logs

```bash
kubectl logs -f deployment/risk-scorer
```

**Example output:**
```
✅ Gemini API initialized successfully with model: gemini-2.5-flash
🤖 Calling Gemini API for 10 commands
✅ Gemini API responded in 1.2s
📈 Cache stats: 0/10 hits (0.0%)
⚡ Cache hit for all 10 commands
📈 Cache stats: 10/10 hits (100.0%)
```

## Troubleshooting

### No Gemini API Key

**Symptom:** Logs show "using keyword-based scoring"

**Solution:** This is normal. Service works with keyword scoring. To enable AI:

```bash
kubectl create secret generic gemini-api-key \
  --from-literal=api-key="YOUR_KEY" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl rollout restart deployment/risk-scorer
```

### API Rate Limit

**Symptom:** "rate limit exceeded" errors

**Solution:** Cache handles most requests. Free tier: 15 requests/minute is usually sufficient.

## Performance

- **First request**: 1-3 seconds (API call)
- **Cached requests**: <1ms
- **Batch processing**: 10 commands in 1 API call
- **Cache hit rate**: Typically >90% after warmup
