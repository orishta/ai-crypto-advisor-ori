import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CoinPricesCard from './CoinPricesCard'
import MarketNewsCard from './MarketNewsCard'
import AIInsightCard from './AIInsightCard'
import CryptoMemeCard from './CryptoMemeCard'
import { ThemeToggle, GripHandle } from './ui'

// ─── Theme definitions ────────────────────────────────────────────────────────

const CLEAN_CARD = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'

const THEMES = {
  clean: {
    pageBg:    'bg-slate-50 dark:bg-slate-950',
    sidebarBg: 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
    topBarBg:  'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800',
    cards:     { prices: CLEAN_CARD, news: CLEAN_CARD, insight: CLEAN_CARD, meme: CLEAN_CARD },
  },
  neon: {
    pageBg:    'bg-gray-950',
    sidebarBg: 'bg-gray-900 border-r border-slate-800/40',
    topBarBg:  'bg-gray-900/95 backdrop-blur-md border-b border-slate-800/40',
    cards: {
      prices:  'bg-gray-900 border border-violet-500/20 shadow-[0_0_24px_rgba(139,92,246,0.12)]',
      news:    'bg-gray-900 border border-cyan-400/20 shadow-[0_0_24px_rgba(34,211,238,0.12)]',
      insight: 'bg-gray-900 border border-fuchsia-500/20 shadow-[0_0_24px_rgba(217,70,239,0.12)]',
      meme:    'bg-gray-900 border border-emerald-400/20 shadow-[0_0_24px_rgba(52,211,153,0.12)]',
    },
  },
  mono: {
    pageBg:    'bg-gray-50 dark:bg-gray-950',
    sidebarBg: 'bg-white dark:bg-gray-900 border-r-2 border-gray-900 dark:border-gray-100',
    topBarBg:  'bg-white dark:bg-gray-900 border-b-2 border-gray-900 dark:border-gray-100',
    cards: {
      prices:  'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
      news:    'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
      insight: 'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
      meme:    'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
    },
  },
}

const THEME_OPTIONS = [
  { key: 'clean', label: 'Clean', swatch: ['bg-teal-500', 'bg-slate-300', 'bg-slate-100'] },
  { key: 'neon',  label: 'Neon',  swatch: ['bg-purple-500', 'bg-cyan-400', 'bg-pink-500'] },
  { key: 'mono',  label: 'Mono',  swatch: ['bg-gray-900', 'bg-gray-500', 'bg-gray-200'] },
]

// ─── Cards by content preference ─────────────────────────────────────────────

const CARDS_BY_CONTENT = {
  News:     ['prices', 'news'],
  Insights: ['prices', 'insight'],
  Memes:    ['prices', 'meme'],
  All:      ['prices', 'news', 'insight', 'meme'],
}

// ─── Layout persistence ───────────────────────────────────────────────────────

const DEFAULT_LAYOUT = {
  order:     ['prices', 'news', 'insight', 'meme'],
  sizes:     { prices: false, news: false, insight: false, meme: false },
  collapsed: { prices: false, news: false, insight: false, meme: false },
}

function loadLayout() {
  try {
    const raw = localStorage.getItem('dashboard_layout')
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_LAYOUT, ...parsed, collapsed: { ...DEFAULT_LAYOUT.collapsed, ...(parsed.collapsed || {}) } }
    }
  } catch {}
  return DEFAULT_LAYOUT
}

function saveLayout(layout) {
  localStorage.setItem('dashboard_layout', JSON.stringify(layout))
}

function loadColorTheme() {
  const saved = localStorage.getItem('color_theme')
  if (!saved || saved === 'pastel') return 'clean'
  return saved
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ isDark, onToggleTheme, prefs, userName, votesMap, onResetPrefs, onLogout }) {
  const [layout, setLayout]         = useState(loadLayout)
  const [colorTheme, setColorTheme] = useState(loadColorTheme)

  const theme = THEMES[colorTheme] || THEMES.clean

  const allowedCards = (() => {
    const raw   = prefs?.contentType
    const types = Array.isArray(raw) ? raw : (raw ? [raw] : ['News', 'Insights', 'Memes'])
    const cards = new Set(['prices'])
    types.forEach(t => (CARDS_BY_CONTENT[t] || []).forEach(id => cards.add(id)))
    return cards
  })()

  const visibleOrder = layout.order.filter(id => allowedCards.has(id))
  const sensors      = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function changeColorTheme(name) {
    setColorTheme(name)
    localStorage.setItem('color_theme', name)
    if (name === 'neon' && !isDark) onToggleTheme()
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    setLayout(prev => {
      const updated = { ...prev, order: arrayMove(prev.order, prev.order.indexOf(active.id), prev.order.indexOf(over.id)) }
      saveLayout(updated)
      return updated
    })
  }

  function toggleSize(id) {
    setLayout(prev => {
      const updated = { ...prev, sizes: { ...prev.sizes, [id]: !prev.sizes[id] } }
      saveLayout(updated)
      return updated
    })
  }

  function toggleCollapse(id) {
    setLayout(prev => {
      const updated = { ...prev, collapsed: { ...prev.collapsed, [id]: !prev.collapsed[id] } }
      saveLayout(updated)
      return updated
    })
  }

  function renderCard(id, handle) {
    const isFullWidth      = layout.sizes[id]
    const isCollapsed      = layout.collapsed?.[id] ?? false
    const onToggleSize     = () => toggleSize(id)
    const onToggleCollapse = () => toggleCollapse(id)
    const bg               = theme.cards[id]
    const shared           = { bg, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }

    if (id === 'prices')  return <CoinPricesCard {...shared} />
    if (id === 'news')    return <MarketNewsCard  {...shared} coins={prefs?.coins} />
    if (id === 'insight') return <AIInsightCard   {...shared} votesMap={votesMap} />
    if (id === 'meme')    return <CryptoMemeCard  {...shared} votesMap={votesMap} />
    return null
  }

  const userInitial = userName ? userName[0].toUpperCase() : '?'
  const coinsSummary = prefs?.coins?.length
    ? prefs.coins.slice(0, 3).join(', ') + (prefs.coins.length > 3 ? ` +${prefs.coins.length - 3}` : '')
    : null

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme.pageBg}`}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex w-56 shrink-0 flex-col ${theme.sidebarBg}`}>

        {/* Brand */}
        <div className="h-16 px-5 flex items-center shrink-0 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 shadow-sm">
              <BrandIcon />
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Crypto</p>
              <p className="text-[0.6rem] text-slate-400 mt-0.5">Advisor</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <SideNavItem icon={<GridIcon />} label="Dashboard" active />
          {prefs && (
            <SideNavItem icon={<SlidersIcon />} label="Edit Preferences" onClick={onResetPrefs} />
          )}
        </nav>

        {/* Theme picker */}
        <div className="px-3 pb-3 shrink-0">
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">Theme</p>
          <div className="flex flex-col gap-0.5">
            {THEME_OPTIONS.map(({ key, label, swatch }) => (
              <button
                key={key}
                onClick={() => changeColorTheme(key)}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150
                  ${colorTheme === key
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <div className="flex gap-0.5 shrink-0">
                  {swatch.map((cls, i) => <span key={i} className={`w-2 h-2 rounded-full border border-slate-200 dark:border-slate-700 ${cls}`} />)}
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">{userInitial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-[0.6rem] text-slate-400 truncate">{prefs?.investorType ?? 'Investor'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium
                       text-slate-500 dark:text-slate-400
                       hover:bg-red-50 dark:hover:bg-red-950/20
                       hover:text-red-600 dark:hover:text-red-400
                       transition-colors duration-150"
          >
            <SignOutIcon />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className={`h-16 px-6 md:px-8 flex items-center justify-between shrink-0 ${theme.topBarBg}`}>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
            {coinsSummary && (
              <p className="text-[0.65rem] text-slate-400 mt-0.5 hidden sm:block">
                Tracking {coinsSummary}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </header>

        {/* Cards */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleOrder} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl">
                {visibleOrder.map(id => (
                  <SortableCard key={id} id={id} isFullWidth={layout.sizes[id]}>
                    {handle => renderCard(id, handle)}
                  </SortableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </main>
      </div>
    </div>
  )
}

// ─── Sortable card wrapper ────────────────────────────────────────────────────

function SortableCard({ id, isFullWidth, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        gridColumn: isFullWidth ? 'span 2 / span 2' : undefined,
      }}
      className={isDragging ? 'opacity-40' : ''}
    >
      {children(<GripHandle {...attributes} {...listeners} />)}
    </div>
  )
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function SideNavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
        ${active
          ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      {label}
    </button>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BrandIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-white" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 10 5 6 9 8 15 3" />
      <polyline points="11 3 15 3 15 7" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="4"  x2="14" y2="4"  />
      <line x1="2" y1="8"  x2="14" y2="8"  />
      <line x1="2" y1="12" x2="14" y2="12" />
      <circle cx="5"  cy="4"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="11" cy="8"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="7"  cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6" />
    </svg>
  )
}
