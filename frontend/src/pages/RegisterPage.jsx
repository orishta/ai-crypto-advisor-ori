import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import client from '../api/client'
import { InputField, AuthPageLayout } from '../components/ui'
import { extractError } from '../utils/errorUtils'

export default function RegisterPage() {
  const { login }               = useAuth()
  const navigate                = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set(field) {
    return v => { setError(''); setForm(prev => ({ ...prev, [field]: v })) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await client.post('/auth/register', form)
      login(data.access_token, data.user)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(extractError(err, 'Registration failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageLayout isDark={isDark} onToggle={toggleTheme}>
      <div className="mb-7">
        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
          Get started
        </p>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create your account</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField label="Full name"     type="text"     value={form.name}     onChange={set('name')}     autoComplete="name" />
        <InputField label="Email address" type="email"    value={form.email}    onChange={set('email')}    autoComplete="email" />
        <InputField label="Password"      type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />

        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 w-full py-3 text-sm font-semibold rounded-lg
                     bg-teal-600 text-white hover:bg-teal-700
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors duration-150 shadow-sm"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthPageLayout>
  )
}
