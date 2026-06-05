import { useState, useEffect } from 'react'
import client from '../api/client'
import { Card, SkeletonCoinList, ErrorNote } from './ui'

function useStarredCoins() {
  const [starred, setStarred] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('starred_coins') || '[]')) }
    catch { return new Set() }
  })

  function toggle(symbol) {
    setStarred(prev => {
      const next = new Set(prev)
      next.has(symbol) ? next.delete(symbol) : next.add(symbol)
      localStorage.setItem('starred_coins', JSON.stringify([...next]))
      return next
    })
  }

  return { starred, toggle }
}

export default function CoinPricesCard({ bg, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }) {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { starred, toggle } = useStarredCoins()

  useEffect(() => {
    client.get('/api/crypto/market')
      .then(({ data }) => setCoins(data))
      .catch(() => setError('Could not load market data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const sortedCoins = [
    ...coins.filter(c => starred.has(c.symbol?.toUpperCase())),
    ...coins.filter(c => !starred.has(c.symbol?.toUpperCase())),
  ]

  return (
    <Card
      title="Coin Prices"
      bg={bg}
      handle={handle}
      onToggleSize={onToggleSize}
      isFullWidth={isFullWidth}
      onToggleCollapse={onToggleCollapse}
      isCollapsed={isCollapsed}
    >
      {loading && <SkeletonCoinList count={8} />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {!loading && !error && (
        <ul className="flex flex-col max-h-80 overflow-y-auto -mx-2">
          {sortedCoins.map(coin => {
            const sym        = coin.symbol?.toUpperCase()
            const isStarred  = starred.has(sym)
            return (
              <li
                key={coin.id}
                className={`group flex items-center justify-between px-2 py-2.5 rounded-xl
                           transition-colors duration-100
                           ${isStarred
                             ? 'bg-amber-50/60 dark:bg-amber-950/20'
                             : 'hover:bg-indigo-50/70 dark:hover:bg-slate-800/60'
                           }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(sym)}
                    aria-label={isStarred ? 'Unstar coin' : 'Star coin'}
                    className={`text-base leading-none transition-colors shrink-0
                      ${isStarred
                        ? 'text-amber-400'
                        : 'text-slate-200 dark:text-slate-700 group-hover:text-slate-300 dark:group-hover:text-slate-500'
                      }`}
                  >
                    {isStarred ? '★' : '☆'}
                  </button>
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full shrink-0"
                    loading="lazy"
                  />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      {coin.name}
                    </span>
                    <span className="text-[0.65rem] font-medium uppercase text-slate-400 dark:text-slate-500">
                      {coin.symbol}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200 tabular-nums">
                    ${coin.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <PriceChange value={coin.price_change_percentage_24h} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function PriceChange({ value }) {
  if (value == null) return null
  const up = value >= 0
  return (
    <p className={`text-xs font-medium tabular-nums ${up ? 'text-emerald-500' : 'text-red-500'}`}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </p>
  )
}
