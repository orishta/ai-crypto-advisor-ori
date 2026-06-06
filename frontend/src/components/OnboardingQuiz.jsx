import { useState } from 'react'
import { ThemeToggle } from './ui'

const COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'XRP', 'DOGE', 'AVAX']

const INVESTOR_TYPES = [
  { key: 'HODLer',     label: 'HODLer',     desc: 'Long-term holder' },
  { key: 'Day Trader', label: 'Day Trader',  desc: 'Short-term moves' },
]

const CONTENT_TYPES = [
  { key: 'News',     label: 'News'        },
  { key: 'Insights', label: 'AI Insights' },
  { key: 'Memes',    label: 'Memes'       },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="w-3 h-3 shrink-0" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
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

const SEL   = 'bg-teal-600 border-teal-600 text-white shadow-sm'
const UNSEL = 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-400/60 dark:hover:border-teal-500/50 hover:text-slate-900 dark:hover:text-slate-200'

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center">
            <TrendIcon />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Crypto Advisor</span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8
                          shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
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
                          ${selected ? SEL : UNSEL}`}>
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
                <div className="flex gap-3">
                  {INVESTOR_TYPES.map(({ key, label, desc }) => {
                    const selected = investorType === key
                    return (
                      <button key={key} type="button" onClick={() => setInvestorType(key)} aria-pressed={selected}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-3.5 rounded-lg border transition-all duration-150
                          ${selected ? SEL : UNSEL}`}>
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
                        className={`relative flex items-center justify-center gap-1.5 py-3 rounded-lg border transition-all duration-150
                          ${selected ? SEL : UNSEL}`}>
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
          </div>
        </div>
      </main>
    </div>
  )
}
