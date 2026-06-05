import { useState, useEffect, useRef, useCallback } from 'react'
import client from '../api/client'
import { Card, ThumbsVote, ErrorNote } from './ui'

function memeVoteKey(name) {
  return `meme_${name.toLowerCase().replace(/\W+/g, '_').slice(0, 40)}`
}

export default function CryptoMemeCard({ votesMap = {}, bg, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }) {
  const [meme, setMeme]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [vote, setVote]           = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError]   = useState(false)
  const initializedRef            = useRef(false)

  const fetchMeme = useCallback(async () => {
    setLoading(true)
    setMeme(null)
    setVote(null)
    setImgLoaded(false)
    setImgError(false)
    setError(null)
    initializedRef.current = false
    try {
      const { data } = await client.get('/api/crypto/meme')
      setMeme(data)
    } catch {
      setError('Could not load meme.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMeme() }, [fetchMeme])

  useEffect(() => {
    if (!meme?.name || initializedRef.current) return
    initializedRef.current = true
    setVote(votesMap[memeVoteKey(meme.name)] ?? null)
  }, [meme?.name, votesMap])

  async function handleVote(v) {
    if (!meme?.name) return
    const key      = memeVoteKey(meme.name)
    const next     = vote === v ? null : v
    const prevVote = vote
    setVote(next)
    try {
      await client.post('/votes', {
        content_type: 'meme',
        content_key:  key,
        value:        next,
        category:     meme.category ?? 'general',
      })
      if (next !== null) {
        await new Promise(r => setTimeout(r, 500))
        fetchMeme()
      }
    } catch {
      setVote(prevVote)
    }
  }

  return (
    <Card title="Crypto Meme" bg={bg} handle={handle} onToggleSize={onToggleSize} isFullWidth={isFullWidth} onToggleCollapse={onToggleCollapse} isCollapsed={isCollapsed} actions={<ThumbsVote vote={vote} onVote={handleVote} />}>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
        {(loading || (!imgLoaded && !imgError && meme)) && (
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" />
        )}
        {!loading && !error && meme && !imgError && (
          <img
            src={meme.url}
            alt={meme.name || 'Crypto meme'}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
        {imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">Image unavailable</p>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        )}
      </div>
    </Card>
  )
}
