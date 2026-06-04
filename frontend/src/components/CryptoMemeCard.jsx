import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import { Card, ThumbsVote, ErrorNote } from './ui'

function memeVoteKey(name) {
  return `meme_${name.toLowerCase().replace(/\W+/g, '_').slice(0, 40)}`
}

export default function CryptoMemeCard({ votesMap = {} }) {
  const [meme, setMeme]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [vote, setVote]       = useState(null)
  const [imgError, setImgError] = useState(false)
  const initializedRef          = useRef(false)

  useEffect(() => {
    client.get('/api/crypto/meme')
      .then(({ data }) => setMeme(data))
      .catch(() => setError('Could not load meme.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!meme?.name || initializedRef.current) return
    initializedRef.current = true
    setVote(votesMap[memeVoteKey(meme.name)] ?? null)
  }, [meme?.name, votesMap])

  function handleVote(v) {
    if (!meme?.name) return
    const key  = memeVoteKey(meme.name)
    const next = vote === v ? null : v
    setVote(next)
    client.post('/votes', { content_type: 'meme', content_key: key, value: next })
      .catch(() => setVote(vote))
  }

  return (
    <Card title="Crypto Meme" actions={<ThumbsVote vote={vote} onVote={handleVote} />}>
      {loading && (
        <div className="flex flex-col gap-3">
          <div className="h-52 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse w-3/4 mx-auto" />
        </div>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
      {!loading && !error && meme && (
        <div className="flex flex-col gap-3">
          {!imgError ? (
            <img
              src={meme.url}
              alt={meme.name || 'Crypto meme'}
              className="w-full rounded-xl object-contain max-h-60 bg-slate-50 dark:bg-slate-800"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-52 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">Image unavailable</p>
            </div>
          )}
          {meme.caption && (
            <p className="text-sm text-center italic text-slate-600 dark:text-slate-400 leading-snug px-2">
              {meme.caption}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
