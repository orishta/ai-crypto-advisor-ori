import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import { Card, ThumbsVote, SkeletonParagraph, ErrorNote } from './ui'

const CACHE_KEY = 'cached_insight'

function insightVoteKey(text) {
  return `insight_${text.replace(/\s+/g, '').slice(0, 24)}`
}

function loadCachedInsight() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { text, date } = JSON.parse(raw)
    return date === new Date().toISOString().slice(0, 10) ? text : null
  } catch {
    return null
  }
}

function saveInsightCache(text) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    text,
    date: new Date().toISOString().slice(0, 10),
  }))
}

function parseApiError(err) {
  const status = err.response?.status
  const detail = err.response?.data?.detail
  if (status === 429) return 'AI rate limit reached — try again in a few minutes'
  if (status === 500) return 'AI service not configured on the server'
  if (status === 504) return 'Request timed out — try again'
  return typeof detail === 'string' ? detail : 'Could not load insight — try again'
}

export default function AIInsightCard({ votesMap = {}, bg, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }) {
  const [insight, setInsight] = useState(loadCachedInsight)
  const [loading, setLoading] = useState(() => loadCachedInsight() === null)
  const [error, setError]     = useState(null)
  const [vote, setVote]       = useState(null)
  const initializedRef        = useRef(false)

  function fetchInsight() {
    setLoading(true)
    setError(null)
    client.get('/api/crypto/insight')
      .then(({ data }) => {
        setInsight(data.insight)
        saveInsightCache(data.insight)
      })
      .catch(err => setError(parseApiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (insight === null) fetchInsight()
  }, [])

  useEffect(() => {
    if (!insight || initializedRef.current) return
    initializedRef.current = true
    setVote(votesMap[insightVoteKey(insight)] ?? null)
  }, [insight, votesMap])

  function handleVote(v) {
    if (!insight) return
    const key  = insightVoteKey(insight)
    const next = vote === v ? null : v
    setVote(next)
    client.post('/votes', { content_type: 'insight', content_key: key, value: next })
      .catch(() => setVote(vote))
  }

  return (
    <Card
      title="AI Insight"
      bg={bg}
      handle={handle}
      onToggleSize={onToggleSize}
      isFullWidth={isFullWidth}
      onToggleCollapse={onToggleCollapse}
      isCollapsed={isCollapsed}
      actions={<ThumbsVote vote={vote} onVote={handleVote} />}
    >
      {loading && <SkeletonParagraph />}
      {error && (
        <div className="flex flex-col gap-2.5">
          <ErrorNote>{error}</ErrorNote>
          <button
            onClick={fetchInsight}
            className="self-start text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}
      {!loading && !error && insight && (
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{insight}</p>
      )}
    </Card>
  )
}
