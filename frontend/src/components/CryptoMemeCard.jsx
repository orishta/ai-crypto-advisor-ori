import { useState, useEffect } from 'react'
import { useMemeFetch } from '../hooks/useMemeFetch'
import { useVoting } from '../hooks/useVoting'
import { Card, ThumbsVote, ErrorNote } from './ui'

function buildMemeVoteKey(memeName) {
  return `meme_${memeName.toLowerCase().replace(/\W+/g, '_').slice(0, 40)}`
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 8A6.5 6.5 0 1 0 3 4.5" />
      <path d="M1.5 1.5v3h3" />
    </svg>
  )
}

function RefreshMemeButton({ onRefresh }) {
  return (
    <button
      onClick={onRefresh}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                 bg-gradient-to-r from-violet-500 to-indigo-500
                 hover:from-violet-600 hover:to-indigo-600
                 text-white shadow-sm shadow-violet-400/30
                 transition-all duration-200"
    >
      <RefreshIcon />
      New Meme
    </button>
  )
}

function MemeImageContainer({ meme, isLoading, fetchError }) {
  const [imageHasLoaded, setImageHasLoaded]       = useState(false)
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false)

  useEffect(() => {
    setImageHasLoaded(false)
    setImageFailedToLoad(false)
  }, [meme?.url])

  const showLoadingPulse = isLoading || (!imageHasLoaded && !imageFailedToLoad && meme)

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
      {showLoadingPulse && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" />
      )}
      {!isLoading && !fetchError && meme && !imageFailedToLoad && (
        <img
          src={meme.url}
          alt={meme.name || 'Crypto meme'}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${imageHasLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageHasLoaded(true)}
          onError={() => setImageFailedToLoad(true)}
        />
      )}
      {imageFailedToLoad && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">Image unavailable</p>
        </div>
      )}
      {fetchError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <ErrorNote>{fetchError}</ErrorNote>
        </div>
      )}
    </div>
  )
}

export default function CryptoMemeCard({ votesMap = {}, bg, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }) {
  const { meme, isLoading, fetchError, refetch } = useMemeFetch()

  const memeVoteKey = meme?.name ? buildMemeVoteKey(meme.name) : null
  const { vote, castVote } = useVoting({
    contentType: 'meme',
    contentKey:  memeVoteKey ?? '',
    category:    meme?.category ?? 'general',
    initialVote: memeVoteKey ? (votesMap[memeVoteKey] ?? null) : null,
  })

  async function handleVote(selectedValue) {
    if (!meme?.name) return
    const nextVote = await castVote(selectedValue)
    if (nextVote !== null) {
      await new Promise(resolve => setTimeout(resolve, 500))
      refetch()
    }
  }

  return (
    <Card
      title="Crypto Meme"
      bg={bg}
      handle={handle}
      onToggleSize={onToggleSize}
      isFullWidth={isFullWidth}
      onToggleCollapse={onToggleCollapse}
      isCollapsed={isCollapsed}
      actions={
        <>
          <RefreshMemeButton onRefresh={refetch} />
          <ThumbsVote vote={vote} onVote={handleVote} />
        </>
      }
    >
      <MemeImageContainer meme={meme} isLoading={isLoading} fetchError={fetchError} />
      {meme && (
        <p className="pt-1 text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">
          {meme.name}
        </p>
      )}
    </Card>
  )
}
