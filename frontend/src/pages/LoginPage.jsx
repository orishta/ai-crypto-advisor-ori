import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import client from '../api/client'
import { ThemeToggle } from '../components/ui'

function extractError(err, fallback) {
  const detail = err.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map(d => d.msg?.replace(/^Value error,\s*/i, '')).join(' · ')
  }
  return typeof detail === 'string' ? detail : fallback
}

function InputField({ label, type, value, onChange, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full px-3.5 py-2.5 text-sm rounded-lg border
                   border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-800/60
                   text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500
                   dark:focus:border-teal-500
                   transition-colors duration-150"
      />
    </div>
  )
}

function ForgotPasswordModal({ onClose }) {
  const [form, setForm]     = useState({ email: '', new_password: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  function set(field) {
    return v => { setError(''); setForm(prev => ({ ...prev, [field]: v })) }
  }

  async function handleReset(e) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await client.post('/auth/reset-password', form)
      setStatus('success')
    } catch (err) {
      setError(extractError(err, 'Reset failed. Check the email and try again.'))
      setStatus('idle')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Reset password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Enter your account email and a new password.
          </p>
        </div>
        {status === 'success' ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Password updated. You can now sign in.</p>
            <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <InputField label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            <InputField label="New password" type="password" value={form.new_password} onChange={set('new_password')} autoComplete="new-password" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={status === 'loading'}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 transition-colors">
                {status === 'loading' ? 'Resetting…' : 'Reset'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login }               = useAuth()
  const navigate                = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  function set(field) {
    return v => { setError(''); setForm(prev => ({ ...prev, [field]: v })) }
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
      setError(extractError(err, 'Login failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center">
            <TrendIcon />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Crypto Advisor</span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px]">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8
                          shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            <div className="mb-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
                Welcome back
              </p>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in to your account</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField label="Email address" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              <div className="flex flex-col gap-1">
                <InputField label="Password" type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
                <button type="button" onClick={() => setShowForgot(true)}
                  className="self-end text-[0.65rem] font-medium text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mt-0.5">
                  Forgot password?
                </button>
              </div>

              {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

              <button type="submit" disabled={submitting}
                className="mt-1 w-full py-3 text-sm font-semibold rounded-lg
                           bg-teal-600 text-white hover:bg-teal-700
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-colors duration-150 shadow-sm">
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No account?{' '}
              <Link to="/register" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-white" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 10 5 6 9 8 15 3" />
      <polyline points="11 3 15 3 15 7" />
    </svg>
  )
}
