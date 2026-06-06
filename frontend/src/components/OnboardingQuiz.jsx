import { useState } from 'react'
import { AuthPageLayout } from './ui'
import { COINS, INVESTOR_TYPES, CONTENT_TYPES, TOGGLE_SEL, TOGGLE_UNSEL } from '../constants/onboarding'

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="w-3 h-3 shrink-0" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  )
}

export default function OnboardingQuiz({ onComplete, isDark, onToggleTheme }) {
  const [coins, setCoins]               = useState([])
  const [investorType, setInvestorType] = useState('')
  const [contentTypes, setContentTypes] = useState([])
  const [error, setError]               = useState('')
  const [submitting, setSubmitting]     = useState(false)

  function toggleCoin(coin) {
    setCoins(prev => prev.includes(coin) ? prev.filter(c => c !== coin) : [...prev, coin])
  }

  function toggleContentType(type) {
    setContentTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (coins.length === 0 || !investorType || contentTypes.length === 0) {
      setError('Please answer all three questions to continue.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onComplete({ coins, investorType, contentType: contentTypes })
    } catch {
      setError('Failed to save preferences. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <AuthPageLayout isDark={isDark} onToggle={onToggleTheme} maxWidth="400px">
      <div className="mb-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
          Setup
        </p>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Personalise your dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Three quick questions to tailor your feed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">

        {/* Q1 — Coins */}
        <fieldset>
          <legend className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            Which coins interest you?
          </legend>
          <div className="flex flex-wrap gap-2">
            {COINS.map(coin => {
              const selected = coins.includes(coin)
              return (
                <button key={coin} type="button" onClick={() => toggleCoin(coin)} aria-pressed={selected}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150
                    ${selected ? TOGGLE_SEL : TOGGLE_UNSEL}`}>
                  {selected && <CheckIcon />}
                  {coin}
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Q2 — Investor type */}
        <fieldset>
          <legend className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            What kind of investor are you?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {INVESTOR_TYPES.map(({ key, label, desc }) => {
              const selected = investorType === key
              return (
                <button key={key} type="button" onClick={() => setInvestorType(key)} aria-pressed={selected}
                  className={`flex flex-col items-center gap-0.5 py-3.5 rounded-lg border transition-all duration-150
                    ${selected ? TOGGLE_SEL : TOGGLE_UNSEL}`}>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className={`text-[0.6rem] font-normal ${selected ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'}`}>{desc}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Q3 — Content types */}
        <fieldset>
          <div className="flex items-baseline justify-between mb-3">
            <legend className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              What content do you want?
            </legend>
            <span className="text-[0.65rem] text-slate-400">Select all that apply</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CONTENT_TYPES.map(({ key, label }) => {
              const selected = contentTypes.includes(key)
              return (
                <button key={key} type="button" onClick={() => toggleContentType(key)} aria-pressed={selected}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-lg border transition-all duration-150
                    ${selected ? TOGGLE_SEL : TOGGLE_UNSEL}`}>
                  {selected && <span className="text-teal-100"><CheckIcon /></span>}
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {error && <p className="text-xs text-red-500 dark:text-red-400 -mt-3">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full py-3 text-sm font-semibold rounded-lg
                     bg-teal-600 text-white hover:bg-teal-700
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors duration-150 shadow-sm">
          {submitting ? 'Saving…' : 'Go to Dashboard →'}
        </button>
      </form>
    </AuthPageLayout>
  )
}
