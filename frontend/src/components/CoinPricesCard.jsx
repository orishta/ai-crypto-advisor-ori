import { useState, useEffect } from 'react'
import client from '../api/client'
import { Card, SkeletonCoinList, ErrorNote } from './ui'

export default function CoinPricesCard() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    client.get('/api/crypto/market')
      .then(({ data }) => setCoins(data))
      .catch(() => setError('Could not load market data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card title="Coin Prices">
      {loading && <SkeletonCoinList count={8} />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {!loading && !error && (
        <ul className="flex flex-col max-h-80 overflow-y-auto -mx-2">
          {coins.map(coin => (
            <li
              key={coin.id}
              className="group flex items-center justify-between px-2 py-2.5 rounded-lg
                         hover:bg-slate-50 dark:hover:bg-slate-800/60
                         transition-colors duration-100"
            >
              <div className="flex items-center gap-3">
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
          ))}
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
