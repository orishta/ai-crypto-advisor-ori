import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import client from '../api/client'
import { ThemeToggle } from '../components/ui'

export default function LoginPage() {
  const { login }              = useAuth()
  const navigate               = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [form, setForm]        = useState({ email: '', password: '' })
  const [error, setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set(field) {
    return v => setForm(prev => ({ ...prev, [field]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await client.post('/auth/login', form)
      login(data.access_token, data.user)
      const hasPrefs = data.user.preferences && Object.keys(data.user.preferences).length > 0
      navigate(hasPrefs ? '/dashboard' : '/onboarding', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
          <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
            AI Crypto Advisor
          </span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400 mb-2">
              Welcome back
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Sign in
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField label="Email"    type="email"    value={form.email}    onChange={set('email')} />
            <InputField label="Password" type="password" value={form.password} onChange={set('password')} />

            {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-3.5 text-sm font-semibold rounded-xl
                         bg-indigo-600 text-white hover:bg-indigo-700
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors duration-200 shadow-sm"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function InputField({ label, type, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="w-full px-3.5 py-2.5 text-sm rounded-xl border
                   border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-900
                   text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                   dark:focus:border-indigo-400
                   transition-colors duration-150"
      />
    </div>
  )
}
