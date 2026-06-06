import { useEffect, useRef, useState } from 'react'
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
import client from '../api/client'
import CoinPricesCard from './CoinPricesCard'
import MarketNewsCard from './MarketNewsCard'
import AIInsightCard from './AIInsightCard'
import CryptoMemeCard from './CryptoMemeCard'
import { ThemeToggle, GripHandle } from './ui'

// ─── Theme definitions ────────────────────────────────────────────────────────

const THEMES = {
  pastel: {
    pageBg:        'bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-violet-50/70 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900',
    headerBg:      'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-100/60 dark:border-slate-800',
    titleGradient: 'from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400',
    dotGradient:   'from-indigo-500 to-violet-600',
    dotShadow:     'shadow-indigo-400/40',
    cards: {
      prices:  'bg-gradient-to-br from-indigo-50 to-blue-100/90 border border-indigo-100/80 shadow-[0_8px_32px_rgba(99,102,241,0.18)] dark:from-indigo-950/60 dark:to-blue-950/40 dark:border-indigo-900/50 dark:shadow-[0_8px_32px_rgba(99,102,241,0.25)]',
      news:    'bg-gradient-to-br from-sky-50 to-cyan-100/90 border border-sky-100/80 shadow-[0_8px_32px_rgba(14,165,233,0.18)] dark:from-sky-950/60 dark:to-cyan-950/40 dark:border-sky-900/50 dark:shadow-[0_8px_32px_rgba(14,165,233,0.25)]',
      insight: 'bg-gradient-to-br from-violet-50 to-purple-100/90 border border-violet-100/80 shadow-[0_8px_32px_rgba(139,92,246,0.18)] dark:from-violet-950/60 dark:to-purple-950/40 dark:border-violet-900/50 dark:shadow-[0_8px_32px_rgba(139,92,246,0.25)]',
      meme:    'bg-gradient-to-br from-emerald-50 to-teal-100/90 border border-emerald-100/80 shadow-[0_8px_32px_rgba(16,185,129,0.18)] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-900/50 dark:shadow-[0_8px_32px_rgba(16,185,129,0.25)]',
    },
  },
  neon: {
    pageBg:        'bg-gray-950',
    headerBg:      'bg-gray-950/95 backdrop-blur-md border-b border-slate-800/40',
    titleGradient: 'from-violet-400 to-cyan-400',
    dotGradient:   'from-violet-500 to-cyan-500',
    dotShadow:     'shadow-violet-400/50',
    cards: {
      prices:  'bg-gray-900 border border-violet-500/20 shadow-[0_0_24px_rgba(139,92,246,0.12)]',
      news:    'bg-gray-900 border border-cyan-400/20 shadow-[0_0_24px_rgba(34,211,238,0.12)]',
      insight: 'bg-gray-900 border border-fuchsia-500/20 shadow-[0_0_24px_rgba(217,70,239,0.12)]',
      meme:    'bg-gray-900 border border-emerald-400/20 shadow-[0_0_24px_rgba(52,211,153,0.12)]',
    },
  },
  mono: {
    pageBg:        'bg-gray-50 dark:bg-gray-950',
    headerBg:      'bg-white dark:bg-gray-900 border-b-2 border-gray-900 dark:border-gray-100',
    titleGradient: 'from-gray-900 to-gray-700 dark:from-white dark:to-gray-300',
    dotGradient:   'from-gray-800 to-gray-600',
    dotShadow:     'shadow-gray-400/30',
    cards: {
      prices:  'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
      news:    'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
      insight: 'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
      meme:    'bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_rgba(255,255,255,0.8)]',
    },
  },
}

// ─── Which cards each content preference shows ───────────────────────────────

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
  return localStorage.getItem('color_theme') || 'pastel'
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ isDark, onToggleTheme, prefs, userName, votesMap, onResetPrefs, onLogout }) {
  const [layout, setLayout]      = useState(loadLayout)
  const [colorTheme, setColorTheme] = useState(loadColorTheme)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef              = useRef(null)

  const theme = THEMES[colorTheme] || THEMES.pastel

  // contentType may be a legacy string ("All","News"…) or the new string[]
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme.pageBg}`}>
      <header className={`flex items-center justify-between px-8 py-4 sticky top-0 z-10 ${theme.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-br shrink-0 shadow-sm ${theme.dotGradient} ${theme.dotShadow}`} />
            <span className={`text-sm font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${theme.titleGradient}`}>
              AI Crypto Advisor
            </span>
          </div>
          {prefs && <PrefsChip prefs={prefs} onReset={onResetPrefs} />}
        </div>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:block mr-1">
              {userName}
            </span>
          )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          {/* Settings gear */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen(o => !o)}
              aria-label="Open settings"
              className={`p-1.5 rounded-xl text-slate-400 dark:text-slate-500
                          hover:bg-slate-100 dark:hover:bg-slate-800
                          transition-colors duration-150
                          ${settingsOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : ''}`}
            >
              <GearIcon />
            </button>
            {settingsOpen && (
              <SettingsPanel
                colorTheme={colorTheme}
                onChangeTheme={changeColorTheme}
                onClose={() => setSettingsOpen(false)}
              />
            )}
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-semibold tracking-wide rounded-xl
                       text-slate-500 dark:text-slate-400
                       hover:bg-red-50 dark:hover:bg-red-950/20
                       hover:text-red-600 dark:hover:text-red-400
                       transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-6xl mx-auto w-full">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleOrder} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

// ─── Settings panel ───────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  {
    key:     'pastel',
    label:   'Pastel',
    dots:    ['bg-indigo-400', 'bg-violet-400', 'bg-sky-400'],
  },
  {
    key:     'neon',
    label:   'Neon',
    dots:    ['bg-purple-500', 'bg-cyan-400', 'bg-pink-500'],
    note:    'Dark mode',
  },
  {
    key:     'mono',
    label:   'Mono',
    dots:    ['bg-gray-800', 'bg-gray-500', 'bg-gray-300'],
  },
]

function SettingsPanel({ colorTheme, onChangeTheme, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl
                      bg-white dark:bg-slate-900
                      shadow-[0_20px_60px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.55)]
                      border border-slate-100 dark:border-slate-800
                      z-30 p-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-3">
          Color Theme
        </p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ key, label, dots, note }) => (
            <button
              key={key}
              onClick={() => { onChangeTheme(key); onClose() }}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all
                ${colorTheme === key
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
            >
              <div className="flex gap-1">
                {dots.map((cls, i) => <span key={i} className={`w-3.5 h-3.5 rounded-full ${cls}`} />)}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
              {note && <span className="text-[0.6rem] text-slate-400 dark:text-slate-500 -mt-1">{note}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}


function PrefsChip({ prefs, onReset }) {
  return (
    <button
      onClick={onReset}
      title="Reset preferences"
      className="flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-semibold rounded-full
                 bg-gradient-to-r from-indigo-100 to-violet-100/80
                 dark:from-indigo-950/60 dark:to-violet-950/40
                 text-indigo-700 dark:text-indigo-400
                 hover:from-indigo-200 hover:to-violet-200/80
                 dark:hover:from-indigo-900/60 dark:hover:to-violet-900/40
                 transition-all duration-150"
    >
      <span>{prefs.investorType}</span>
      <span className="text-indigo-300 dark:text-indigo-700">·</span>
      <span>{prefs.coins?.slice(0, 3).join(', ')}{prefs.coins?.length > 3 ? '…' : ''}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="w-3 h-3 ml-0.5">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
  )
}
