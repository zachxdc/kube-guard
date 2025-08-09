from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import math

app = FastAPI()

WEIGHTS = {
    "nmap": 3.0, "masscan": 3.2, "nc": 2.8, "netcat": 2.8,
    "curl": 1.8, "wget": 1.6, "powershell": 2.5, "bash -i": 3.0,
    "chmod 777": 2.2, "base64 -d": 2.0, "openssl": 1.6, "mkfifo": 2.2,
    "tcpdump": 1.4, "scp": 1.3, "ssh": 1.2,
}
BIAS = -2.0

class Payload(BaseModel):
    lines: List[str]

def score_one(text: str) -> float:
    t = text.lower()
    s = BIAS
    for k, w in WEIGHTS.items():
        if k in t:
            s += w
    return 1.0 / (1.0 + math.exp(-s))

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/score")
def score(payload: Payload):
    return {"scores": [score_one(x) for x in payload.lines]}