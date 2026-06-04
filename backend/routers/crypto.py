import os
import random
import requests
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/crypto", tags=["crypto"])

_COINGECKO_URL   = "https://api.coingecko.com/api/v3/coins/markets"
_OPENROUTER_URL  = "https://openrouter.ai/api/v1/chat/completions"
_OPENROUTER_MODEL = "openrouter/free"
_IMGFLIP_URL     = "https://api.imgflip.com/get_memes"

_COIN_FIELDS = {"id", "symbol", "name", "current_price", "image", "price_change_percentage_24h"}

_INSIGHT_PROMPT = (
    "You are a concise and professional crypto market analyst. "
    "Give a single short insight of exactly 2 sentences for a crypto investor today. "
    "Be specific, engaging, and avoid generic advice."
)

_NEWS = [
    {"title": "Bitcoin Surges Past $65,000 as Institutional Demand Picks Up",      "source": "CoinDesk", "date": "2025-06-03"},
    {"title": "Ethereum Layer-2 Networks Record $12B in Total Value Locked",        "source": "The Block", "date": "2025-06-02"},
    {"title": "SEC Approves Spot Ethereum ETF Applications from Three Major Issuers", "source": "Reuters",  "date": "2025-06-01"},
    {"title": "Solana Processes 100 Million Transactions in a Single Day",          "source": "Decrypt",  "date": "2025-05-31"},
]


def _call_openrouter(prompt: str) -> str | None:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return None
    try:
        resp = requests.post(
            _OPENROUTER_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": _OPENROUTER_MODEL, "messages": [{"role": "user", "content": prompt}]},
            timeout=20,
        )
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"].strip()
    except requests.Timeout:
        pass
    return None


@router.get("/market")
def get_market_data():
    resp = requests.get(_COINGECKO_URL, params={"vs_currency": "usd", "per_page": 10, "page": 1}, timeout=10)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"CoinGecko returned {resp.status_code}")
    return [{f: coin.get(f) for f in _COIN_FIELDS} for coin in resp.json()]


@router.get("/insight")
def get_daily_insight():
    if not os.getenv("OPENROUTER_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured")

    try:
        resp = requests.post(
            _OPENROUTER_URL,
            headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}", "Content-Type": "application/json"},
            json={"model": _OPENROUTER_MODEL, "messages": [{"role": "user", "content": _INSIGHT_PROMPT}]},
            timeout=20,
        )
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="OpenRouter request timed out")

    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="AI provider rate limit reached — try again in a moment")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OpenRouter returned {resp.status_code}")

    return {"insight": resp.json()["choices"][0]["message"]["content"].strip()}


@router.get("/news")
def get_crypto_news():
    return _NEWS


@router.get("/meme")
def get_random_meme():
    try:
        imgflip_resp = requests.get(_IMGFLIP_URL, timeout=10)
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Imgflip request timed out")

    if imgflip_resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Imgflip returned {imgflip_resp.status_code}")

    memes = imgflip_resp.json().get("data", {}).get("memes", [])
    if not memes:
        raise HTTPException(status_code=502, detail="No memes returned from Imgflip")

    meme      = random.choice(memes)
    meme_name = meme.get("name", "a meme")
    caption   = _call_openrouter(
        f'Write exactly one short funny crypto investor caption for the "{meme_name}" meme. '
        "Max 12 words. No hashtags or quotation marks. Just the caption text."
    )

    return {"url": meme["url"], "name": meme_name, "caption": caption}
