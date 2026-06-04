export function Card({ title, actions, children }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between min-h-[1.25rem]">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
          {title}
        </h2>
        {actions}
      </div>
      <div>{children}</div>
    </div>
  )
}

export function ThumbsVote({ vote, onVote }) {
  return (
    <div className="flex items-center gap-0.5">
      <VoteButton
        label="Helpful"
        active={vote === 'up'}
        activeClass="text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-500/25"
        onClick={() => onVote('up')}
        icon={<ThumbUpIcon />}
      />
      <VoteButton
        label="Not helpful"
        active={vote === 'down'}
        activeClass="text-red-500 bg-red-500/10 dark:bg-red-500/15 border border-red-500/25"
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
          : 'border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
      className="px-3 py-1.5 text-xs font-medium tracking-wide rounded-lg border
                 border-slate-200 dark:border-slate-700
                 text-slate-500 dark:text-slate-400
                 hover:bg-slate-50 dark:hover:bg-slate-800
                 transition-colors duration-200"
    >
      {isDark ? '☀  Light' : '☾  Dark'}
    </button>
  )
}

export function SkeletonLine({ className = '' }) {
  return (
    <div className={`h-3 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
  )
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
  return (
    <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">{children}</p>
  )
}
