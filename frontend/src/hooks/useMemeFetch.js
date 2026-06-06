import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'

export function useMemeFetch() {
  const [meme, setMeme]         = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [fetchError, setError]  = useState(null)

  const fetchMeme = useCallback(async () => {
    setLoading(true)
    setMeme(null)
    setError(null)
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

  return { meme, isLoading, fetchError, refetch: fetchMeme }
}