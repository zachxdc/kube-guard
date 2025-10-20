from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Tuple, Optional
import math
import os
import time
import hashlib
import logging
from collections import OrderedDict

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

WEIGHTS = {
    "nmap": 3.0, "masscan": 3.2, "nc": 2.8, "netcat": 2.8,
    "curl": 1.8, "wget": 1.6, "powershell": 2.5, "bash -i": 3.0,
    "chmod 777": 2.2, "base64 -d": 2.0, "openssl": 1.6, "mkfifo": 2.2,
    "tcpdump": 1.4, "scp": 1.3, "ssh": 1.2,
}
BIAS = -2.0

CACHE_MAX_SIZE = 1000
CACHE_TTL_SECONDS = 3600  # 1 hour
cache: OrderedDict[str, Tuple[float, str, float]] = OrderedDict()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = None

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        logger.info("🔍 Listing available models...")
        try:
            models = genai.list_models()
            available_models = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
            logger.info(f"📋 Available models: {available_models}")
            
            preferred_models = [
                'models/gemini-2.5-flash',
                'models/gemini-2.0-flash',
                'models/gemini-flash-latest'
            ]
            
            selected_model = None
            for pm in preferred_models:
                if pm in available_models:
                    selected_model = pm
                    break
            
            if not selected_model and available_models:
                selected_model = available_models[0]
            
            if selected_model:
                model_name = selected_model.replace('models/', '')
                GEMINI_MODEL = genai.GenerativeModel(model_name)
                logger.info(f"✅ Gemini API initialized successfully with model: {model_name}")
            else:
                logger.warning("⚠️ No models support generateContent")
                GEMINI_MODEL = None
        except Exception as e:
            logger.warning(f"⚠️ Failed to list models: {e}, trying default model")
            GEMINI_MODEL = genai.GenerativeModel('gemini-pro')
            logger.info("✅ Gemini API initialized with fallback model: gemini-pro")
    except Exception as e:
        logger.warning(f"⚠️ Failed to initialize Gemini API: {e}")
        GEMINI_MODEL = None
elif not GEMINI_API_KEY:
    logger.info("ℹ️ GEMINI_API_KEY not set, using keyword-based scoring")
elif not GEMINI_AVAILABLE:
    logger.warning("⚠️ google-generativeai package not installed, using keyword-based scoring")

class Payload(BaseModel):
    lines: List[str]

class ScoringResult(BaseModel):
    scores: List[float]
    reasons: List[str]
    source: str

def get_cache_key(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()

def get_from_cache(text: str) -> Optional[Tuple[float, str]]:
    key = get_cache_key(text)
    if key in cache:
        score, reason, timestamp = cache[key]
        if time.time() - timestamp < CACHE_TTL_SECONDS:
            cache.move_to_end(key)
            return score, reason
        else:
            del cache[key]
    return None

def add_to_cache(text: str, score: float, reason: str):
    key = get_cache_key(text)
    cache[key] = (score, reason, time.time())
    if len(cache) > CACHE_MAX_SIZE:
        cache.popitem(last=False)

def score_one_keywords(text: str) -> Tuple[float, str]:
    t = text.lower()
    s = BIAS
    matched_keywords = []
    
    for k, w in WEIGHTS.items():
        if k in t:
            s += w
            matched_keywords.append(k)
    
    score = 1.0 / (1.0 + math.exp(-s))
    
    if matched_keywords:
        reason = f"Detected keywords: {', '.join(matched_keywords)}"
    else:
        reason = "No threat keywords detected"
    
    return score, reason

def score_with_gemini(commands: List[str]) -> List[Tuple[float, str]]:
    if not GEMINI_MODEL:
        return [score_one_keywords(cmd) for cmd in commands]
    
    try:
        prompt = """You are a Kubernetes security expert. Evaluate the security risk of the following container commands.

For each command, return a risk score between 0 and 1 and a brief reason in English:
- 0.0-0.3: Low risk (normal operations)
- 0.3-0.6: Medium risk (requires attention)
- 0.6-1.0: High risk (suspicious/malicious behavior)

Consider these factors:
- Network scanning/attack tools (nmap, masscan, etc.)
- Remote code execution (curl|bash, wget|sh, etc.)
- Privilege escalation (chmod 777, setuid, etc.)
- Data exfiltration (base64 encoding for transmission, etc.)
- Reverse shells (nc, netcat, mkfifo, etc.)
- But distinguish between normal use and malicious use

Command list:
"""
        for i, cmd in enumerate(commands, 1):
            prompt += f"{i}. {cmd}\n"
        
        prompt += """
Return the results in JSON array format, with each element containing score (float) and reason (string) in English.
Example format:
[
  {"score": 0.95, "reason": "nmap network scanning tool used for reconnaissance"},
  {"score": 0.05, "reason": "Normal ls listing command"}
]

Return only the JSON array, no other text.
"""
        
        logger.info(f"🤖 Calling Gemini API for {len(commands)} commands")
        start_time = time.time()
        
        response = GEMINI_MODEL.generate_content(prompt)
        elapsed = time.time() - start_time
        
        logger.info(f"✅ Gemini API responded in {elapsed:.2f}s")
        
        response_text = response.text.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        import json
        results = json.loads(response_text)
        
        if not isinstance(results, list) or len(results) != len(commands):
            raise ValueError(f"Invalid response format: expected {len(commands)} results")
        
        parsed_results = []
        for item in results:
            score = float(item.get("score", 0.5))
            reason = item.get("reason", "AI analysis result")
            score = max(0.0, min(1.0, score))
            parsed_results.append((score, reason))
        
        return parsed_results
        
    except Exception as e:
        logger.error(f"❌ Gemini API error: {e}, falling back to keywords")
        return [score_one_keywords(cmd) for cmd in commands]

@app.get("/health")
def health():
    status = {
        "status": "ok",
        "gemini_available": GEMINI_MODEL is not None,
        "cache_size": len(cache),
        "cache_max_size": CACHE_MAX_SIZE
    }
    return status

@app.post("/score")
def score(payload: Payload) -> ScoringResult:
    commands = payload.lines
    
    if not commands:
        return ScoringResult(scores=[], reasons=[], source="none")
    
    scores = []
    reasons = []
    uncached_commands = []
    uncached_indices = []
    source = "cache"
    
    for i, cmd in enumerate(commands):
        cached = get_from_cache(cmd)
        if cached:
            score, reason = cached
            scores.append(score)
            reasons.append(reason)
        else:
            scores.append(None)
            reasons.append(None)
            uncached_commands.append(cmd)
            uncached_indices.append(i)
    
    if uncached_commands:
        if GEMINI_MODEL:
            source = "gemini"
            logger.info(f"📊 Cache miss for {len(uncached_commands)}/{len(commands)} commands")
        else:
            source = "keywords"
            logger.info(f"🔤 Using keyword scoring for {len(uncached_commands)} commands")
        
        new_results = score_with_gemini(uncached_commands)
        
        for idx, (score, reason) in zip(uncached_indices, new_results):
            scores[idx] = score
            reasons[idx] = reason
            add_to_cache(commands[idx], score, reason)
    else:
        logger.info(f"⚡ Cache hit for all {len(commands)} commands")
    
    cache_hits = len(commands) - len(uncached_commands)
    cache_hit_rate = (cache_hits / len(commands)) * 100 if commands else 0
    logger.info(f"📈 Cache stats: {cache_hits}/{len(commands)} hits ({cache_hit_rate:.1f}%)")
    
    return ScoringResult(
        scores=scores,
        reasons=reasons,
        source=source
    )
