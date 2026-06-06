## ML Bonus

### Why ML?

I am currently taking a Machine Learning course, and I wanted to apply the concepts I learned to a real-world project rather than limiting myself to homework exercises. A personalized content feed is a natural application of recommendation systems, one of the core topics in my studies. Building this allowed me to translate abstract theory—such as user vectors, similarity scoring, and iterative refinement—into a concrete, working system.

### The Concept

The objective of this dashboard is to provide a truly personalized crypto content experience. Rather than implementing an overly complex neural network prematurely, I adopted a phased approach. I chose to build a robust data-collection foundation first, which will allow me to layer on a recommendation engine as the dataset grows. This avoids the pitfalls of building an unmaintainable model before having sufficient training data, while also maintaining full control over the system's logic and latency.

### Step 1: Smart Data Collection (Implemented)

To provide accurate recommendations, I need to understand the user’s "crypto persona" (e.g., a "HODLer," a "DeFi Degen," or a "Bear Market Doomer").

I designed the backend to categorize content dynamically. When a meme is fetched, it is analyzed for sentiment and context. When a user interacts with that content, the system records more than just a simple "like." We store the content type, the unique content key, the vote value, and the associated category. By analyzing this telemetry, the system logs the user's specific response to different themes. This schema was inspired by early-stage recommendation pipelines at platforms like Spotify and YouTube, where explicit interaction signals are used to establish a baseline before incorporating implicit behavior.

### Step 2: The Future Recommendation Engine

With this telemetry in place, the path to a fully functional ML model is straightforward:

* **User Vectorization:** We represent each user as a vector based on their category vote scores (e.g., `{bull_market: 0.8, bear_market: 0.1, animal_coins: 0.5}`).
* **Content Scoring:** New content is scored against the user’s vector using lightweight similarity math, such as cosine similarity.
* **Personalization:** The dashboard surfaces content with the highest affinity scores, ensuring that a user who engages with "Doge" memes and bull-market news receives content aligned with those interests.

The system tracks user activity in real-time, building a sophisticated profile that enables us to learn the user's preferences, facilitate precise personalization, and generate AI-driven predictions of their future needs. Because the vote telemetry is already stored and the backend is decoupled, the infrastructure is fully prepared to integrate this predictive logic without requiring a rewrite of the core application.
