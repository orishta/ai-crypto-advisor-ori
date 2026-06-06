# ML Bonus — Recommendation Engine Plan

## Why ML?

I am currently taking a Machine Learning course at my studies, so I wanted to apply what I learned in a real project rather than just in homework exercises. The idea of a personalized content feed felt like a natural fit — recommendation engines are one of the core applications we studied, and building one here let me think concretely about the theory (user vectors, similarity scoring, iterative refinement) instead of just abstractly.

## The Concept

The goal of this dashboard is to provide personalized crypto content. Rather than building a complex, overkill neural network from the start, my plan was to first build a solid data-collection foundation and then iterate toward a recommendation engine. I deliberately chose this phased approach after thinking about the alternatives:

- **Train a neural network upfront**: Overkill. No training data exists yet, and a deep model would be unmaintainable for a solo project at this stage.
- **Use a third-party recommendation API**: Loses the learning opportunity and adds an external dependency with cost and latency.
- **Simple heuristic rules (hardcode preferences)**: Too rigid, would not actually personalize over time.
- **My chosen approach — lightweight vector similarity built on top of collected telemetry**: The right tradeoff. It starts simple, uses real user behavior, and the math is something I actually understand from my course.

## Step 1: Smart Data Collection (Implemented)

To recommend the right content, I need to know what "crypto persona" the user fits into (e.g., a "HODLer", a "DeFi Degen", or a "Bear Market Doomer").

I designed the backend to categorize content silently. For example, if a meme fetched from Reddit contains keywords like "crash", "dip", or "rekt", it is tagged as `bear_market`. When a user upvotes it, we do not just save "User X liked Meme Y". We store the content type, content key, vote value, and category — meaning over time we can reconstruct a full picture of what each user responds positively to.

This schema was a decision I made after looking at how Spotify and YouTube describe their early recommendation pipelines — both started with explicit signals (likes, skips) before adding implicit ones.

## Step 2: The Future Recommendation Engine

Once we have enough telemetry, implementing the ML model becomes straightforward:

**User Vectorization**: Represent each user as a vector based on their category vote scores.
For example: `{ bull_market: 0.8, bear_market: 0.1, animal_coins: 0.5, general: 0.3 }`

**Content Scoring**: When fetching new content (news or memes), a lightweight Python script on the backend (using scikit-learn or just cosine similarity manually — which I know how to implement from my course) scores each item against the user's vector.

**Delivery**: The dashboard filters out low-scoring content and surfaces the top matches — so a user who upvotes "Doge" memes and bull-market news stops seeing deep Ethereum protocol updates, and vice versa.

By storing vote telemetry in SQLite and keeping a decoupled Python backend, the infrastructure is already fully ready to plug in this logic without rewriting the core app.
