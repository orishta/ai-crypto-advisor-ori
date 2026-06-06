const DEFAULT_CARD_BG = 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]'

const CARD_CONTROL_BTN = `p-1 rounded-md
  text-slate-400 dark:text-slate-500
  hover:text-indigo-600 dark:hover:text-indigo-400
  hover:bg-indigo-50 dark:hover:bg-indigo-950/30
  transition-colors duration-150`

export function Card({ title, actions, children, bg = DEFAULT_CARD_BG, handle, onToggleSize, isFullWidth, onToggleCollapse, isCollapsed }) {
  return (
    <div className={`flex flex-col rounded-2xl ${bg} p-6 ${isCollapsed ? 'gap-0' : 'gap-5'}`}>
      <div className="flex items-center gap-2 min-h-[1.25rem]">
        {handle}
        <h2 className="flex-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {title}
        </h2>
        <div className="flex items-center gap-0.5">
          {!isCollapsed && onToggleSize && (
            <button onClick={onToggleSize} aria-label={isFullWidth ? 'Shrink card' : 'Expand card'} className={CARD_CONTROL_BTN}>
              {isFullWidth ? <ShrinkIcon /> : <ExpandIcon />}
            </button>
          )}
          {!isCollapsed && actions}
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} aria-label={isCollapsed ? 'Expand card' : 'Collapse card'} className={CARD_CONTROL_BTN}>
              <ChevronIcon isCollapsed={isCollapsed} />
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && <div>{children}</div>}
    </div>
  )
}

function ChevronIcon({ isCollapsed }) {
  return (
    <svg viewBox="0 0 16 16" className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  )
}

export function GripHandle(props) {
  return (
    <div
      {...props}
      className="p-1 rounded-md cursor-grab active:cursor-grabbing shrink-0
                 text-slate-300 dark:text-slate-600
                 hover:text-indigo-500 dark:hover:text-indigo-400
                 hover:bg-indigo-50 dark:hover:bg-indigo-950/30
                 transition-colors duration-150"
    >
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <circle cx="5"  cy="3.5"  r="1.2" />
        <circle cx="11" cy="3.5"  r="1.2" />
        <circle cx="5"  cy="8"    r="1.2" />
        <circle cx="11" cy="8"    r="1.2" />
        <circle cx="5"  cy="12.5" r="1.2" />
        <circle cx="11" cy="12.5" r="1.2" />
      </svg>
    </div>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" />
    </svg>
  )
}

function ShrinkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6h4V2M14 6h-4V2M2 10h4v4M14 10h-4v4" />
    </svg>
  )
}

export function ThumbsVote({ vote, onVote }) {
  return (
    <div className="flex items-center gap-0.5">
      <VoteButton
        label="Helpful"
        active={vote === 'up'}
        activeClass="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
        onClick={() => onVote('up')}
        icon={<ThumbUpIcon />}
      />
      <VoteButton
        label="Not helpful"
        active={vote === 'down'}
        activeClass="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 shadow-sm"
        onClick={() => onVote('down')}
        icon={<ThumbDownIcon />}
      />
    </div>
  )
}

function VoteButton({ label, active, activeClass, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`p-1.5 rounded-lg border transition-all duration-150
        ${active
          ? activeClass
          : 'border-transparent text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
        }`}
    >
      {icon}
    </button>
  )
}

function ThumbUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function ThumbDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  )
}

export function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle colour theme"
      className="px-3 py-1.5 text-xs font-semibold rounded-lg
                 border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-slate-800
                 text-slate-600 dark:text-slate-300
                 hover:bg-slate-50 dark:hover:bg-slate-700
                 transition-colors duration-150"
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}

const CATEGORY_BADGE_STYLES = {
  bull_market:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  bear_market:  'bg-red-100    dark:bg-red-900/30     text-red-700    dark:text-red-400',
  animal_coins: 'bg-amber-100  dark:bg-amber-900/30   text-amber-700  dark:text-amber-400',
  general:      'bg-indigo-100 dark:bg-indigo-900/30  text-indigo-700 dark:text-indigo-400',
}

const CATEGORY_LABELS = {
  bull_market:  'Bull Market',
  bear_market:  'Bear Market',
  animal_coins: 'Animal Coins',
  general:      'General',
}

export function CategoryBadge({ category }) {
  const styleClass = CATEGORY_BADGE_STYLES[category] ?? CATEGORY_BADGE_STYLES.general
  const label      = CATEGORY_LABELS[category]        ?? 'General'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${styleClass}`}>
      {label}
    </span>
  )
}

export function SkeletonLine({ className = '' }) {
  return <div className={`h-3 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
}

export function SkeletonCoinList({ count = 8 }) {
  return (
    <div className="flex flex-col gap-3.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
            <SkeletonLine className="w-24" />
          </div>
          <SkeletonLine className="w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonNewsList({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
          <SkeletonLine className="w-24" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonParagraph() {
  return (
    <div className="flex flex-col gap-2.5">
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-11/12" />
      <SkeletonLine className="w-3/4" />
    </div>
  )
}

export function ErrorNote({ children }) {
  return <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">{children}</p>
}