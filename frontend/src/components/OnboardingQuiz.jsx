import { useState } from 'react'
import { ThemeToggle } from './ui'

const COINS          = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'XRP', 'DOGE', 'AVAX']
const INVESTOR_TYPES = ['HODLer', 'Day Trader']
const CONTENT_TYPES  = ['News', 'Insights', 'Memes', 'All']

const SELECTED   = 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
const UNSELECTED = [
  'border-slate-200 text-slate-600',
  'hover:border-indigo-400/60 hover:text-slate-900',
  'dark:border-slate-700 dark:text-slate-400',
  'dark:hover:border-indigo-500/50 dark:hover:text-slate-200',
].join(' ')

export default function OnboardingQuiz({ onComplete, isDark, onToggleTheme }) {
  const [coins, setCoins]             = useState([])
  const [investorType, setInvestorType] = useState('')
  const [contentType, setContentType]   = useState('')
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)

  function toggleCoin(coin) {
    setCoins(prev => prev.includes(coin) ? prev.filter(c => c !== coin) : [...prev, coin])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (coins.length === 0 || !investorType || !contentType) {
      setError('Please answer all three questions to continue.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onComplete({ coins, investorType, contentType })
    } catch {
      setError('Failed to save preferences. Please try again.')
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
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400 mb-2">
              Setup
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Personalise your dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">
              Three quick questions so we can tailor your feed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <fieldset>
              <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-3">
                1 — Which coins interest you?
              </legend>
              <div className="flex flex-wrap gap-2">
                {COINS.map(coin => (
                  <button
                    key={coin}
                    type="button"
                    onClick={() => toggleCoin(coin)}
                    className={`px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all duration-150
                      ${coins.includes(coin) ? SELECTED : UNSELECTED}`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-3">
                2 — What kind of investor are you?
              </legend>
              <div className="flex gap-3">
                {INVESTOR_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInvestorType(type)}
                    className={`flex-1 py-3 text-sm font-medium rounded-xl border transition-all duration-150
                      ${investorType === type ? SELECTED : UNSELECTED}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-3">
                3 — What content do you prefer?
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setContentType(type)}
                    className={`py-3 text-sm font-medium rounded-xl border transition-all duration-150
                      ${contentType === type ? SELECTED : UNSELECTED}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && <p className="text-xs text-red-500 dark:text-red-400 -mt-4">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-3.5 text-sm font-semibold rounded-xl
                         bg-indigo-600 text-white hover:bg-indigo-700
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors duration-200 shadow-sm"
            >
              {submitting ? 'Saving…' : 'Go to Dashboard'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
