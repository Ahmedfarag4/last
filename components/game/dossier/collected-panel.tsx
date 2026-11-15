'use client'

import { useState } from 'react'
import { Check, FileStack, FolderOpen, RotateCcw } from 'lucide-react'
import { KIND_ICON } from './dossier-blocks'
import { PAGE_STATE_LABELS, PageStateIcon } from './dossier-tabs'
import type { PageState } from './progress'
import type { MissionFile } from './types'

export function CollectedPanel({
  file,
  pageId,
  collected,
  totals,
  onReset,
}: {
  file: MissionFile
  pageId: string
  collected: Set<string>
  totals: { pages: number; visited: number; items: number; collected: number }
  onReset: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const pageItems = file.items.filter((i) => i.pageId === pageId)
  const page = file.pages.find((p) => p.id === pageId)

  return (
    <div className="flex flex-col gap-3 font-file text-[#eaf4ff]">
      <section className="rounded-md border border-[var(--hud)]/30 bg-[#06121d]/90 p-3.5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--hud)]">Collected info</h2>
        <p className="mt-0.5 text-[12px] uppercase tracking-[0.16em] text-[#8fb4c6]">{page?.tab}</p>
        {pageItems.length ? (
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {pageItems.map((item) => {
              const has = collected.has(item.id)
              const Icon = KIND_ICON[item.kind]
              return (
                <li key={item.id} className="flex items-center gap-2.5 text-[14px] font-medium tracking-[0.04em]">
                  <span aria-hidden className={`grid size-4 shrink-0 place-items-center rounded-[3px] border ${has ? 'border-[var(--hud)] bg-[var(--hud)] text-[#04121c]' : 'border-[#8fb4c6]/50'}`}>
                    {has && <Check strokeWidth={3} className="size-3" />}
                  </span>
                  <span className={has ? 'text-white' : 'text-[#8fb4c6]'}>{item.label}</span>
                  <Icon aria-hidden className="ml-auto size-3.5 text-[#8fb4c6]/70" />
                  <span className="sr-only">{has ? 'collected' : 'not collected'}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-2 font-serif text-[13px] italic text-[#8fb4c6]">No collectible information on this page.</p>
        )}
      </section>

      <section className="rounded-md border border-[var(--hud)]/30 bg-[#06121d]/90 p-3.5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--hud)]">Progress & tracking</h2>
        <dl className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <FileStack aria-hidden className="size-5 text-[var(--hud)]" />
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-[#8fb4c6]">Pages explored</dt>
              <dd className="text-[18px] font-bold tabular-nums leading-none">{totals.visited}<span className="text-[#8fb4c6]"> / {totals.pages}</span></dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen aria-hidden className="size-5 text-[#f2b35d]" />
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-[#8fb4c6]">Info collected</dt>
              <dd className="text-[18px] font-bold tabular-nums leading-none">{totals.collected}<span className="text-[#8fb4c6]"> / {totals.items}</span></dd>
            </div>
          </div>
        </dl>
        <ul className="mt-3 flex flex-col gap-1 border-t border-[var(--hud)]/15 pt-2.5">
          {(Object.keys(PAGE_STATE_LABELS) as PageState[]).map((state) => (
            <li key={state} className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#b5cbd8]">
              <span className="grid size-5 place-items-center rounded-sm bg-[#ebdfc3]"><PageStateIcon state={state} className="size-3" /></span>
              {state === 'collected' ? 'Collected' : PAGE_STATE_LABELS[state].label}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#8fb4c6]">Progress auto-saved</p>
        {confirming ? (
          <span className="flex gap-1.5">
            <button type="button" onClick={() => { onReset(); setConfirming(false) }} className="rounded-sm bg-[#c0463b] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Confirm</button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-sm border border-[#8fb4c6]/40 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">Cancel</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-1 rounded-sm px-1.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8fb4c6] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--hud)]">
            <RotateCcw aria-hidden className="size-3" /> Reset file
          </button>
        )}
      </div>
    </div>
  )
}
