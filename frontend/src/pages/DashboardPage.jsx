import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import Dashboard from '../components/Dashboard'
import client from '../api/client'

export default function DashboardPage() {
  const { user, setUser, logout } = useAuth()
  const navigate                  = useNavigate()
  const { isDark, toggleTheme }   = useTheme()
  const [votesMap, setVotesMap]   = useState({})

  useEffect(() => {
    client.get('/votes')
      .then(({ data }) => {
        const map = {}
        data.votes.forEach(v => { map[`${v.content_type}_${v.content_key}`] = v.value })
        setVotesMap(map)
      })
      .catch(() => {})
  }, [])

  async function handleResetPrefs() {
    const { data } = await client.patch('/users/me/preferences', { preferences: {} })
    setUser(data)
    setVotesMap({})
    navigate('/onboarding', { replace: true })
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Dashboard
      isDark={isDark}
      onToggleTheme={toggleTheme}
      prefs={user?.preferences}
      userName={user?.name}
      votesMap={votesMap}
      onResetPrefs={handleResetPrefs}
      onLogout={handleLogout}
    />
  )
}
