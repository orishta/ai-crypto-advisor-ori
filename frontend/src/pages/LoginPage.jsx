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
      <label className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full px-3.5 py-2.5 text-sm rounded-xl border
                   border-slate-200 dark:border-slate-700
                   bg-slate-50 dark:bg-slate-800/60
                   text-slate-900 dark:text-slate-100
                   placeholder:text-slate-300 dark:placeholder:text-slate-600
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                   dark:focus:border-indigo-500
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
    return v => {
      setError('')
      setForm(prev => ({ ...prev, [field]: v }))
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Reset password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Enter your account email and choose a new password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
              Password updated successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <InputField label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            <InputField label="New password" type="password" value={form.new_password} onChange={set('new_password')} autoComplete="new-password" />
            {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                           border border-slate-200 dark:border-slate-700
                           text-slate-600 dark:text-slate-300
                           hover:bg-slate-50 dark:hover:bg-slate-800
                           transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                           bg-indigo-600 text-white hover:bg-indigo-700
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-colors duration-150"
              >
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
    return v => {
      setError('')
      setForm(prev => ({ ...prev, [field]: v }))
    }
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8
                          shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
            <div className="mb-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400 mb-2">
                Welcome back
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Sign in
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />

              <div className="flex flex-col gap-1">
                <InputField label="Password" type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="self-end text-[0.65rem] font-medium text-slate-400 dark:text-slate-500
                             hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 mt-0.5"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full py-3.5 text-sm font-semibold rounded-xl
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
        </div>
      </main>
    </div>
  )
}
