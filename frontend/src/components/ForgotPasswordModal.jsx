import { useState } from 'react'
import client from '../api/client'

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

export default function ForgotPasswordModal({ onClose }) {
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
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Password updated. You can now sign in.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <InputField label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            <InputField label="New password" type="password" value={form.new_password} onChange={set('new_password')} autoComplete="new-password" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700
                           text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-teal-600 text-white
                           hover:bg-teal-700 disabled:opacity-60 transition-colors"
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
