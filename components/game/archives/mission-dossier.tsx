'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Database,
  FileText,
  LockKeyhole,
  Radio,
  ScanEye,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DOSSIERS, MISSIONS, SIGNAL_LOGS, type MissionId } from './archive-data'
import { BackChip, SourceTag } from './archive-ui'

type MissionDossierProps = {
  missionId: MissionId
  onBack: () => void
  onExplore: () => void
  onBegin: () => void
  onReadManga?: () => void
}

type PageId = 'overview' | 'timeline' | 'telemetry' | 'signals' | 'notes' | 'evidence' | 'conclusion'
type EvidenceId = 'mission-profile' | 'chronology' | 'instrument-suite' | 'signal-record' | 'field-analysis' | 'm07-fragment'
type EvidenceKind = 'history' | 'fiction'
type EvidenceRecord = { id: EvidenceId; title: string; detail: string; page: PageId; kind: EvidenceKind }
type SavedProgress = { visitedPages: PageId[]; collectedEvidence: EvidenceId[]; currentPage: PageId; completed: boolean }

type ArchivePage = { id: PageId; label: string; descriptor: string; icon: LucideIcon }

const PAGES: ArchivePage[] = [
  { id: 'overview', label: 'Mission overview', descriptor: 'Briefing & objectives', icon: FileText },
  { id: 'timeline', label: 'Timeline', descriptor: 'Mission chronology', icon: CircleDot },
  { id: 'telemetry', label: 'Telemetry', descriptor: 'Craft & instruments', icon: Database },
  { id: 'signals', label: 'Signal logs', descriptor: 'Communications record', icon: Radio },
  { id: 'notes', label: 'Field notes', descriptor: 'Observations & context', icon: ScanEye },
  { id: 'evidence', label: 'Evidence register', descriptor: 'Collected records', icon: BookmarkCheck },
  { id: 'conclusion', label: 'Final transmission', descriptor: 'M-07 narrative file', icon: ShieldCheck },
]

const EVIDENCE_META: Omit<EvidenceRecord, 'detail'>[] = [
  { id: 'mission-profile', title: 'Mission profile', page: 'overview', kind: 'history' },
  { id: 'chronology', title: 'Chronology record', page: 'timeline', kind: 'history' },
  { id: 'instrument-suite', title: 'Telemetry inventory', page: 'telemetry', kind: 'history' },
  { id: 'signal-record', title: 'Communications packet', page: 'signals', kind: 'history' },
  { id: 'field-analysis', title: 'Field analysis note', page: 'notes', kind: 'history' },
  { id: 'm07-fragment', title: 'M-07 signal fragment', page: 'conclusion', kind: 'fiction' },
]

function progressKey(missionId: MissionId) {
  return `the-last-signal:archive-progress:${missionId}:v1`
}

function readProgress(missionId: MissionId): SavedProgress {
  const fallback: SavedProgress = { visitedPages: [], collectedEvidence: [], currentPage: 'overview', completed: false }
  try {
    const raw = window.localStorage.getItem(progressKey(missionId))
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<SavedProgress>
    const validPages = new Set(PAGES.map((page) => page.id))
    const validEvidence = new Set(EVIDENCE_META.map((item) => item.id))
    const visitedPages = Array.isArray(parsed.visitedPages)
      ? parsed.visitedPages.filter((id): id is PageId => typeof id === 'string' && validPages.has(id as PageId))
      : []
    const collectedEvidence = Array.isArray(parsed.collectedEvidence)
      ? parsed.collectedEvidence.filter((id): id is EvidenceId => typeof id === 'string' && validEvidence.has(id as EvidenceId))
      : []
    const currentPage = typeof parsed.currentPage === 'string' && validPages.has(parsed.currentPage as PageId)
      ? parsed.currentPage as PageId
      : 'overview'
    return { visitedPages, collectedEvidence, currentPage, completed: Boolean(parsed.completed) }
  } catch {
    return fallback
  }
}

export function MissionDossier({ missionId, onBack, onExplore, onBegin, onReadManga }: MissionDossierProps) {
  const mission = MISSIONS.find((item) => item.id === missionId) ?? MISSIONS[0]
  const dossier = DOSSIERS[mission.id]
  const headingRef = useRef<HTMLHeadingElement>(null)
  const pageScrollRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState<PageId>('overview')
  const [visitedPages, setVisitedPages] = useState<PageId[]>([])
  const [collectedEvidence, setCollectedEvidence] = useState<EvidenceId[]>([])
  const [restoredMissionId, setRestoredMissionId] = useState<MissionId | null>(null)
  const restored = restoredMissionId === missionId
  const [selectedSignalId, setSelectedSignalId] = useState(SIGNAL_LOGS[0].id)

  useEffect(() => {
    headingRef.current?.focus()
  }, [missionId])

  useEffect(() => {
    if (restored) pageScrollRef.current?.scrollTo({ top: 0 })
  }, [currentPage, restored])

  useEffect(() => {
    const saved = readProgress(missionId)
    setCurrentPage(saved.currentPage)
    setVisitedPages(Array.from(new Set([...saved.visitedPages, saved.currentPage])))
    setCollectedEvidence(saved.collectedEvidence)
    setSelectedSignalId(SIGNAL_LOGS[0].id)
    setRestoredMissionId(missionId)
  }, [missionId])

  const isComplete = visitedPages.length === PAGES.length && collectedEvidence.length === EVIDENCE_META.length

  useEffect(() => {
    if (!restored) return
    const record: SavedProgress = { visitedPages, collectedEvidence, currentPage, completed: isComplete }
    try {
      window.localStorage.setItem(progressKey(missionId), JSON.stringify(record))
    } catch {
      // Browsers may disable storage; the archive remains usable for this session.
    }
  }, [missionId, restored, currentPage, visitedPages, collectedEvidence, isComplete])

  const page = PAGES.find((item) => item.id === currentPage) ?? PAGES[0]
  const pageIndex = PAGES.findIndex((item) => item.id === page.id)
  const evidence = buildEvidence(missionId)
  const collectedCount = collectedEvidence.length
  const progress = Math.round(((visitedPages.length + collectedCount) / (PAGES.length + EVIDENCE_META.length)) * 100)

  const openPage = (id: PageId) => {
    setCurrentPage(id)
    setVisitedPages((current) => current.includes(id) ? current : [...current, id])
  }

  const movePage = (direction: number) => {
    const next = Math.min(PAGES.length - 1, Math.max(0, pageIndex + direction))
    openPage(PAGES[next].id)
  }

  const collect = (id: EvidenceId) => {
    setCollectedEvidence((current) => current.includes(id) ? current : [...current, id])
  }

  return (
    <section
      aria-labelledby="dossier-title"
      className="arc-panel-in arc-glass relative mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden"
      style={{ '--tone': '#ff9a3d' } as React.CSSProperties}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-ember/20 px-4 py-3 sm:px-6">
        <BackChip label="Archives" onClick={onBack} />
        <div className="min-w-0 text-center">
          <p className="font-mono text-[9px] tracking-[0.28em] text-ember">{dossier.index} · CLASSIFIED FIELD DOSSIER</p>
          <h2
            id="dossier-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 font-display text-sm uppercase tracking-[0.12em] text-frost outline-none sm:text-base"
          >
            {mission.name} / ARCHIVE READER
          </h2>
        </div>
        <div className="flex min-w-24 items-center justify-end gap-2">
          {isComplete ? <ShieldCheck aria-label="Investigation complete" className="size-4 text-ember" /> : <span aria-hidden className="size-1.5 rounded-full bg-hud shadow-[0_0_10px_#49d7ff]" />}
          <span className="font-mono text-[9px] tracking-[0.17em] text-frost/65">{isComplete ? 'FILE SEALED' : 'FILE OPEN'}</span>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-4 border-b border-hud/10 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-3 font-mono text-[9px] tracking-[0.13em]">
            <span className="truncate text-frost/60">INVESTIGATION PROGRESS</span>
            <span className="shrink-0 text-hud">{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Investigation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1 overflow-hidden rounded-full bg-white/10"
          >
            <div className="h-full rounded-full bg-gradient-to-r from-hud to-ember transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-4 border-l border-white/10 pl-4 sm:flex">
          <ProgressMetric label="Pages" value={`${visitedPages.length}/${PAGES.length}`} />
          <ProgressMetric label="Records" value={`${collectedCount}/${EVIDENCE_META.length}`} />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[minmax(170px,0.74fr)_minmax(0,2.3fr)] md:grid-rows-1">
        <nav aria-label="Dossier pages" className="arc-scroll flex gap-2 overflow-x-auto border-b border-hud/10 px-3 py-2.5 md:flex-col md:gap-1.5 md:overflow-y-auto md:overflow-x-hidden md:border-b-0 md:border-r md:px-3 md:py-4">
          <p className="hidden px-3 pb-2 font-mono text-[9px] tracking-[0.22em] text-frost/40 md:block">FILE CONTENTS / 07</p>
          {PAGES.map((item, index) => {
            const Icon = item.icon
            const visited = visitedPages.includes(item.id)
            const active = item.id === page.id
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => openPage(item.id)}
                className={cn(
                  'group flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud md:w-full',
                  active ? 'border-hud/50 bg-hud/10 text-frost' : 'border-transparent text-frost/55 hover:border-white/10 hover:bg-white/[0.03] hover:text-frost/85',
                )}
              >
                <span className={cn('font-mono text-[9px]', active ? 'text-ember' : 'text-frost/35')}>{String(index + 1).padStart(2, '0')}</span>
                <Icon aria-hidden className={cn('size-3.5 shrink-0', active ? 'text-hud' : 'text-frost/45')} />
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap text-[11px] font-semibold tracking-[0.04em]">{item.label}</span>
                  <span className="hidden truncate text-[9px] text-frost/40 md:block">{item.descriptor}</span>
                </span>
                {visited && <Check aria-label="Reviewed" className="size-3 shrink-0 text-hud" />}
              </button>
            )
          })}
        </nav>

        <div ref={pageScrollRef} className="arc-scroll min-h-0 overflow-y-auto p-3 sm:p-5 lg:p-7">
          <article key={page.id} className="arc-swap relative mx-auto flex min-h-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#b9d3e0]/20 bg-[#101d29]/85 shadow-[0_18px_60px_rgba(0,0,0,.28)]">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hud/50 to-transparent" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-7">
              <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-hud/75">
                <span>OUTPOST M-07</span><span className="text-white/20">/</span><span>{mission.index}</span><span className="text-white/20">/</span><span>PAGE {String(pageIndex + 1).padStart(2, '0')}</span>
              </div>
              <span className="rounded-sm border border-ember/35 px-2 py-1 font-mono text-[8px] tracking-[0.18em] text-ember">{page.id === 'conclusion' ? 'SIMULATION' : 'ARCHIVE COPY'}</span>
            </div>

            <div className="flex flex-1 flex-col px-4 py-5 sm:px-7 sm:py-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-ember">{page.descriptor}</p>
                  <h3 className="mt-2 font-display text-xl uppercase leading-tight tracking-[0.08em] text-frost sm:text-2xl">{page.label}</h3>
                  <p className="mt-2 text-xs text-frost/55">{mission.site} · {mission.body} <span className="px-1.5 text-white/20">/</span> {mission.name}</p>
                </div>
                <span className="hidden select-none font-display text-4xl leading-none text-white/[0.055] sm:block">{String(pageIndex + 1).padStart(2, '0')}</span>
              </div>

              {page.id === 'overview' && <OverviewPage mission={mission} dossier={dossier} />}
              {page.id === 'timeline' && <TimelinePage dossier={dossier} />}
              {page.id === 'telemetry' && <TelemetryPage dossier={dossier} />}
              {page.id === 'signals' && <SignalsPage missionId={missionId} selectedId={selectedSignalId} onSelect={setSelectedSignalId} />}
              {page.id === 'notes' && <FieldNotesPage dossier={dossier} />}
              {page.id === 'evidence' && <EvidenceRegister records={evidence} collected={collectedEvidence} onOpenPage={openPage} />}
              {page.id === 'conclusion' && <ConclusionPage dossier={dossier} />}

              {page.id !== 'evidence' && (
                <CollectRecord
                  record={evidence.find((record) => record.page === page.id)!}
                  collected={collectedEvidence.includes(evidence.find((record) => record.page === page.id)!.id)}
                  onCollect={collect}
                />
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3 sm:px-7">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={onExplore} className="inline-flex items-center gap-1.5 rounded-md border border-hud/20 px-2.5 py-2 font-mono text-[9px] tracking-[0.09em] text-frost/60 transition hover:border-hud/50 hover:text-frost focus-visible:outline-2 focus-visible:outline-hud">
                  <Database aria-hidden className="size-3.5" /> DATA VAULT
                </button>
                {onReadManga && <button type="button" onClick={onReadManga} className="rounded-md border border-white/10 px-2.5 py-2 font-mono text-[9px] tracking-[0.09em] text-frost/55 transition hover:border-white/30 hover:text-frost focus-visible:outline-2 focus-visible:outline-hud">READ MANGA</button>}
                {mission.id === 'opportunity' && <button type="button" onClick={onBegin} className="rounded-md border border-ember/35 bg-ember/[0.07] px-2.5 py-2 font-mono text-[9px] tracking-[0.09em] text-ember transition hover:bg-ember/15 focus-visible:outline-2 focus-visible:outline-ember">BEGIN INVESTIGATION</button>}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" aria-label="Previous dossier page" disabled={pageIndex === 0} onClick={() => movePage(-1)} className="flex size-9 items-center justify-center rounded-md border border-hud/20 text-frost/70 transition hover:border-hud/60 hover:text-frost disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-hud"><ChevronLeft aria-hidden className="size-4" /></button>
                <span className="min-w-12 text-center font-mono text-[9px] tracking-[0.12em] text-frost/50">{String(pageIndex + 1).padStart(2, '0')} / 07</span>
                <button type="button" aria-label="Next dossier page" disabled={pageIndex === PAGES.length - 1} onClick={() => movePage(1)} className="flex size-9 items-center justify-center rounded-md border border-hud/20 text-frost/70 transition hover:border-hud/60 hover:text-frost disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-hud"><ChevronRight aria-hidden className="size-4" /></button>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </section>
  )
}

function ProgressMetric({ label, value }: { label: string; value: string }) {
  return <p className="font-mono text-[9px] tracking-[0.1em] text-frost/45">{label.toUpperCase()} <span className="ml-1 text-frost/80">{value}</span></p>
}

function buildEvidence(missionId: MissionId): EvidenceRecord[] {
  const dossier = DOSSIERS[missionId]
  return EVIDENCE_META.map((record) => {
    const detail: Record<EvidenceId, string> = {
      'mission-profile': dossier.overview,
      chronology: dossier.facts.map((fact) => `${fact.label}: ${fact.value}`).join(' · '),
      'instrument-suite': `${dossier.craftTitle}: ${dossier.craft.map((fact) => `${fact.label} — ${fact.value}`).join(' · ')}. ${dossier.instruments.length} instrument records reviewed.`,
      'signal-record': missionId === 'opportunity'
        ? `${SIGNAL_LOGS.filter((log) => log.kind === 'history').length} documented communications and recovery entries reviewed; fictional records remain separately labeled.`
        : `Communications status is indexed from the mission dossier. A verified transcript is not included in this archive edition.`,
      'field-analysis': dossier.context,
      'm07-fragment': dossier.fiction,
    }
    return { ...record, detail: detail[record.id] }
  })
}

function OverviewPage({ mission, dossier }: { mission: (typeof MISSIONS)[number]; dossier: (typeof DOSSIERS)[MissionId] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative min-h-48 overflow-hidden rounded-lg border border-hud/15 bg-navy/60 lg:min-h-64">
        <Image src={mission.image} alt={mission.imageAlt} fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06101b] via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-sm border border-white/20 bg-navy/80 px-2 py-1 font-mono text-[8px] tracking-[0.17em] text-frost/65">ARTISTIC RENDER / VISUAL REFERENCE</span>
      </div>
      <div className="flex flex-col gap-4">
        <SectionLabel>MISSION BRIEF</SectionLabel>
        <p className="text-pretty text-sm leading-7 text-frost/85">{dossier.overview}</p>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hud/15 bg-hud/10 sm:grid-cols-2">
          {dossier.facts.map((fact) => <div key={fact.label} className="bg-[#0c1722] p-3"><dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-hud/65">{fact.label}</dt><dd className="mt-1 text-xs leading-5 text-frost/85">{fact.value}</dd></div>)}
        </dl>
        <div>
          <SectionLabel>PRIMARY OBJECTIVES</SectionLabel>
          <ul className="mt-2 flex flex-col gap-2">
            {dossier.objectives.map((objective, index) => <li key={objective} className="flex gap-2.5 text-xs leading-5 text-frost/70"><span className="font-mono text-[9px] text-ember">0{index + 1}</span><span>{objective}</span></li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

function TimelinePage({ dossier }: { dossier: (typeof DOSSIERS)[MissionId] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section className="rounded-lg border border-white/[0.08] bg-black/10 p-4 sm:p-5">
        <SectionLabel>FLIGHT & OPERATIONS MILESTONES</SectionLabel>
        <ol className="mt-4 flex flex-col gap-0">
          {dossier.facts.map((fact, index) => (
            <li key={fact.label} className="relative flex gap-3 pb-5 last:pb-0">
              {index < dossier.facts.length - 1 && <span aria-hidden className="absolute left-[5px] top-3 h-full w-px bg-hud/20" />}
              <span aria-hidden className="z-10 mt-1 size-2.5 shrink-0 rounded-full border border-hud/60 bg-[#122536] shadow-[0_0_10px_rgba(73,215,255,.25)]" />
              <div><p className="font-mono text-[9px] tracking-[0.12em] text-hud/70">{fact.label.toUpperCase()}</p><p className="mt-1 text-sm font-semibold text-frost">{fact.value}</p></div>
            </li>
          ))}
        </ol>
      </section>
      <section className="flex flex-col justify-between gap-4 rounded-lg border border-ember/15 bg-ember/[0.035] p-4 sm:p-5">
        <div><SectionLabel>HISTORICAL CONTEXT</SectionLabel><p className="mt-3 text-sm leading-7 text-frost/75">{dossier.context}</p></div>
        <p className="border-l border-ember/45 pl-3 font-mono text-[9px] leading-5 tracking-[0.08em] text-ember/80">SOURCE CLASS: MISSION DOSSIER <span className="px-1 text-white/20">/</span> FACTS AND CONTEXT ARE HISTORICAL</p>
      </section>
    </div>
  )
}

function TelemetryPage({ dossier }: { dossier: (typeof DOSSIERS)[MissionId] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {dossier.craft.map((fact) => <div key={fact.label} className="rounded-md border border-hud/15 bg-navy/45 p-3"><p className="font-mono text-[8px] tracking-[0.16em] text-hud/60">{fact.label.toUpperCase()}</p><p className="mt-1 text-xs leading-5 text-frost/85">{fact.value}</p></div>)}
      </div>
      <section>
        <div className="flex items-center justify-between gap-3"><SectionLabel>{dossier.craftTitle.toUpperCase()} / INSTRUMENT REGISTER</SectionLabel><span className="font-mono text-[9px] text-frost/40">{String(dossier.instruments.length).padStart(2, '0')} ITEMS</span></div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {dossier.instruments.map((instrument, index) => <li key={instrument.name} className="flex gap-3 rounded-md border border-white/[0.07] bg-black/10 p-3"><span className="font-mono text-[9px] text-ember/80">{String(index + 1).padStart(2, '0')}</span><div><h4 className="text-xs font-semibold text-frost">{instrument.name}</h4><p className="mt-1 text-[11px] leading-5 text-frost/60">{instrument.detail}</p></div></li>)}
        </ul>
      </section>
    </div>
  )
}

function SignalsPage({ missionId, selectedId, onSelect }: { missionId: MissionId; selectedId: string; onSelect: (id: string) => void }) {
  const isOpportunity = missionId === 'opportunity'
  const logs = isOpportunity ? SIGNAL_LOGS : []
  const selected = logs.find((log) => log.id === selectedId) ?? logs[0]
  if (!selected) {
    const mission = MISSIONS.find((item) => item.id === missionId) ?? MISSIONS[0]
    const dossier = DOSSIERS[missionId]
    return (
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex min-h-44 flex-col justify-between rounded-lg border border-hud/15 bg-navy/40 p-4">
          <div><SectionLabel>COMMUNICATIONS INDEX</SectionLabel><p className="mt-3 text-sm leading-6 text-frost/75">The mission timeline is recorded in the preceding file. A communications transcript has not been imported into this archive edition.</p></div>
          <p className="font-mono text-[9px] tracking-[0.12em] text-ember/80">RECORD STATUS / PARTIAL INDEX</p>
        </div>
        <div className="rounded-lg border border-ember/20 bg-ember/[0.035] p-4">
          <div className="flex items-center gap-2"><Radio aria-hidden className="size-4 text-ember" /><SectionLabel>UNVERIFIED SIGNAL / FICTION</SectionLabel></div>
          <h4 className="mt-3 font-display text-base tracking-[0.05em] text-frost">{mission.name} · M-07 record</h4>
          <p className="mt-2 text-sm leading-6 text-frost/70">{dossier.fiction}</p>
          <div className="mt-3"><SourceTag kind="fiction" /></div>
        </div>
      </div>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ol aria-label="Communications and recovery records" className="arc-scroll flex max-h-[34vh] flex-col gap-1 overflow-y-auto border-l border-hud/25 pl-3 md:max-h-[38vh]">
        {logs.map((log) => (
          <li key={log.id}>
            <button type="button" aria-pressed={log.id === selected.id} onClick={() => onSelect(log.id)} className={cn('w-full rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-hud', log.id === selected.id ? 'bg-hud/10' : 'hover:bg-white/[0.04]')}>
              <span className="font-mono text-[8px] tracking-[0.1em] text-frost/45">{log.stamp}</span>
              <span className="mt-1 block text-xs font-semibold leading-5 text-frost/85">{log.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <article aria-live="polite" className="flex flex-col gap-3 rounded-lg border border-hud/15 bg-navy/40 p-4">
        <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[9px] tracking-[0.14em] text-hud">{selected.stamp}</span><SourceTag kind={selected.kind} /></div>
        <h4 className="font-display text-base leading-snug tracking-[0.04em] text-frost">{selected.title}</h4>
        <p className="text-sm leading-6 text-frost/75">{selected.body}</p>
        {selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-auto w-fit text-[11px] text-hud underline underline-offset-4 hover:text-frost focus-visible:outline-2 focus-visible:outline-hud">View source: {selected.sourceLabel ?? 'NASA / JPL'}</a>}
      </article>
    </div>
  )
}

function FieldNotesPage({ dossier }: { dossier: (typeof DOSSIERS)[MissionId] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="rounded-lg border border-hud/15 bg-navy/35 p-4 sm:p-5">
        <SectionLabel>RESEARCH QUESTIONS</SectionLabel>
        <ul className="mt-4 flex flex-col gap-3">
          {dossier.objectives.map((objective, index) => <li key={objective} className="flex gap-3 text-xs leading-6 text-frost/75"><span className="mt-0.5 font-mono text-[9px] text-hud/70">Q{index + 1}</span><span>{objective}</span></li>)}
        </ul>
      </section>
      <section className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-black/10 p-4 sm:p-5">
        <SectionLabel>OBSERVATION / HISTORICAL CONTEXT</SectionLabel>
        <p className="text-sm leading-7 text-frost/75">{dossier.context}</p>
        <p className="mt-auto border-t border-white/[0.07] pt-3 font-mono text-[9px] leading-5 tracking-[0.08em] text-frost/40">FIELD NOTES ARE SUMMARIZED FROM THE MISSION FILE. NO NEW MEASUREMENTS ARE IMPLIED.</p>
      </section>
    </div>
  )
}

function EvidenceRegister({ records, collected, onOpenPage }: { records: EvidenceRecord[]; collected: EvidenceId[]; onOpenPage: (id: PageId) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div><SectionLabel>RESEARCH REGISTER</SectionLabel><p className="mt-2 text-xs text-frost/60">Records are filed here as you inspect each dossier page.</p></div>
        <span className="font-mono text-[9px] tracking-[0.13em] text-hud">{collected.length} / {records.length} ACQUIRED</span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {records.map((record, index) => {
          const isCollected = collected.includes(record.id)
          const pageTitle = PAGES.find((page) => page.id === record.page)?.label ?? 'Dossier page'
          return (
            <li key={record.id} className={cn('flex min-h-28 flex-col justify-between rounded-md border p-3 transition-colors', isCollected ? 'border-hud/25 bg-hud/[0.045]' : 'border-white/[0.07] bg-black/10')}>
              <div className="flex items-start justify-between gap-2"><span className="font-mono text-[9px] tracking-[0.12em] text-frost/35">RECORD {String(index + 1).padStart(2, '0')}</span>{isCollected ? <Check aria-label="Collected" className="size-3.5 text-hud" /> : <LockKeyhole aria-label="Not collected" className="size-3.5 text-frost/30" />}</div>
              <div className="mt-3"><h4 className="text-xs font-semibold text-frost/90">{record.title}</h4><p className="mt-1 text-[10px] text-frost/45">{pageTitle}{record.kind === 'fiction' ? ' · FICTION' : ' · VERIFIED HISTORY'}</p></div>
              {!isCollected && <button type="button" onClick={() => onOpenPage(record.page)} className="mt-3 w-fit font-mono text-[9px] tracking-[0.1em] text-hud hover:text-frost focus-visible:outline-2 focus-visible:outline-hud">OPEN SOURCE PAGE <ArrowRight aria-hidden className="ml-1 inline size-3" /></button>}
            </li>
          )
        })}
      </ul>
      {collected.length > 0 && <section className="mt-1 rounded-md border border-white/[0.07] bg-black/10 p-4"><SectionLabel>COLLECTED EXCERPTS</SectionLabel><ul className="mt-3 flex flex-col gap-3">{records.filter((record) => collected.includes(record.id)).map((record) => <li key={record.id} className="border-l border-hud/40 pl-3"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold text-frost/85">{record.title}</p><SourceTag kind={record.kind} /></div><p className="mt-1 text-[11px] leading-5 text-frost/55">{record.detail}</p></li>)}</ul></section>}
    </div>
  )
}

function ConclusionPage({ dossier }: { dossier: (typeof DOSSIERS)[MissionId] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="flex flex-col justify-center rounded-lg border border-hud/15 bg-navy/35 p-5 sm:p-7">
        <SectionLabel>MISSION SUMMARY / VERIFIED CONTEXT</SectionLabel>
        <p className="mt-4 text-sm leading-7 text-frost/80">{dossier.overview}</p>
        <p className="mt-4 text-xs leading-6 text-frost/55">{dossier.context}</p>
      </div>
      <div className="relative flex flex-col justify-center overflow-hidden rounded-lg border border-ember/25 bg-ember/[0.035] p-5 sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full border border-ember/10" />
        <div className="flex items-center gap-2"><Radio aria-hidden className="size-4 text-ember" /><SectionLabel>OUTPOST M-07 / FICTION</SectionLabel></div>
        <h4 className="mt-4 font-display text-lg tracking-[0.05em] text-frost">Unverified final transmission</h4>
        <p className="mt-3 text-sm leading-7 text-frost/75">{dossier.fiction}</p>
        <div className="mt-4"><SourceTag kind="fiction" /></div>
        <p className="mt-5 border-t border-ember/15 pt-3 font-mono text-[9px] leading-5 tracking-[0.1em] text-ember/65">NARRATIVE ELEMENT / NOT A HISTORICAL MISSION RECORD</p>
      </div>
    </div>
  )
}

function CollectRecord({ record, collected, onCollect }: { record: EvidenceRecord; collected: boolean; onCollect: (id: EvidenceId) => void }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
      <div className="flex min-w-0 items-start gap-2.5">
        {collected ? <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-hud" /> : <ScanEye aria-hidden className="mt-0.5 size-4 shrink-0 text-ember" />}
        <div className="min-w-0"><p className="text-xs font-semibold text-frost/85">{collected ? 'Record added to evidence register' : `Inspect and collect: ${record.title}`}</p><p className="mt-1 text-[10px] leading-4 text-frost/45">{record.kind === 'fiction' ? 'Story fragment · explicitly fictional' : 'Mission archive · verified historical context'}</p></div>
      </div>
      <button type="button" aria-pressed={collected} disabled={collected} onClick={() => onCollect(record.id)} className={cn('inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 font-mono text-[9px] tracking-[0.12em] transition focus-visible:outline-2 focus-visible:outline-hud', collected ? 'border-hud/30 bg-hud/[0.06] text-hud/75' : 'border-ember/45 bg-ember/[0.07] text-ember hover:bg-ember/15')}>
        {collected ? <><Check aria-hidden className="size-3" /> COLLECTED</> : <>COLLECT RECORD <ArrowRight aria-hidden className="size-3" /></>}
      </button>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="font-mono text-[9px] font-semibold tracking-[0.2em] text-hud/75">{children}</h4>
}
