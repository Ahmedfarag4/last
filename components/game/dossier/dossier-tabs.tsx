'use client'

import { Check, CheckCheck, Circle, LockKeyhole } from 'lucide-react'
import type { PageState } from './progress'
import type { DossierPage } from './types'

const STATE_META: Record<PageState, { label: string; Icon: typeof Circle; className: string }> = {
  unread: { label: 'Unread', Icon: Circle, className: 'text-[var(--ink)]/45' },
  reviewed: { label: 'Reviewed', Icon: Check, className: 'text-[#14708c]' },
  collected: { label: 'All information collected', Icon: CheckCheck, className: 'text-[var(--stamp)]' },
}

export function PageStateIcon({ state, className = '' }: { state: PageState; className?: string }) {
  const { Icon, className: tone } = STATE_META[state]
  return <Icon aria-hidden strokeWidth={2.6} className={`${tone} ${className}`} />
}

export function DossierTabs({
  pages,
  current,
  pageState,
  onSelect,
  side,
  isUnlocked,
}: {
  pages: DossierPage[]
  current: number | null
  pageState: (id: string) => PageState
  onSelect: (index: number) => void
  side: 'left' | 'right'
  isUnlocked?: (index: number) => boolean
}) {
  return (
    <nav aria-label="Mission file sections" className="max-md:w-full">
      <ol className={`flex gap-1.5 max-md:overflow-x-auto max-md:pb-1 md:flex-col ${side === 'left' ? 'md:items-end' : 'md:items-start'}`}>
        {pages.map((page, index) => {
          const state = pageState(page.id)
          const active = current === index
          const locked = isUnlocked ? !isUnlocked(index) : false
          return (
            <li key={page.id} className="shrink-0">
              <button
                type="button"
                onClick={() => { if (!locked) onSelect(index) }}
                disabled={locked}
                aria-label={locked ? `${page.tab} — locked` : undefined}
                aria-current={active ? 'page' : undefined}
                className={`dossier-tab group flex items-center gap-2 px-3 py-1.5 font-file text-[13px] font-bold uppercase tracking-[0.14em] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hud)] md:w-[132px] md:py-2 ${side === 'left' ? 'md:justify-between md:rounded-l-md md:hover:-translate-x-1' : 'md:justify-between md:rounded-r-md md:hover:translate-x-1'} max-md:rounded-t-md ${locked ? 'cursor-not-allowed opacity-40' : ''} ${active && side === 'left' ? 'md:-translate-x-1.5' : ''}`}
              >
                <span>{page.tab}</span>
                {locked ? <LockKeyhole aria-hidden className="size-3.5 shrink-0" /> : <PageStateIcon state={state} className="size-3.5 shrink-0" />}
                <span className="sr-only">, {locked ? 'Locked' : STATE_META[state].label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export const PAGE_STATE_LABELS = STATE_META
