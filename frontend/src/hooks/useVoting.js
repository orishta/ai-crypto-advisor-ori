import { useState } from 'react'
import client from '../api/client'

export function useVoting({ contentType, contentKey, category, initialVote = null }) {
  const [vote, setVote] = useState(initialVote)

  async function castVote(selectedValue) {
    const nextVote = vote === selectedValue ? null : selectedValue
    const previousVote = vote
    setVote(nextVote)
    try {
      await client.post('/votes', {
        content_type: contentType,
        content_key:  contentKey,
        value:        nextVote,
        category:     category ?? 'general',
      })
    } catch {
      setVote(previousVote)
    }
    return nextVote
  }

  return { vote, castVote }
}