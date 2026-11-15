'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { ArrowLeft, ArrowRight, BatteryCharging, ClipboardList, FileSearch, RadioTower, ScanEye, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useGameSettings } from './settings-provider'

type StationId = 'briefing' | 'telemetry' | 'signals' | 'evidence'

const STATIONS: Record<StationId, { name: string; serial: string; title: string; detail: string; objective: string }> = {
  briefing: {
    name: 'MAIN DISPLAY', serial: '01 / MISSION BRIEF', title: 'THE FINAL STORM',
    detail: 'Opportunity last communicated with Earth on June 10, 2018 (Sol 5111), during a planet-encircling dust storm.',
    objective: 'Your mission: reconstruct the final days of MER-B using documented NASA records. The investigation is historical; any future rescue scenario is simulated.',
  },
  telemetry: {
    name: 'TELEMETRY', serial: '02 / ATMOSPHERIC DATA', title: 'THE DARKENING SKY',
    detail: 'Atmospheric opacity (Tau) increased as dust blocked sunlight from reaching the rover solar arrays.',
    objective: 'Inspect the original atmospheric data in the Scientific Archive. An interactive data-analysis puzzle will be connected here in the next milestone.',
  },
  signals: {
    name: 'SIGNAL CONSOLE', serial: '03 / COMMUNICATIONS', title: 'THE LAST TRANSMISSION',
    detail: 'The final contact took place on June 10, 2018. NASA continued recovery attempts and announced the end of the mission in February 2019.',
    objective: 'Investigate the difference between the last received signal and the later recovery attempts. The signal reconstruction puzzle is not yet connected.',
  },
  evidence: {
    name: 'EVIDENCE DESK', serial: '04 / CASE FILE', title: 'CASE RECONSTRUCTION',
    detail: 'Collect scientific evidence and communications records to establish what happened, what is documented, and what remains unknown.',
    objective: 'Evidence collection and the final diagnosis unlock once the two investigation puzzles are implemented.',
  },
}

/* All scene geometry is expressed in the background image's native pixel space (1672 x 940). */
const SCENE_W = 1672
const SCENE_H = 940
type Point = readonly [number, number]

const HOTSPOTS: { id: StationId; label: string; icon: LucideIcon; amber?: boolean; shape: Point[]; anchor: Point }[] = [
  { id: 'briefing', label: 'MAIN DISPLAY', icon: ScanEye, shape: [[402, 170], [1270, 170], [1270, 474], [402, 474]], anchor: [836, 452] },
  { id: 'telemetry', label: 'TELEMETRY', icon: BatteryCharging, shape: [[24, 390], [508, 382], [534, 548], [92, 606]], anchor: [290, 628] },
  { id: 'signals', label: 'SIGNALS', icon: RadioTower, shape: [[1212, 394], [1652, 388], [1646, 600], [1198, 550]], anchor: [1424, 626] },
  { id: 'evidence', label: 'EVIDENCE DESK', icon: ClipboardList, amber: true, shape: [[538, 662], [1134, 662], [1184, 798], [490, 798]], anchor: [836, 816] },
]

/* Panels painted over invented readouts in the reference art so no unverified values are shown. */
const READOUT_MASKS: Point[][] = [
  [[420, 430], [496, 426], [502, 524], [424, 530]],
  [[1376, 518], [1480, 522], [1478, 558], [1374, 554]],
]

const pct = (value: number, total: number) => (value / total) * 100 + '%'
const toPoints = (shape: Point[]) => shape.map(([x, y]) => x + ',' + y).join(' ')

function hitStyle(shape: Point[]): CSSProperties {
  const xs = shape.map((p) => p[0])
  const ys = shape.map((p) => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const w = maxX - minX, h = maxY - minY
  return {
    left: pct(minX, SCENE_W), top: pct(minY, SCENE_H), width: pct(w, SCENE_W), height: pct(h, SCENE_H),
    clipPath: 'polygon(' + shape.map(([x, y]) => ((x - minX) / w) * 100 + '% ' + ((y - minY) / h) * 100 + '%').join(',') + ')',
  }
}

const PAN_LIMIT = 45
const PAN_STEP = 15
const PAN_SCALE = 1.06
const PAN_SHIFT_PER_DEG = 0.06

export function InvestigationScreen({ onBack }: { onBack: () => void }) {
  const { settings, play } = useGameSettings()
  const [active, setActive] = useState<StationId | null>(null)
  const [hot, setHot] = useState<StationId | null>(null)
  const [pan, setPan] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const station = active ? STATIONS[active] : null

  useEffect(() => {
    if (active) closeRef.current?.focus()
  }, [active])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (active && event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        setActive(null)
        window.setTimeout(() => lastFocus.current?.focus(), 0)
        return
      }
      if (active) return
      if (event.key === 'ArrowLeft') setPan((v) => Math.max(-PAN_LIMIT, v - PAN_STEP))
      if (event.key === 'ArrowRight') setPan((v) => Math.min(PAN_LIMIT, v + PAN_STEP))
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [active])

  const openStation = (id: StationId, event: MouseEvent<HTMLButtonElement>) => {
    lastFocus.current = event.currentTarget
    play('click')
    setActive(id)
  }
  const closeStation = () => {
    play('back')
    setActive(null)
    window.setTimeout(() => lastFocus.current?.focus(), 0)
  }
  const move = (direction: -1 | 1) => {
    play('click')
    setPan((value) => Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, value + direction * PAN_STEP)))
  }
  const motion = settings.reducedMotion ? 'transition-none' : 'transition-transform duration-700 ease-out'
  const fade = settings.reducedMotion ? 'transition-none' : 'transition-opacity duration-200'

  return (
    <section className="fixed inset-0 z-30 isolate flex items-center justify-center overflow-hidden bg-[#010409] text-[#eaf4ff]" aria-label="Opportunity Mission Control">
      {/* Stage is locked to 16:9 and fitted inside the viewport so the room never scrolls or distorts. */}
      <div className="@container relative aspect-video w-[min(100vw,calc(100dvh*16/9))] overflow-hidden">
        <div className={'absolute inset-0 origin-center ' + motion}
          style={{ transform: 'translate3d(' + -pan * PAN_SHIFT_PER_DEG + '%,0,0) scale(' + PAN_SCALE + ')' }}>
          <Image src="/images/opportunity-control-room.png" alt="" fill priority sizes="100vw" className="select-none object-cover" draggable={false} />

          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full" viewBox={'0 0 ' + SCENE_W + ' ' + SCENE_H} preserveAspectRatio="none">
            <defs>
              <radialGradient id="hud-mask">
                <stop offset="55%" stopColor="#02060c" stopOpacity="1" />
                <stop offset="100%" stopColor="#02060c" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="floor-mask" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#02060c" stopOpacity="0" />
                <stop offset="45%" stopColor="#02060c" stopOpacity=".92" />
                <stop offset="100%" stopColor="#02060c" stopOpacity="1" />
              </linearGradient>
              <filter id="hot-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            {/* Fade out HUD chrome baked into the reference art; the live HUD sits above it. */}
            <ellipse cx="138" cy="52" rx="190" ry="62" fill="url(#hud-mask)" />
            <ellipse cx="1396" cy="54" rx="320" ry="70" fill="url(#hud-mask)" />
            <rect x="0" y="842" width={SCENE_W} height="98" fill="url(#floor-mask)" />
            {READOUT_MASKS.map((shape, i) => (
              <g key={i}>
                <polygon points={toPoints(shape)} fill="#041522" fillOpacity=".97" />
                <polygon points={toPoints(shape)} fill="none" stroke="#49d7ff" strokeOpacity=".18" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            {HOTSPOTS.map((spot) => {
              const color = spot.amber ? '#f2b35d' : '#49d7ff'
              return (
                <g key={spot.id} className={fade} style={{ opacity: hot === spot.id ? 1 : 0 }}>
                  <polygon points={toPoints(spot.shape)} fill="none" stroke={color} strokeOpacity=".55" strokeWidth="10" filter="url(#hot-glow)" />
                  <polygon points={toPoints(spot.shape)} fill={color} fillOpacity=".07" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </g>
              )
            })}
          </svg>

          {HOTSPOTS.map((spot) => {
            const Icon = spot.icon
            return (
              <span key={spot.id} aria-hidden
                className={'pointer-events-none absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-[0.4cqw] whitespace-nowrap rounded-full border bg-[#020a12]/90 px-[0.7cqw] py-[0.3cqw] text-[max(9px,0.62cqw)] font-semibold tracking-[.16em] shadow-[0_0_14px_#0008] ' + fade + ' ' +
                  (spot.amber ? 'border-[#f2b35d]/60 text-[#ffe1a5]' : 'border-[#49d7ff]/60 text-[#c9f4ff]')}
                style={{ left: pct(spot.anchor[0], SCENE_W), top: pct(spot.anchor[1], SCENE_H), opacity: hot === spot.id ? 1 : 0 }}>
                <Icon className="size-[max(10px,0.7cqw)]" /> {spot.label}
              </span>
            )
          })}

          {HOTSPOTS.map((spot) => (
            <button key={spot.id} type="button"
              onClick={(e) => openStation(spot.id, e)}
              onMouseEnter={() => setHot(spot.id)}
              onMouseLeave={() => setHot((h) => (h === spot.id ? null : h))}
              onFocus={() => setHot(spot.id)}
              onBlur={() => setHot((h) => (h === spot.id ? null : h))}
              className="absolute cursor-pointer bg-transparent outline-none"
              style={hitStyle(spot.shape)}
              aria-label={'Open ' + STATIONS[spot.id].name} />
          ))}
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_8cqw_#000a]" />

        <header className="pointer-events-none absolute inset-x-[1.8%] top-[3%] z-20 flex items-start justify-between gap-4">
          <button type="button" onClick={() => { play('back'); onBack() }}
            className="pointer-events-auto inline-flex items-center gap-[0.5cqw] rounded-full border border-[#49d7ff]/40 bg-[#040e18]/90 px-[1.1cqw] py-[0.55cqw] text-[max(10px,0.72cqw)] font-semibold tracking-[.1em] backdrop-blur-sm transition-colors hover:border-[#49d7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#49d7ff]">
            <ArrowLeft className="size-[max(12px,0.9cqw)]" /> EXIT INVESTIGATION
          </button>
          <div className="rounded-md border border-[#49d7ff]/20 bg-[#030a12]/85 px-[1cqw] py-[0.5cqw] text-right backdrop-blur-sm">
            <p className="text-[max(8px,0.55cqw)] font-semibold tracking-[.25em] text-[#6cdffe]">OUTPOST M-07 · MISSION 01</p>
            <h1 className="mt-[0.2cqw] font-display text-[max(10px,1.05cqw)] leading-tight tracking-[.1em]">OPPORTUNITY / THE FINAL STORM</h1>
          </div>
        </header>

        <footer className="pointer-events-none absolute inset-x-[1.8%] bottom-[2.4%] z-20 flex items-center justify-between gap-2">
          <p className="w-[30%] text-[max(8px,0.55cqw)] tracking-[.16em] text-[#70cbe0]/80">INVESTIGATION ACTIVE · NASA ARCHIVE</p>
          <div className="pointer-events-auto flex items-center gap-[0.8cqw] rounded-full border border-[#49d7ff]/20 bg-[#030a12]/85 p-[0.3cqw] backdrop-blur-sm">
            <button type="button" onClick={() => move(-1)} disabled={pan <= -PAN_LIMIT} aria-label="Look left" className="rounded-full border border-[#49d7ff]/40 p-[0.5cqw] transition-colors hover:bg-[#49d7ff]/10 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[#49d7ff]"><ArrowLeft className="size-[max(12px,0.9cqw)]" /></button>
            <span aria-live="polite" className="min-w-[5cqw] text-center font-mono text-[max(9px,0.62cqw)] tracking-[.12em] text-[#a7eaff]">VIEW {pan > 0 ? '+' : ''}{pan}°</span>
            <button type="button" onClick={() => move(1)} disabled={pan >= PAN_LIMIT} aria-label="Look right" className="rounded-full border border-[#49d7ff]/40 p-[0.5cqw] transition-colors hover:bg-[#49d7ff]/10 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[#49d7ff]"><ArrowRight className="size-[max(12px,0.9cqw)]" /></button>
          </div>
          <p className="w-[30%] text-right text-[max(8px,0.55cqw)] tracking-[.16em] text-[#f2b35d]/80">SELECT A CONSOLE TO BEGIN</p>
        </footer>
      </div>

      {station && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#020814]/90 p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={station.name}>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[#49d7ff]/40 bg-[linear-gradient(140deg,#112d40,#061322_70%)] p-5 shadow-[0_0_80px_#49d7ff1b] sm:p-9">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#49d7ff]/60 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[.25em] text-[#79e7ff]">{station.serial}</p>
                <h2 className="mt-3 font-display text-xl tracking-[.12em] sm:text-3xl">{station.title}</h2>
                <p className="mt-2 text-xs tracking-[.15em] text-[#f2b35d]">{station.name}</p>
              </div>
              <button ref={closeRef} type="button" onClick={closeStation} className="rounded-full border border-[#49d7ff]/35 p-2 hover:bg-[#49d7ff]/10 focus-visible:outline-2 focus-visible:outline-[#49d7ff]" aria-label="Close station"><X className="size-5" /></button>
            </div>
            <div className="my-6 h-px bg-gradient-to-r from-[#49d7ff]/60 to-transparent" />
            <div className="flex items-start gap-4">
              {active === 'telemetry' ? <BatteryCharging className="mt-1 shrink-0 text-[#71ddff]" /> : active === 'signals' ? <RadioTower className="mt-1 shrink-0 text-[#71ddff]" /> : active === 'evidence' ? <FileSearch className="mt-1 shrink-0 text-[#f2b35d]" /> : <ScanEye className="mt-1 shrink-0 text-[#71ddff]" />}
              <div>
                <p className="text-sm leading-7 text-[#e5f3ff]">{station.detail}</p>
                <p className="mt-4 text-sm leading-6 text-[#a1cedd]">{station.objective}</p>
              </div>
            </div>
            {active !== 'briefing' && (
              <p className="mt-6 rounded-lg border border-[#f2b35d]/25 bg-[#f2b35d]/5 p-3 text-xs leading-relaxed text-[#ffe1a5]">
                Console preview only. The playable NASA data puzzles and evidence capture will be integrated in the next milestone.
              </p>
            )}
            <button type="button" onClick={closeStation} className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#49d7ff]/60 px-5 py-2.5 text-xs font-semibold tracking-[.1em] hover:bg-[#49d7ff]/10 focus-visible:outline-2 focus-visible:outline-[#49d7ff]">RETURN TO ROOM <ArrowRight className="size-4" /></button>
          </div>
        </div>
      )}
    </section>
  )
}
