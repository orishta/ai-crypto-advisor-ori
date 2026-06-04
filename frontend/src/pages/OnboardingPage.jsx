import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import OnboardingQuiz from '../components/OnboardingQuiz'
import client from '../api/client'

export default function OnboardingPage() {
  const { setUser }             = useAuth()
  const navigate                = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  async function handleComplete(prefs) {
    const { data } = await client.patch('/users/me/preferences', { preferences: prefs })
    setUser(data)
    navigate('/dashboard', { replace: true })
  }

  return (
    <OnboardingQuiz
      onComplete={handleComplete}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    />
  )
}
