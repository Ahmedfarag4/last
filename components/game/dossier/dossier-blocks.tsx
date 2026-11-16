'use client'

import Image from 'next/image'
import { useState } from 'react'
import { BarChart3, Check, ExternalLink, FileText, Image as ImageIcon, Lock, Paperclip, Radio, ScanSearch, StickyNote } from 'lucide-react'
import { DossierChart } from './charts'
import type { CollectibleItem, DossierBlock, InfoKind, LogEntry, MissionFile } from './types'

export type BlockContext = {
  file: MissionFile
  arabic: boolean
  collected: Set<string>
  onCollect: (itemId: string) => void
  onAnalysis: (analysisId: string) => void
}

export const KIND_ICON: Record<InfoKind, typeof FileText> = {
  text: FileText,
  media: ImageIcon,
  data: BarChart3,
  signal: Radio,
  note: StickyNote,
  evidence: Paperclip,
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-2 flex items-center gap-2 font-file text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
    <span>{children}</span>
    <span aria-hidden className="dossier-rule flex-1" />
  </h3>
)

export function DossierBlockView({ block, ctx }: { block: DossierBlock; ctx: BlockContext }) {
  switch (block.type) {
    case 'text':
      return (
        <p className={`text-pretty font-serif leading-[1.65] text-[var(--ink)] ${block.lead ? 'text-[15.5px] first-letter:float-left first-letter:mr-1.5 first-letter:font-file first-letter:text-[42px] first-letter:font-bold first-letter:leading-[0.85]' : 'text-[15px]'}`}>
          {block.body}
        </p>
      )
    case 'facts':
      return (
        <section>
          <SectionLabel>{block.title}</SectionLabel>
          <dl className="overflow-hidden rounded-sm border border-[var(--ink)]/25">
            {block.rows.map((row, i) => (
              <div key={row.label} className={`flex items-baseline justify-between gap-3 px-3 py-1.5 ${i % 2 ? 'bg-[var(--paper-edge)]/25' : ''}`}>
                <dt className="font-file text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--ink-soft)]">{row.label}</dt>
                <dd className="text-right font-serif text-[14px] font-semibold tabular-nums text-[var(--ink)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
    case 'list':
      return (
        <section>
          <SectionLabel>{block.title}</SectionLabel>
          <ol className="flex flex-col gap-1.5">
            {block.items.map((item, i) => (
              <li key={item} className="flex gap-2.5 font-serif text-[14.5px] leading-snug">
                <span className="font-file text-[13px] font-bold tabular-nums text-[var(--stamp)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      )
    case 'photo':
      return (
        <figure className="dossier-photo relative mx-auto w-[92%] p-2 pb-1.5" style={{ transform: `rotate(${block.tilt ?? 0}deg)` }}>
          <div className={`relative overflow-hidden bg-[#1a120b] ${block.aspect ?? 'aspect-[4/3]'}`}>
            <Image src={block.src} alt={block.alt} fill sizes="(min-width: 768px) 360px, 90vw" className={block.fit === 'contain' ? 'object-contain' : 'object-cover sepia-[0.15]'} />
          </div>
          <figcaption className="mt-1.5 flex flex-col">
            <span className="font-file text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--ink)]">{block.caption}</span>
            {block.credit && <span className="font-serif text-[11.5px] italic text-[var(--ink-faint)]">{block.credit}</span>}
          </figcaption>
        </figure>
      )
    case 'timeline':
      return (
        <ol className="relative flex flex-col gap-4 border-l-2 border-dashed border-[var(--ink)]/30 pl-5">
          {block.entries.map((entry) => (
            <li key={entry.title} className="relative">
              <span aria-hidden className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-[var(--paper)] bg-[var(--stamp)]" />
              <p className="font-file text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--stamp)]">{entry.stamp}</p>
              <p className="font-file text-[17px] font-semibold uppercase leading-tight tracking-[0.04em]">{entry.title}</p>
              <p className="mt-0.5 text-pretty font-serif text-[14px] leading-snug text-[var(--ink-soft)]">{entry.body}</p>
            </li>
          ))}
        </ol>
      )
    case 'logs':
      return <SignalLogList entries={block.entries} arabic={ctx.arabic} />
    case 'chart':
      return (
        <figure className="rounded-sm border border-[var(--ink)]/25 bg-[#f3ead4]/60 p-3">
          <figcaption className="mb-1 font-file text-[14px] font-semibold uppercase tracking-[0.12em]">{block.title}</figcaption>
          <DossierChart chartId={block.chartId} />
          {block.caption && <p className="mt-1 font-serif text-[12px] italic leading-snug text-[var(--ink-faint)]">{block.caption}</p>}
        </figure>
      )
    case 'callout':
      return (
        <aside className="overflow-hidden rounded-sm border border-[var(--ink)]/40">
          <p className="bg-[var(--ink)] px-3 py-1 font-file text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--paper)]">{block.title}</p>
          <p className="px-3 py-2 text-pretty font-serif text-[14px] leading-snug">{block.body}</p>
        </aside>
      )
    case 'note':
      return (
        <blockquote className="dossier-note relative -rotate-1 px-4 py-3">
          <p className="text-pretty font-serif text-[15px] italic leading-snug text-[#3b2e17]">{block.body}</p>
          {block.signature && <footer className="mt-1.5 text-right font-file text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">— {block.signature}</footer>}
        </blockquote>
      )
    case 'clue': {
      const item = ctx.file.items.find((i) => i.id === block.itemId)
      return item ? <ClueCard item={item} arabic={ctx.arabic} collected={ctx.collected.has(item.id)} onCollect={() => ctx.onCollect(item.id)} /> : null
    }
    case 'analysis': {
      const done = ctx.collected.has(block.itemId)
      return (
        <section className="rounded-sm border-2 border-[var(--ink)] bg-[#0b1620] p-3.5 text-[#eaf4ff] shadow-[0_8px_18px_rgba(20,12,4,0.35)]">
          <p className="flex items-center gap-2 font-file text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--hud)]">
            <ScanSearch aria-hidden className="size-4" /> {ctx.arabic ? 'تحليل تفاعلي' : 'Interactive analysis'}
          </p>
          <h3 className="mt-1 font-file text-[19px] font-bold uppercase leading-tight tracking-[0.04em]">{block.title}</h3>
          <p className="mt-1 text-pretty font-serif text-[14px] leading-snug text-[#c7d9e6]">{block.body}</p>
          <button
            type="button"
            onClick={() => ctx.onAnalysis(block.analysisId)}
            className={`mt-3 inline-flex items-center gap-2 rounded-sm px-3.5 py-2 font-file text-[13px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hud)] ${done ? 'border border-emerald-300/60 text-emerald-200 hover:bg-emerald-300/10' : 'bg-[var(--hud)] text-[#04121c] hover:bg-[#8be6ff]'}`}
          >
            {done ? <><Check aria-hidden className="size-4" /> {ctx.arabic ? 'تم حفظ الدليل · مراجعة' : 'Evidence secured · Review'}</> : ctx.arabic ? 'بدء التحليل' : 'Begin analysis'}
          </button>
        </section>
      )
    }
    case 'evidence':
      return (
        <div className="flex flex-col gap-3">
          {block.itemIds.map((id) => {
            const item = ctx.file.items.find((i) => i.id === id)
            if (!item) return null
            const done = ctx.collected.has(id)
            return (
              <article key={id} className={`relative rounded-sm border-2 p-3.5 ${done ? 'border-[var(--ink)] bg-[#f6efdf]' : 'border-dashed border-[var(--ink)]/35 bg-transparent'}`}>
                <p className="font-file text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{done ? (ctx.arabic ? 'تم حفظ الدليل' : 'Secured') : (ctx.arabic ? 'لم يُحفظ بعد' : 'Not yet secured')}</p>
                <h3 className="font-file text-[19px] font-bold uppercase leading-tight tracking-[0.04em]">{item.label}</h3>
                <p className={`mt-1 font-serif text-[14px] leading-snug ${done ? '' : 'text-[var(--ink-faint)]'}`}>
                  {done ? item.detail : (ctx.arabic ? 'أكمل التحليل المرتبط لتسجيل هذا الدليل.' : 'Complete the linked analysis to file this evidence.')}
                </p>
                {done ? (
                  <span className="dossier-stamp dossier-stamp-in absolute right-3 top-3 rotate-[-8deg] rounded-sm px-2 py-0.5 font-file text-[13px] font-bold uppercase tracking-[0.2em]">{ctx.arabic ? 'تم التحقق' : 'Verified'}</span>
                ) : (
                  <Lock aria-hidden className="absolute right-3 top-3 size-4 text-[var(--ink-faint)]" />
                )}
              </article>
            )
          })}
        </div>
      )
    case 'summary':
      return <SummaryBlock conclusion={block.conclusion} caveat={block.caveat} ctx={ctx} />
  }
}

function ClueCard({ item, arabic, collected, onCollect }: { item: CollectibleItem; arabic: boolean; collected: boolean; onCollect: () => void }) {
  const Icon = KIND_ICON[item.kind]
  return (
    <div className={`relative flex items-start gap-3 rounded-sm border px-3 py-2.5 transition-colors ${collected ? 'border-[var(--ink)]/30 bg-[#f6efdf]/70' : 'border-[#1d7f9c]/60 bg-[#dff3f6]/45 shadow-[0_0_0_3px_rgba(73,215,255,0.12)]'}`}>
      <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${collected ? 'text-[var(--ink-soft)]' : 'text-[#14708c]'}`} />
      <div className="min-w-0 flex-1">
        <p className="font-file text-[14px] font-bold uppercase tracking-[0.1em]">{item.label}</p>
        <p className="font-serif text-[13.5px] leading-snug text-[var(--ink-soft)]">{item.detail}</p>
      </div>
      {collected ? (
        <span className="dossier-stamp dossier-stamp-in shrink-0 rotate-[-8deg] rounded-sm px-1.5 py-0.5 font-file text-[11px] font-bold uppercase tracking-[0.18em]">{arabic ? 'تم التسجيل' : 'Logged'}</span>
      ) : (
        <button
          type="button"
          onClick={onCollect}
          className="shrink-0 rounded-sm bg-[var(--ink)] px-2.5 py-1.5 font-file text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--paper)] transition-colors hover:bg-[#14708c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14708c]"
        >
          {arabic ? 'تسجيل' : 'Log to file'}<span className="sr-only">: {item.label}</span>
        </button>
      )}
    </div>
  )
}

function SignalLogList({ entries, arabic }: { entries: LogEntry[]; arabic: boolean }) {
  const [openId, setOpenId] = useState<string | undefined>(entries.find((e) => e.id === 'last')?.id ?? entries[0]?.id)
  return (
    <ol className="flex flex-col gap-1.5 font-file">
      {entries.map((entry) => {
        const open = entry.id === openId
        return (
          <li key={entry.id} className={`rounded-sm border ${open ? 'border-[var(--ink)]/50 bg-[#f6efdf]' : 'border-[var(--ink)]/15'}`}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? undefined : entry.id)}
              className="flex w-full items-baseline gap-3 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-[#14708c]"
            >
              <span className={`w-[92px] shrink-0 text-[12px] font-bold uppercase tabular-nums tracking-[0.08em] ${entry.kind === 'fiction' ? 'text-[#6a4c8a]' : 'text-[var(--stamp)]'}`}>{entry.stamp}</span>
              <span className="text-[15px] font-semibold uppercase leading-tight tracking-[0.03em]">{entry.title}</span>
            </button>
            {open && (
              <div className="px-3 pb-2.5 pl-[116px] max-sm:pl-3">
                <p className="text-pretty font-serif text-[14px] leading-snug text-[var(--ink-soft)]">{entry.body}</p>
                {entry.kind === 'fiction' && <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6a4c8a]">{arabic ? 'خيال قصصي · ليس سجلًا تابعًا لناسا' : 'Fiction · not a NASA record'}</p>}
                {entry.sourceUrl && (
                  <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#14708c] underline underline-offset-2">
                    {entry.sourceLabel} <ExternalLink aria-hidden className="size-3" />
                  </a>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function SummaryBlock({ conclusion, caveat, ctx }: { conclusion: string; caveat?: string; ctx: BlockContext }) {
  const total = ctx.file.items.length
  const done = ctx.file.items.filter((i) => ctx.collected.has(i.id)).length
  const complete = done === total
  return (
    <div className="flex flex-col gap-4">
      <section>
        <SectionLabel>{ctx.arabic ? 'النتائج المسجلة' : 'Findings recorded'} · {done} / {total}</SectionLabel>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
          {ctx.file.items.map((item) => {
            const has = ctx.collected.has(item.id)
            return (
              <li key={item.id} className="flex items-center gap-2 font-file text-[14px] font-medium uppercase tracking-[0.06em]">
                <span aria-hidden className={`grid size-4 shrink-0 place-items-center rounded-[2px] border ${has ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--ink)]/40'}`}>
                  {has && <Check className="size-3" />}
                </span>
                <span className={has ? '' : 'text-[var(--ink-faint)]'}>{item.label}</span>
                <span className="sr-only">{has ? (ctx.arabic ? 'مجمّع' : 'collected') : (ctx.arabic ? 'ناقص' : 'missing')}</span>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="relative">
        <SectionLabel>{ctx.arabic ? 'الخلاصة' : 'Conclusion'}</SectionLabel>
        {complete ? (
          <>
            <p className="text-pretty font-serif text-[15px] leading-[1.65]">{conclusion}</p>
            <span className="dossier-stamp dossier-stamp-in mt-3 inline-block rotate-[-8deg] rounded-sm px-3 py-1 font-file text-[18px] font-bold uppercase tracking-[0.24em]">{ctx.arabic ? 'أُغلقت القضية' : 'Case closed'}</span>
          </>
        ) : (
          <p className="font-serif text-[15px] italic leading-snug text-[var(--ink-faint)]">
            {ctx.arabic ? 'تظل الخلاصة مغلقة حتى تُسجل جميع النتائج ويُحفظ ملفا الدليل.' : 'The conclusion is sealed until every finding is logged and both evidence files are secured.'}
          </p>
        )}
      </section>
      {caveat && <p className="border-t border-[var(--ink)]/20 pt-2 font-serif text-[13px] italic leading-snug text-[var(--ink-soft)]">{caveat}</p>}
    </div>
  )
}
