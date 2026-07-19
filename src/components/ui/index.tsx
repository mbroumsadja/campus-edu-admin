// src/components/ui/index.tsx
// Bibliothèque de composants UI réutilisables

import { ReactNode } from 'react'
import { Loader2, AlertCircle, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

// ── Card ──────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }:
  { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-2xl transition-all',
        onClick && 'cursor-pointer hover:shadow-card-hover',
        className
      )}
      style={{ border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────
type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple'

const BADGE_STYLES: Record<BadgeVariant, string> = {
  blue:   'bg-indigo-50 text-indigo-700 border-indigo-100',
  green:  'bg-green-50  text-green-700  border-green-100',
  amber:  'bg-amber-50  text-amber-700  border-amber-100',
  red:    'bg-red-50    text-red-700    border-red-100',
  gray:   'bg-gray-50   text-gray-600   border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
}

export function Badge({ children, variant = 'gray' }:
  { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border',
      BADGE_STYLES[variant]
    )}>
      {children}
    </span>
  )
}

// ── StatutBadge ───────────────────────────────────────────────────
export function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant; dot: string }> = {
    publie:     { label: 'Publié',     variant: 'green',  dot: '#16a34a' },
    en_attente: { label: 'En attente', variant: 'amber',  dot: '#d97706' },
    archive:    { label: 'Archivé',    variant: 'gray',   dot: '#9ca3af' },
    actif:      { label: 'Actif',      variant: 'green',  dot: '#16a34a' },
    suspendu:   { label: 'Suspendu',   variant: 'red',    dot: '#dc2626' },
  }
  const s = map[statut] ?? { label: statut, variant: 'gray' as BadgeVariant, dot: '#9ca3af' }
  return (
    <Badge variant={s.variant}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </Badge>
  )
}

// ── TypeBadge pour cours/sujets ───────────────────────────────────
export function TypeCoursBADGE({ type }: { type: string }) {
  const map: Record<string, BadgeVariant> = { pdf: 'red', video: 'blue', slide: 'purple', autre: 'gray' }
  return <Badge variant={map[type] ?? 'gray'}>{type.toUpperCase()}</Badge>
}

// ── Skeleton ─────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />
}

export function SkeletonCard() {
  return (
    <Card className="p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </Card>
  )
}

// ── Loading spinner ───────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-indigo-500" />
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>Chargement…</p>
      </div>
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-center p-6">
      <AlertCircle size={32} style={{ color: 'var(--red)' }} />
      <p className="text-sm font-medium text-gray-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="text-sm px-4 py-2 rounded-xl font-medium text-white"
          style={{ background: 'var(--brand)' }}>
          Réessayer
        </button>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
export function EmptyState({ title, description, action }:
  { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-center p-8">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--surface-2)' }}>
        <Inbox size={22} style={{ color: 'var(--text-3)' }} />
      </div>
      <div>
        <p className="font-display font-semibold text-gray-700">{title}</p>
        {description && <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────
interface PaginationProps {
  page:       number
  totalPages: number
  onPage:     (p: number) => void
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3)       return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        style={{ border: '1px solid var(--border)' }}>
        <ChevronLeft size={14} />
      </button>

      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)}
          className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
          style={{
            background:  p === page ? 'var(--brand)' : 'white',
            color:       p === page ? 'white' : 'var(--text-2)',
            border:      `1px solid ${p === page ? 'var(--brand)' : 'var(--border)'}`,
          }}>
          {p}
        </button>
      ))}

      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        style={{ border: '1px solid var(--border)' }}>
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────
export function PageHeader({ title, description, action }:
  { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <h1 className="title font-display text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="description text-sm mt-1" style={{ color: 'var(--text-2)' }}>{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md'
  loading?: boolean
  children: ReactNode
}

const BTN_STYLES = {
  primary:   { background: 'var(--brand)',   color: 'white',               border: 'none', boxShadow: '0 2px 8px rgba(91,94,244,.35)' },
  secondary: { background: 'white',          color: 'var(--text-1)',        border: '1px solid var(--border)' },
  ghost:     { background: 'transparent',    color: 'var(--text-2)',        border: '1px solid var(--border)' },
  danger:    { background: 'rgba(220,38,38,.08)', color: 'var(--red)',      border: '1px solid rgba(220,38,38,.2)' },
}

export function Button({ variant = 'primary', size = 'md', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center gap-2 font-medium rounded-xl transition-all',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        props.className
      )}
      style={BTN_STYLES[variant]}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}
