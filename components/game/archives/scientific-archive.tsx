'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Activity, Images, Map as MapIcon, NotebookPen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGameSettings } from '../settings-provider'
import {
  MEDIA,
  type MissionId,
  OPPORTUNITY_INSTRUMENTS,
  OPPORTUNITY_OBJECTIVES,
  SIGNAL_LOGS,
  TRAVERSE,
  TRAVERSE_DISTANCE,
} from './archive-data'
import { BackChip, SourceTag } from './archive-ui'
import { OPPORTUNITY_TAU_FINAL } from './opportunity-tau-data'
import { ApolloArchiveSection } from './apollo-archive-section'
import { InsightArchiveSection } from './insight-archive-section'

export type SectionId = 'media' | 'signals' | 'notes' | 'traverse'

const SECTIONS: { id: SectionId; label: string; desc: string; icon: LucideIcon }[] = [
  { id: 'media', label: 'Mission Media', desc: 'Imagery, panoramas, captions', icon: Images },
  { id: 'signals', label: 'Signal Logs', desc: 'Communications timeline', icon: Activity },
  { id: 'notes', label: 'Field Notes', desc: 'Instruments and observations', icon: NotebookPen },
  { id: 'traverse', label: 'Traverse Data', desc: 'Route and work sites', icon: MapIcon },
]

type ScientificArchiveProps = {
  section: SectionId | null
  onSection: (s: SectionId | null) => void
  onBack: () => void
  missionId?: MissionId
}

export function ScientificArchive({ section, onSection, onBack, missionId = 'opportunity' }: ScientificArchiveProps) {
  const { play } = useGameSettings()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [section])

  const current = SECTIONS.find((s) => s.id === section)
  const isOpportunity = missionId === 'opportunity'
  const missionTitle = missionId === 'apollo' ? 'Apollo' : missionId === 'insight' ? 'InSight' : 'Opportunity'

  return (
    <section
      aria-labelledby="sci-title"
      className="arc-panel-in arc-glass relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden"
      style={{ '--tone': '#49d7ff' } as React.CSSProperties}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hud/20 px-5 py-3 sm:px-7">
        <BackChip label={section ? 'Archive index' : 'Dossier'} onClick={() => (section ? onSection(null) : onBack())} />
        <h2
          id="sci-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-[10px] font-semibold tracking-[0.32em] text-hud uppercase outline-none"
        >
          {missionTitle} · {current ? current.label : 'Scientific archive'}
        </h2>
      </header>

      {section && (
        <nav aria-label="Archive sections" className="arc-scroll flex gap-2 overflow-x-auto border-b border-hud/10 px-5 py-2.5 sm:px-7">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={s.id === section ? 'page' : undefined}
              onClick={() => {
                play('click')
                onSection(s.id)
              }}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud',
                s.id === section
                  ? 'border-hud/80 bg-hud/15 text-frost'
                  : 'border-hud/20 text-frost/65 hover:border-hud/50 hover:text-frost',
              )}
            >
              <s.icon aria-hidden className="size-3.5" />
              {s.label}
            </button>
          ))}
        </nav>
      )}

      <div className="arc-swap arc-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
        {!section && (
          <ul className="grid h-full gap-4 sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className="arc-rise" style={{ '--d': `${0.08 * i}s` } as React.CSSProperties}>
                <button
                  type="button"
                  onPointerEnter={(e) => e.pointerType === 'mouse' && play('hover')}
                  onClick={() => {
                    play('archives')
                    onSection(s.id)
                  }}
                  className="group relative flex h-full min-h-32 w-full flex-col justify-between overflow-hidden rounded-2xl border border-hud/25 bg-midnight/50 p-5 text-left transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:border-hud/70 hover:shadow-[0_0_30px_rgba(73,215,255,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud"
                >
                  <span aria-hidden className="absolute -right-10 -top-10 size-36 rounded-full bg-hud/10 blur-2xl transition-opacity duration-500 group-hover:bg-hud/20" />
                  <s.icon aria-hidden className="size-6 text-hud" />
                  <span className="mt-6">
                    <span className="block font-display text-lg tracking-[0.08em] text-frost">{s.label}</span>
                    <span className="mt-1 block text-xs tracking-[0.12em] text-frost/60">{s.desc}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {isOpportunity ? (
          <>
            {section === 'media' && <MediaSection />}
            {section === 'signals' && <SignalSection />}
            {section === 'notes' && <NotesSection />}
            {section === 'traverse' && <TraverseSection />}
          </>
        ) : missionId === 'apollo' && section ? (
          <ApolloArchiveSection section={section} />
        ) : missionId === 'insight' && section ? (
          <InsightArchiveSection key={section} section={section} />
        ) : section ? (
          <PendingArchiveSection missionId={missionId as FutureMission} section={section} />
        ) : null}
      </div>
    </section>
  )
}


type FutureMission = Exclude<MissionId, 'opportunity'>
const CONTENT_SLOTS: Record<FutureMission, Record<SectionId, { heading: string; body: string; fields: string[] }>> = {
  apollo: {
    media: { heading: 'Lunar mission media', body: 'NASA photographs, surface panoramas, mission footage and original captions will be added here.', fields: ['Apollo 11', 'Apollo 12', 'Apollo 15', 'Source metadata'] },
    signals: { heading: 'Mission records', body: 'Verified communications, mission chronology, and document records will be imported here.', fields: ['Mission timeline', 'Communications records', 'Historical documents', 'Original source'] },
    notes: { heading: 'Lunar field notes', body: 'Scientific instruments, surface observations, sample records and experiment data will be added here.', fields: ['Instrument records', 'Surface notes', 'Science datasets', 'Data provenance'] },
    traverse: { heading: 'Lunar exploration', body: 'Landing-site maps and documented lunar exploration records will be added here.', fields: ['Landing sites', 'Surface operations', 'Apollo 15 traverse', 'Surveyor 3 context'] },
  },
  insight: {
    media: { heading: 'InSight mission media', body: 'Authentic InSight imagery, panoramas and mission media will be imported here.', fields: ['Lander imagery', 'Instrument photographs', 'Surface views', 'Source metadata'] },
    signals: { heading: 'Mission records', body: 'Verified timeline events, communication records and mission status reports will be added here.', fields: ['Mission timeline', 'Communications', 'Operations records', 'Original source'] },
    notes: { heading: 'Martian field notes', body: 'SEIS, HP³ and other instrument records and scientific datasets will be added here.', fields: ['Marsquake observations', 'Instrument notes', 'Scientific datasets', 'Data provenance'] },
    traverse: { heading: 'Landing site', body: 'InSight was a stationary lander. This section will contain landing-site context and instrument deployment locations, not an invented traverse.', fields: ['Elysium Planitia', 'Surface layout', 'Instrument deployment', 'Mission maps'] },
  },
}

function PendingArchiveSection({ missionId, section }: { missionId: FutureMission; section: SectionId }) {
  const [apolloMission, setApolloMission] = useState<'Apollo 11' | 'Apollo 12' | 'Apollo 15'>('Apollo 11')
  const slot = CONTENT_SLOTS[missionId][section]
  return (
    <div className="arc-swap flex min-h-full flex-col gap-5">
      {missionId === 'apollo' && (
        <div role="group" aria-label="Apollo mission selection" className="flex flex-wrap gap-2">
          {(['Apollo 11', 'Apollo 12', 'Apollo 15'] as const).map(name => (
            <button key={name} type="button" aria-pressed={apolloMission === name} onClick={() => setApolloMission(name)}
              className={cn('rounded-full border px-4 py-2 text-xs tracking-[.12em] focus-visible:outline-2 focus-visible:outline-hud', apolloMission === name ? 'border-hud bg-hud/15 text-frost' : 'border-hud/25 text-frost/65 hover:border-hud/60')}>
              {name}
            </button>
          ))}
        </div>
      )}
      <div className="relative flex min-h-52 flex-col justify-center overflow-hidden rounded-2xl border border-hud/25 bg-midnight/60 p-6 sm:p-9">
        <span aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full border border-hud/15 shadow-[0_0_100px_#49d7ff20]" />
        <p className="font-mono text-[10px] tracking-[.24em] text-ember">{missionId === 'apollo' ? apolloMission.toUpperCase() : 'INSIGHT'} / ARCHIVE VAULT</p>
        <h3 className="mt-3 font-display text-2xl tracking-[.08em] text-frost">{slot.heading}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-frost/70">{slot.body}</p>
        <p className="mt-5 w-fit rounded-full border border-ember/40 bg-ember/5 px-4 py-2 font-mono text-[10px] tracking-[.2em] text-ember">CONTENT AWAITING IMPORT</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {slot.fields.map(field => (
          <div key={field} className="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-hud/15 bg-midnight/40 p-4">
            <span className="text-sm text-frost/75">{field}</span>
            <span className="shrink-0 rounded-full border border-hud/20 px-2 py-1 font-mono text-[9px] text-hud/70">PENDING</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Unavailable({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-frost/20 px-4 py-3 text-xs leading-relaxed text-frost/55">{children}</p>
  )
}

function MediaSection() {
  const [index, setIndex] = useState(0)
  const item = MEDIA[index]
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <figure className="flex flex-col gap-3">
        <div key={item.src} className="arc-swap relative aspect-video overflow-hidden rounded-2xl border border-hud/25 bg-midnight/70">
          <Image src={item.src} alt={item.caption} fill sizes="(min-width: 1024px) 700px, 90vw" className={item.displayFit === 'contain' ? 'object-contain' : 'object-cover'} />
        </div>
        <figcaption className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold tracking-[0.06em] text-frost">{item.title}</span>
            <SourceTag kind="history" />
            <span className="rounded-full border border-hud/30 px-2 py-0.5 text-[10px] tracking-widest text-hud">{item.camera}</span>
          </div>
          <span className="text-sm text-frost/70">{item.caption}</span>
          <span className="text-xs text-frost/45">{item.credit}</span>
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="w-fit text-xs text-hud underline underline-offset-4 hover:text-frost">View original NASA source</a>
        </figcaption>
      </figure>
      <div className="flex flex-col gap-3">
        <ul className="grid grid-cols-3 gap-2 lg:grid-cols-1" aria-label="Media items">
          {MEDIA.map((m, i) => (
            <li key={m.src}>
              <button
                type="button"
                aria-pressed={i === index}
                aria-label={m.title}
                onClick={() => setIndex(i)}
                className={cn(
                  'relative block aspect-video w-full overflow-hidden rounded-xl border transition-[border-color,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud',
                  i === index ? 'border-hud' : 'border-hud/15 opacity-60 hover:opacity-100',
                )}
              >
                <Image src={m.src} alt="" fill sizes="200px" className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-frost/55">Original NASA/JPL mission imagery · 3 Pancam and 2 Navcam images. Titles and captions describe the original image records.</p>
      </div>
    </div>
  )
}

function SignalSection() {
  const [id, setId] = useState(SIGNAL_LOGS[0].id)
  const log = SIGNAL_LOGS.find((l) => l.id === id) ?? SIGNAL_LOGS[0]
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <ol className="relative flex flex-col gap-1 border-l border-hud/25 pl-4" aria-label="Signal records">
        {SIGNAL_LOGS.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              aria-pressed={l.id === id}
              onClick={() => setId(l.id)}
              className={cn(
                'relative w-full rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-hud',
                l.id === id ? 'bg-hud/10' : 'hover:bg-hud/5',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'absolute -left-[21px] top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-navy',
                  l.kind === 'fiction' ? 'bg-ember' : 'bg-hud',
                  l.id === id && 'shadow-[0_0_10px_currentColor]',
                )}
              />
              <span className="block font-mono text-[10px] tracking-[0.18em] text-frost/50">{l.stamp}</span>
              <span className="block text-sm font-semibold text-frost">{l.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <article key={log.id} aria-live="polite" className="arc-swap flex flex-col gap-3 rounded-2xl border border-hud/20 bg-midnight/50 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-[0.18em] text-hud">{log.stamp}</span>
          <SourceTag kind={log.kind} />
        </div>
        <h3 className="font-display text-xl tracking-[0.06em] text-frost">{log.title}</h3>
        <p className="text-sm leading-relaxed text-frost/80">{log.body}</p>
        {log.sourceUrl && (
          <a
            href={log.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-xs text-hud underline underline-offset-4 hover:text-frost focus-visible:outline-2 focus-visible:outline-hud"
          >
            View official source: {log.sourceLabel ?? 'NASA/JPL'}
          </a>
        )}
        <div aria-hidden className="mt-auto flex h-10 items-end gap-[3px] pt-4">
          {Array.from({ length: 40 }, (_, i) => (
            <span
              key={i}
              className={cn('arc-bar w-full rounded-full', log.kind === 'fiction' ? 'bg-ember/50' : 'bg-hud/40')}
              style={{ height: `${30 + ((i * 37) % 70)}%`, '--t': `${0.9 + (i % 5) * 0.2}s`, '--delay': `${-i * 0.07}s` } as React.CSSProperties}
            />
          ))}
        </div>
        <p className="text-[11px] text-frost/45">
          Waveform is decorative. Original transmission data and audio are not included.
        </p>
      </article>
    </div>
  )
}

function NotesSection() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-hud">Key observation</h3>
          <SourceTag kind="history" />
        </div>
        <p className="max-w-3xl text-pretty text-sm leading-relaxed text-frost/80">
          Near its landing site, Opportunity found small hematite-rich spherules, nicknamed “blueberries,” embedded in
          layered sedimentary rock. Together with other mineral evidence, they indicated that liquid water was once
          present at Meridiani Planum.
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-hud">Instrument suite</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OPPORTUNITY_INSTRUMENTS.map((i) => (
            <li key={i.name} className="rounded-xl border border-hud/15 bg-midnight/50 p-4">
              <p className="font-semibold text-frost">{i.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-frost/65">{i.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-hud">Research goals</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {OPPORTUNITY_OBJECTIVES.map((o) => (
            <li key={o} className="flex gap-3 text-sm text-frost/80">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-hud" />
              {o}
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-hud">Final Storm · Atmospheric Opacity (880 nm)</h3>
          <SourceTag kind="history" />
        </div>
        <p className="max-w-3xl text-xs leading-relaxed text-frost/65">
          Direct measurements from the original NASA PDS MER1 Pancam opacity table (Sol 5000–5105).
          Higher Tau means more dust obscuring the Sun. Missing/non-measurement values are excluded.
          This series ends at Sol 5105, so it does not measure the final Sol 5111 dust level.
        </p>
        <TauChart />
        <a href="/data/opportunity/scientific/atmospheric-opacity/1tau880_5106_20181207a.tab" download className="w-fit text-xs text-hud underline underline-offset-4">Download original NASA PDS measurements (.tab)</a>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-hud">Solar Energy and Dust Storm</h3>
        <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-hud/25 bg-midnight/50">
          <Image src="/data/opportunity/scientific/power/Opportunity_Power_vs_Tau_2018.jpg" alt="NASA graphic comparing Opportunity's available solar energy with rising atmospheric opacity during the 2018 dust storm" fill sizes="(min-width: 1024px) 760px, 90vw" className="object-contain" />
        </div>
        <p className="text-xs leading-relaxed text-frost/65">NASA's published graphic reports approximately 21 watt-hours of available energy as dust opacity rose dramatically near the final communication. This is a published graphic, not raw battery telemetry.</p>
        <a href="https://science.nasa.gov/resource/on-mars-light-is-energy/" target="_blank" rel="noopener noreferrer" className="w-fit text-xs text-hud underline underline-offset-4">NASA image source</a>
      </section>
      <Unavailable>Raw rover power telemetry and full instrument spectra are not included in this archive.</Unavailable>
    </div>
  )
}

/** NASA/JPL PIA23178, published 2019-04-25. This is an actual mapped route,
 * not an interactive georeferenced path. The stop list is an independent index. */
const NASA_TRAVERSE_IMAGE =
  'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA23178.jpg'
const NASA_TRAVERSE_SOURCE =
  'https://www.jpl.nasa.gov/images/pia23178-opportunitys-final-traverse-map/'

function TraverseSection() {
  const [active, setActive] = useState(0)
  const [mapError, setMapError] = useState(false)
  const stop = TRAVERSE[active]
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        <figure className="overflow-hidden rounded-2xl border border-hud/25 bg-midnight/70">
          {!mapError ? (
            <img
              src={NASA_TRAVERSE_IMAGE}
              alt="NASA/JPL Opportunity final traverse map PIA23178: mapped yellow rover route from Eagle Crater to Perseverance Valley"
              width={2667}
              height={2058}
              loading="lazy"
              onError={() => setMapError(true)}
              className="block h-auto w-full object-contain"
            />
          ) : (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-frost/75">
              NASA map image could not be loaded.
              <a href={NASA_TRAVERSE_SOURCE} target="_blank" rel="noopener noreferrer" className="text-hud underline underline-offset-4">Open NASA's official traverse map</a>
            </div>
          )}
          <figcaption className="border-t border-hud/15 px-3 py-2 text-xs leading-relaxed text-frost/65">
            Actual Opportunity traverse map · NASA/JPL-Caltech/MSSS · PIA23178 (2019)
          </figcaption>
        </figure>
        <p className="text-[11px] leading-relaxed text-frost/55">
          The yellow route is from NASA's mapped orbital imagery. The station list is a separate historical index, not geolocated clickable markers.
        </p>
        <a href={NASA_TRAVERSE_SOURCE} target="_blank" rel="noopener noreferrer" className="w-fit text-xs text-hud underline underline-offset-4 hover:text-frost">
          View official NASA image and description
        </a>
      </div>
      <div className="flex flex-col gap-4">
        <article key={active} aria-live="polite" className="arc-swap rounded-2xl border border-hud/20 bg-midnight/50 p-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-[0.18em] text-ember">{stop.year}</span>
            <SourceTag kind="history" />
          </div>
          <h3 className="mt-2 font-display text-xl tracking-[0.06em] text-frost">{stop.site}</h3>
          <p className="mt-2 text-sm leading-relaxed text-frost/80">{stop.note}</p>
        </article>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-hud/15 bg-midnight/40 p-3">
            <dt className="text-[9px] uppercase tracking-[0.24em] text-hud/75">Total distance</dt>
            <dd className="mt-1 text-sm font-semibold text-frost">{TRAVERSE_DISTANCE}</dd>
          </div>
          <div className="rounded-xl border border-hud/15 bg-midnight/40 p-3">
            <dt className="text-[9px] uppercase tracking-[0.24em] text-hud/75">Region</dt>
            <dd className="mt-1 text-sm font-semibold text-frost">Meridiani Planum</dd>
          </div>
        </dl>
        <ol className="flex flex-col gap-1">
          {TRAVERSE.map((t, i) => (
            <li key={t.site}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-hud',
                  i === active ? 'bg-hud/10 text-frost' : 'text-frost/60 hover:text-frost',
                )}
              >
                <span>{t.site}</span>
                <span className="font-mono text-frost/45">{t.year}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function TauChart() {
  const valid = OPPORTUNITY_TAU_FINAL
  const width = 740
  const height = 230
  const padding = { left: 48, right: 18, top: 20, bottom: 34 }
  const xMin = 5000
  const xMax = 5106
  const yMax = Math.max(2.5, ...valid.map((p) => p.tau))
  const x = (sol: number) => padding.left + (sol - xMin) / (xMax - xMin) * (width - padding.left - padding.right)
  const y = (tau: number) => height - padding.bottom - tau / yMax * (height - padding.top - padding.bottom)
  // Bin by Sol to avoid plotting all same-day point noise at this scale.
  const bins = new Map<number, { sum: number; count: number }>()
  for (const point of valid) {
    const key = Math.floor(point.sol)
    const bin = bins.get(key) ?? { sum: 0, count: 0 }
    bin.sum += point.tau
    bin.count++
    bins.set(key, bin)
  }
  const points = [...bins].sort((a, b) => a[0] - b[0]).map(([sol, value]) => ({ sol, tau: value.sum / value.count }))
  const polyline = points.map((point) => `${x(point.sol).toFixed(1)},${y(point.tau).toFixed(1)}`).join(' ')
  return (
    <figure className="max-w-3xl rounded-2xl border border-hud/25 bg-midnight/50 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="NASA measured atmospheric opacity versus rover sol, from Sol 5000 to Sol 5105" className="block w-full">
        {[0, 1, 2, 3].filter((v) => v <= yMax).map((v) => (
          <g key={v}>
            <line x1={padding.left} x2={width - padding.right} y1={y(v)} y2={y(v)} stroke="rgba(73,215,255,.16)" />
            <text x={padding.left - 10} y={y(v) + 4} textAnchor="end" fill="#b8c6d3" fontSize="12">{v}</text>
          </g>
        ))}
        {[5000, 5025, 5050, 5075, 5100].map((sol) => (
          <text key={sol} x={x(sol)} y={height - 12} textAnchor="middle" fill="#b8c6d3" fontSize="12">{sol}</text>
        ))}
        <polyline points={polyline} fill="none" stroke="#49d7ff" strokeWidth="2.3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(valid[valid.length - 1].sol)} cy={y(valid[valid.length - 1].tau)} r="4" fill="#f2b35d" />
        <text x={width - padding.right} y="15" textAnchor="end" fill="#f2b35d" fontSize="12">Last observation: Tau {valid[valid.length - 1].tau.toFixed(3)} · Sol {Math.floor(valid[valid.length - 1].sol)}</text>
      </svg>
      <figcaption className="mt-2 text-xs text-frost/55">NASA PDS Pancam R8 880 nm · Tau is dimensionless · plotted as daily means; not simulated</figcaption>
    </figure>
  )
}
