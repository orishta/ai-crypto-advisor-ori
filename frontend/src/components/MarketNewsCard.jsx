import { useState, useEffect } from 'react'
import client from '../api/client'
import { useVoting } from '../hooks/useVoting'
import { Card, ThumbsVote, SkeletonNewsList, ErrorNote } from './ui'

function buildNewsVoteKey(newsTitle) {
  return `news_${newsTitle.toLowerCase().replace(/\W+/g, '_').slice(0, 50)}`
}

function NewsArticleRow({ article }) {
  const voteKey = buildNewsVoteKey(article.title)
  const { vote, castVote } = useVoting({
    contentType: 'news',
    contentKey:  voteKey,
    category:    'market_news',
  })

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug flex-1">
          {article.title}
        </p>
        <ThumbsVote vote={vote} onVote={castVote} />
      </div>
      <p className="text-[0.65rem] text-slate-400 dark:text-slate-500">
        {article.source} · {article.date}
      </p>
    </li>
  )
}

export default function MarketNewsCard({ coins, bg, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }) {
  const [articles, setArticles] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [fetchError, setError]  = useState(null)

  const tickerQueryString = coins?.join(',') ?? ''

  useEffect(() => {
    setLoading(true)
    client.get('/api/crypto/news', { params: { tickers: tickerQueryString } })
      .then(({ data }) => setArticles(data))
      .catch(() => setError('Could not load news.'))
      .finally(() => setLoading(false))
  }, [tickerQueryString])

  return (
    <Card
      title="Market News"
      bg={bg}
      handle={handle}
      onToggleSize={onToggleSize}
      isFullWidth={isFullWidth}
      onToggleCollapse={onToggleCollapse}
      isCollapsed={isCollapsed}
    >
      {isLoading && <SkeletonNewsList count={4} />}
      {fetchError && <ErrorNote>{fetchError}</ErrorNote>}
      {!isLoading && !fetchError && (
        <ul className="flex flex-col gap-4">
          {articles.map((article, index) => (
            <NewsArticleRow key={index} article={article} />
          ))}
        </ul>
      )}
    </Card>
  )
}