import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import { Card, ThumbsVote, SkeletonParagraph, ErrorNote } from './ui'

function insightVoteKey(text) {
  return `insight_${text.replace(/\s+/g, '').slice(0, 24)}`
}

export default function AIInsightCard({ votesMap = {} }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [vote, setVote]       = useState(null)
  const initializedRef        = useRef(false)

  useEffect(() => {
    client.get('/api/crypto/insight')
      .then(({ data }) => setInsight(data.insight))
      .catch(() => setError('Could not load AI insight. Check your API key.'))
      .finally(() => setLoading(false))
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
    <Card title="AI Insight" actions={<ThumbsVote vote={vote} onVote={handleVote} />}>
      {loading && <SkeletonParagraph />}
      {error   && <ErrorNote>{error}</ErrorNote>}
      {!loading && !error && insight && (
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{insight}</p>
      )}
    </Card>
  )
}
