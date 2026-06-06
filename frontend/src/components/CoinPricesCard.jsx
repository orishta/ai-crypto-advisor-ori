import { useState, useEffect } from 'react'
import client from '../api/client'
import { Card, SkeletonCoinList, ErrorNote } from './ui'

function useFavouriteCoins() {
  const [favouriteSymbols, setFavouriteSymbols] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('starred_coins') || '[]')) }
    catch { return new Set() }
  })

  function toggleFavourite(symbol) {
    setFavouriteSymbols(prev => {
      const updated = new Set(prev)
      updated.has(symbol) ? updated.delete(symbol) : updated.add(symbol)
      localStorage.setItem('starred_coins', JSON.stringify([...updated]))
      return updated
    })
  }

  return { favouriteSymbols, toggleFavourite }
}

function PriceChangeIndicator({ percentageChange }) {
  if (percentageChange == null) return null
  const isPositive = percentageChange >= 0
  return (
    <p className={`text-xs font-medium tabular-nums ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      {isPositive ? '▲' : '▼'} {Math.abs(percentageChange).toFixed(2)}%
    </p>
  )
}

function CoinRow({ coin, isFavourited, onToggleFavourite }) {
  const coinSymbol = coin.symbol?.toUpperCase()

  return (
    <li
      className={`group flex items-center justify-between px-2 py-2.5 rounded-xl
                  transition-colors duration-100
                  ${isFavourited
                    ? 'bg-amber-50/60 dark:bg-amber-950/20'
                    : 'hover:bg-indigo-50/70 dark:hover:bg-slate-800/60'
                  }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleFavourite(coinSymbol)}
          aria-label={isFavourited ? 'Unstar coin' : 'Star coin'}
          className={`text-base leading-none transition-colors shrink-0
            ${isFavourited
              ? 'text-amber-400'
              : 'text-slate-200 dark:text-slate-700 group-hover:text-slate-300 dark:group-hover:text-slate-500'
            }`}
        >
          {isFavourited ? '★' : '☆'}
        </button>
        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full shrink-0" loading="lazy" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{coin.name}</span>
          <span className="text-[0.65rem] font-medium uppercase text-slate-400 dark:text-slate-500">{coin.symbol}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-200 tabular-nums">
          ${coin.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <PriceChangeIndicator percentageChange={coin.price_change_percentage_24h} />
      </div>
    </li>
  )
}

export default function CoinPricesCard({ bg, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }) {
  const [coins, setCoins]       = useState([])
  const [isLoading, setLoading] = useState(true)
  const [fetchError, setError]  = useState(null)
  const { favouriteSymbols, toggleFavourite } = useFavouriteCoins()

  useEffect(() => {
    client.get('/api/crypto/market')
      .then(({ data }) => setCoins(data))
      .catch(() => setError('Could not load market data.'))
      .finally(() => setLoading(false))
  }, [])

  const coinsWithFavouritesFirst = [
    ...coins.filter(c => favouriteSymbols.has(c.symbol?.toUpperCase())),
    ...coins.filter(c => !favouriteSymbols.has(c.symbol?.toUpperCase())),
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
      {isLoading && <SkeletonCoinList count={8} />}
      {fetchError && <ErrorNote>{fetchError}</ErrorNote>}
      {!isLoading && !fetchError && (
        <ul className="flex flex-col max-h-80 overflow-y-auto -mx-2">
          {coinsWithFavouritesFirst.map(coin => (
            <CoinRow
              key={coin.id}
              coin={coin}
              isFavourited={favouriteSymbols.has(coin.symbol?.toUpperCase())}
              onToggleFavourite={toggleFavourite}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
