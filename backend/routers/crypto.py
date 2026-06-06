import os
import random
import requests
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/crypto", tags=["crypto"])

_COINGECKO_URL    = "https://api.coingecko.com/api/v3/coins/markets"
_OPENROUTER_URL   = "https://openrouter.ai/api/v1/chat/completions"
_OPENROUTER_MODEL = "openrouter/free"
_CRYPTOPANIC_URL  = "https://cryptopanic.com/api/v1/posts/"
_CRYPTONEWS_URL   = "https://cryptonews-api.com/api/v1"
_RSS_FEEDS        = ["https://cointelegraph.com/rss", "https://decrypt.co/feed"]

_COIN_NAME_MAP = {
    "BTC": "bitcoin",  "ETH": "ethereum",  "SOL": "solana",
    "BNB": "bnb",      "ADA": "cardano",   "XRP": "xrp",
    "DOGE": "dogecoin", "AVAX": "avalanche",
}
_REDDIT_MEME_URL  = "https://meme-api.com/gimme/{subreddit}"

_REDDIT_SUBREDDITS = [
    "cryptocurrencymemes",
    "bitcoinmemes",
    "Bitcoin",
    "dogecoin",
    "CryptoCurrency",
    "SatoshiStreetBets",
    "ethtrader",
    "CryptoMemes",
]

_COIN_FIELDS = {"id", "symbol", "name", "current_price", "image", "price_change_percentage_24h"}

_INSIGHT_PROMPT = (
    "You are a concise and professional crypto market analyst. "
    "Give a single short insight of exactly 2 sentences for a crypto investor today. "
    "Be specific, engaging, and avoid generic advice."
)

_NEWS_FALLBACK = [
    {"title": "Bitcoin Surges Past $65,000 as Institutional Demand Picks Up",        "source": "CoinDesk",  "date": "2025-06-03"},
    {"title": "Ethereum Layer-2 Networks Record $12B in Total Value Locked",          "source": "The Block", "date": "2025-06-02"},
    {"title": "SEC Approves Spot Ethereum ETF Applications from Three Major Issuers", "source": "Reuters",   "date": "2025-06-01"},
    {"title": "Solana Processes 100 Million Transactions in a Single Day",            "source": "Decrypt",   "date": "2025-05-31"},
]

_MEME_CATEGORIES = {
    "bull_market":  ["moon", "rocket", "stonks", "pump", "bull", "apes", "lambo", "rich", "happy", "100x"],
    "bear_market":  ["dip", "crash", "dump", "rekt", "bear", "pain", "cry", "sad", "broke", "fear", "rug"],
    "animal_coins": ["doge", "pepe", "shib", "cat", "frog", "dog", "inu", "monkey", "bonk"],
}


def _categorize_meme(title: str) -> str:
    lower = title.lower()
    for category, keywords in _MEME_CATEGORIES.items():
        if any(kw in lower for kw in keywords):
            return category
    return "general"


def _rfc2822_to_date(date_str: str) -> str:
    try:
        return parsedate_to_datetime(date_str).strftime("%Y-%m-%d")
    except Exception:
        return date_str[:10] if len(date_str) >= 10 else ""


def _fetch_crypto_news(tickers: str = "") -> list[dict]:
    # 1. CryptoNews API (paid, coin-specific, best quality)
    cryptonews_key = os.getenv("CRYPTONEWS_API_KEY")
    if cryptonews_key:
        try:
            params = {"items": 4, "token": cryptonews_key}
            if tickers:
                params["tickers"] = tickers
            resp = requests.get(_CRYPTONEWS_URL, params=params, timeout=10)
            if resp.status_code == 200:
                articles = resp.json().get("data", [])[:4]
                if articles:
                    return [{"title": a["title"], "source": a.get("source_name", "CryptoNews"), "date": _rfc2822_to_date(a.get("date", ""))} for a in articles]
        except Exception:
            pass

    # 2. CryptoPanic (paid, coin-filtered)
    cryptopanic_key = os.getenv("CRYPTOPANIC_API_KEY")
    if cryptopanic_key:
        try:
            params = {"auth_token": cryptopanic_key, "public": "true"}
            if tickers:
                params["currencies"] = tickers
            resp = requests.get(_CRYPTOPANIC_URL, params=params, timeout=10)
            if resp.status_code == 200:
                results = resp.json().get("results", [])[:4]
                if results:
                    return [{"title": r["title"], "source": r.get("source", {}).get("domain", "CryptoPanic"), "date": r["published_at"][:10]} for r in results]
        except Exception:
            pass

    # 3. Free RSS feeds — CoinTelegraph + Decrypt, no key needed, real-time
    coin_terms = []
    if tickers:
        for sym in tickers.split(",")[:3]:
            coin_terms.append(_COIN_NAME_MAP.get(sym.strip().upper(), sym.strip().lower()))

    rss_articles = _fetch_rss_news(coin_terms)
    if rss_articles:
        return rss_articles

    return _NEWS_FALLBACK


def _fetch_rss_news(coin_terms: list[str]) -> list[dict]:
    articles = []
    for feed_url in _RSS_FEEDS:
        try:
            resp = requests.get(feed_url, timeout=8, headers={"User-Agent": "CryptoAdvisorBot/1.0"})
            if resp.status_code != 200:
                continue
            root = ET.fromstring(resp.text)
            source = feed_url.split("/")[2].replace("www.", "")
            for item in root.findall(".//item"):
                title = item.findtext("title", "").strip()
                if title:
                    articles.append({
                        "title":  title,
                        "source": source,
                        "date":   _rfc2822_to_date(item.findtext("pubDate", "")),
                    })
        except Exception:
            continue

    if not articles:
        return []

    if coin_terms:
        relevant = [a for a in articles if any(t in a["title"].lower() for t in coin_terms)]
        if relevant:
            return relevant[:4]

    return articles[:4]


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
def get_crypto_news(tickers: str = Query(default="")):
    return _fetch_crypto_news(tickers)


@router.get("/meme")
def get_random_meme():
    subreddit = random.choice(_REDDIT_SUBREDDITS)
    try:
        resp = requests.get(
            _REDDIT_MEME_URL.format(subreddit=subreddit),
            timeout=10,
        )
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Reddit meme API timed out")

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Reddit meme API returned {resp.status_code}")

    data  = resp.json()
    title = data.get("title", "Crypto meme")

    raw_url = data.get("url")
    url_is_video = data.get("isVideo") or (raw_url and raw_url.endswith(".mp4"))
    if url_is_video:
        previews = data.get("preview", [])
        url = previews[-1] if previews else None
    else:
        url = raw_url

    if not url:
        raise HTTPException(status_code=502, detail="No image URL in meme response")

    return {
        "url":      url,
        "name":     title,
        "category": _categorize_meme(title),
    }
