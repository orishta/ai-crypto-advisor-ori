import { useEffect, useState } from 'react'
import client from '../api/client'
import CoinPricesCard from './CoinPricesCard'
import MarketNewsCard from './MarketNewsCard'
import AIInsightCard from './AIInsightCard'
import CryptoMemeCard from './CryptoMemeCard'
import { ThemeToggle } from './ui'

export default function Dashboard({ isDark, onToggleTheme, prefs, userName, votesMap, onResetPrefs, onLogout }) {
  const backendStatus = useBackendStatus()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
            <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
              AI Crypto Advisor
            </span>
          </div>
          {prefs && <PrefsChip prefs={prefs} onReset={onResetPrefs} />}
        </div>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              {userName}
            </span>
          )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-medium tracking-wide rounded-lg border
                       border-slate-200 dark:border-slate-700
                       text-slate-500 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800
                       transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 px-6 md:px-8 py-8 max-w-6xl mx-auto w-full">
        <CoinPricesCard />
        <MarketNewsCard />
        <AIInsightCard votesMap={votesMap} />
        <CryptoMemeCard votesMap={votesMap} />
      </main>

      <footer className="flex items-center justify-end px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <BackendStatus status={backendStatus} />
      </footer>
    </div>
  )
}

function useBackendStatus() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    client.get('/health')
      .then(({ data }) => setStatus(data?.status === 'ok' ? 'connected' : 'disconnected'))
      .catch(() => setStatus('disconnected'))
  }, [])

  return status
}

function BackendStatus({ status }) {
  const dotClass = {
    checking:     'bg-slate-300 dark:bg-slate-600 animate-pulse',
    connected:    'bg-emerald-500',
    disconnected: 'bg-red-500',
  }[status]

  const label = { checking: 'Checking…', connected: 'Connected', disconnected: 'Disconnected' }[status]

  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span className="text-xs text-slate-400 dark:text-slate-500">Backend: {label}</span>
    </div>
  )
}

function PrefsChip({ prefs, onReset }) {
  return (
    <button
      onClick={onReset}
      title="Reset preferences"
      className="flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-medium rounded-full
                 border border-slate-200 dark:border-slate-800
                 text-slate-400 dark:text-slate-500
                 hover:text-slate-700 dark:hover:text-slate-200
                 hover:bg-slate-50 dark:hover:bg-slate-800
                 transition-all duration-150"
    >
      <span className="text-indigo-600 dark:text-indigo-400">{prefs.investorType}</span>
      <span className="text-slate-200 dark:text-slate-700">·</span>
      <span>{prefs.coins?.slice(0, 3).join(', ')}{prefs.coins?.length > 3 ? '…' : ''}</span>
      <ResetIcon />
    </button>
  )
}

function ResetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-3 h-3 ml-0.5">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}
