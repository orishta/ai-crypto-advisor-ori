import { useState, useEffect } from 'react'
import client from '../api/client'
import { Card, SkeletonNewsList, ErrorNote } from './ui'

export default function MarketNewsCard() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    client.get('/api/crypto/news')
      .then(({ data }) => setNews(data))
      .catch(() => setError('Could not load news.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card title="Market News">
      {loading && <SkeletonNewsList count={4} />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {!loading && !error && (
        <ul className="flex flex-col -mx-2">
          {news.map((item, i) => (
            <li
              key={i}
              className="group flex flex-col gap-1 px-2 py-3 rounded-lg
                         hover:bg-slate-50 dark:hover:bg-slate-800/60
                         transition-colors duration-100"
            >
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 leading-snug">
                {item.title}
              </p>
              <p className="text-[0.7rem] text-slate-400 dark:text-slate-500">
                {item.source}&ensp;·&ensp;{item.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
