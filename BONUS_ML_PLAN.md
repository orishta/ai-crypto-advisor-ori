# ML Improvement Plan: Personalised Insights via RAG + User Segmentation via PCA

## 1. Collected Data — The Feedback Foundation

Every user vote is stored in the `votes` table:

| Column | Type | Example |
|---|---|---|
| `user_id` | Integer FK | 7 |
| `content_type` | String | `"insight"` / `"meme"` |
| `content_key` | String | `"BullishsignalonBTC"` |
| `value` | String | `"up"` / `"down"` |
| `created_at` | DateTime | `2025-06-04T12:00:00` |

Over time this table becomes a **labelled dataset** linking user identity to content quality signals.

---

## 2. User Feature Vectors

Each registered user can be represented as a 16-dimensional real-valued vector **v_u** built from their onboarding answers and accumulated votes:

```
v_u = [
  # Coin interests (multi-hot, 8 dims)
  btc, eth, sol, bnb, ada, xrp, doge, avax,

  # Investor type (one-hot, 2 dims)
  is_hodler, is_day_trader,

  # Preferred content (one-hot, 4 dims)
  prefers_news, prefers_insights, prefers_memes, prefers_all,

  # Engagement signals (2 dims)
  insight_vote_ratio,   # up_votes / (up_votes + down_votes + ε)
  meme_vote_ratio,
]
```

**Cold-start users** (new, no votes) get a vector built entirely from onboarding answers with the two engagement dims set to 0.5 (neutral prior). As they vote, the ratios update and their representation becomes richer.

---

## 3. PCA — User Segmentation and Visualisation

### Why PCA here
The 16-dimensional space is sparse (most coin flags are 0) and highly correlated (HODLers tend to prefer Insights; Day Traders tend to prefer live prices). PCA finds the directions of maximum variance — reducing noise and making downstream clustering more stable.

### Training pipeline

```python
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import numpy as np

# 1. Collect user vectors from DB (nightly batch job or on-demand)
X = build_user_matrix(db)              # shape: (n_users, 16)

# 2. Standardise — PCA is sensitive to scale
X_scaled = StandardScaler().fit_transform(X)

# 3. Reduce to 2 principal components for visualisation / clustering
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)     # shape: (n_users, 2)

print(f"Variance explained: {pca.explained_variance_ratio_.sum():.1%}")

# 4. K-Means clustering in the reduced space
kmeans = KMeans(n_clusters=4, random_state=42).fit(X_2d)
labels = kmeans.labels_
```

### Expected clusters (examples)
| Cluster | Profile | Dominant features |
|---|---|---|
| 0 | BTC/ETH HODLer | btc=1, eth=1, is_hodler=1, prefers_insights=1 |
| 1 | Altcoin Day Trader | sol=1, bnb=1, is_day_trader=1, prefers_news=1 |
| 2 | Meme Collector | doge=1, is_hodler=1, prefers_memes=1, meme_vote_ratio≈0.9 |
| 3 | Broad Explorer | all coins, prefers_all=1 |

### Application
- Each cluster gets a **tuned insight prompt** (e.g., cluster 1 gets a short-term price action prompt; cluster 0 gets a long-horizon macro prompt).
- Cold-start assignment: new user → find nearest centroid by Euclidean distance in PCA space using only onboarding dims → assign cluster immediately without needing any vote history.
- Over time, cluster membership can seed a **collaborative filtering** model: users in the same cluster who voted up on an insight → that insight is surfaced to other same-cluster users who haven't seen it yet.

---

## 4. RAG — Personalised Insight Generation

### Problem with the current approach
The existing `/api/crypto/insight` endpoint sends a single generic prompt to OpenRouter. The output is not grounded in current events and is identical for all users regardless of their preferences.

### RAG architecture

#### Offline indexing pipeline (runs daily)
```
CryptoPanic RSS / free news API
        │
        ▼
   article chunker (300-token windows, overlap 50 tokens)
        │
        ▼
   sentence-transformers/all-MiniLM-L6-v2   ← free, runs on CPU
        │
        ▼
   ChromaDB (file-backed vector store, free, no infra)
   stored with metadata: { coins_mentioned, date, source }
```

#### Online retrieval + generation (per authenticated request)
```python
def get_personalised_insight(user: User) -> str:
    prefs  = user.preferences
    coins  = " ".join(prefs["coins"])
    itype  = prefs["investorType"]

    # 1. Form retrieval query from user profile
    query  = f"{coins} {itype} crypto market analysis"

    # 2. Embed query and retrieve top-5 relevant news passages
    hits   = chroma_collection.query(
        query_texts=[query],
        n_results=5,
        where={"coins_mentioned": {"$in": prefs["coins"]}},
    )
    context = "\n\n".join(hits["documents"][0])

    # 3. Augmented prompt
    system = (
        f"You are a concise crypto analyst advising a {itype}. "
        "Use only the provided context. Do not invent facts."
    )
    user_msg = (
        f"Based on these recent articles:\n{context}\n\n"
        f"Write exactly 2 sentences of actionable insight for someone focused on {coins}."
    )

    return call_openrouter(system, user_msg)
```

#### Modified endpoint
`GET /api/crypto/insight` checks the `Authorization` header:
- **Authenticated** → `get_personalised_insight(current_user)` (RAG path)
- **Unauthenticated** → current generic prompt (unchanged fallback)

This keeps the endpoint backward-compatible while delivering personalisation for logged-in users.

---

## 5. Closing the Feedback Loop

The vote data collected from each insight links a `(user_cluster, content_key, value)` triple to a generation. Over time:

1. **Retrieval quality signal**: if a cluster consistently thumbs-down insights retrieved from a particular source, reduce that source's relevance weight in the ChromaDB query for that cluster.
2. **Prompt quality signal**: if a cluster thumbs-up insights with a specific style, reinforce that prompt variant in an A/B prompt rotation.
3. **Long-term**: vote data can supervise a **ranking head** on top of the embedding model — fine-tune the retrieval embeddings so that articles leading to thumbs-up insights are ranked higher for similar users.

---

## 6. Infrastructure Requirements

| Component | Tool | Cost |
|---|---|---|
| Vector store | ChromaDB (file-backed, persistent volume on Render) | Free |
| Embedding model | `sentence-transformers/all-MiniLM-L6-v2` via HuggingFace | Free |
| News source | CryptoPanic free tier or RSS aggregation | Free |
| Daily index job | Render cron job (or `apscheduler` inside the FastAPI process) | Free tier |

**Memory note**: `all-MiniLM-L6-v2` requires ~90 MB RAM. Render's free tier allows 512 MB — sufficient.

---

## 7. Scope and Limitations

- PCA is meaningful only once the user base exceeds ~100 users; before that, clusters are unstable.
- Vote signals are sparse early on; the cold-start heuristic (nearest centroid from onboarding) bridges this gap.
- ChromaDB persistence on Render free tier is ephemeral unless a disk is mounted; index rebuilds nightly anyway so this is acceptable for an MVP.
- `all-MiniLM-L6-v2` is English-only; a multilingual alternative (`paraphrase-multilingual-MiniLM-L12-v2`) can be substituted with minimal code change.
