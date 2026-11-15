'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { ArrowLeft, ArrowRight, BatteryCharging, FileSearch, RadioTower, ScanEye, X } from 'lucide-react'
import { useGameSettings } from './settings-provider'
import { DarkeningSkyPuzzle } from './darkening-sky-puzzle'

type StationId = 'briefing' | 'telemetry' | 'signals' | 'evidence'

type Point = readonly [number, number]

type Hotspot = {
  id: StationId
  label: string
  shape: Point[]
  anchor: Point
  amber?: boolean
}

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

const SCENE_W = 1920
const SCENE_H = 1080

const HOTSPOTS: Hotspot[] = [
  { id: 'briefing', label: 'MAIN DISPLAY', shape: [[702, 374], [1217, 374], [1218, 663], [700, 663]], anchor: [960, 689] },
  { id: 'telemetry', label: 'TELEMETRY', shape: [[159, 552], [480, 550], [533, 704], [649, 708], [646, 735], [398, 829], [208, 775], [159, 596]], anchor: [400, 856] },
  { id: 'signals', label: 'SIGNALS', shape: [[1440, 550], [1762, 552], [1779, 572], [1743, 699], [1790, 710], [1783, 735], [1729, 796], [1274, 736], [1273, 709], [1390, 700]], anchor: [1515, 820] },
  { id: 'evidence', label: 'EVIDENCE DESK', shape: [[657, 854], [1281, 854], [1413, 987], [520, 987]], anchor: [960, 832], amber: true },
]

const CAMERA_POSITIONS: Record<StationId, { label: string; shortLabel: string; zoom: number; x: number; y: number }> = {
  briefing: { label: 'MAIN DISPLAY', shortLabel: 'DISPLAY', zoom: 1.04, x: 0, y: 0 },
  telemetry: { label: 'TELEMETRY', shortLabel: 'TELEMETRY', zoom: 1.085, x: 3.5, y: 0 },
  signals: { label: 'SIGNALS', shortLabel: 'SIGNALS', zoom: 1.085, x: -3.5, y: 0 },
  evidence: { label: 'EVIDENCE DESK', shortLabel: 'EVIDENCE', zoom: 1.06, x: 0, y: -2 },
}

const CAMERA_ORDER: StationId[] = ['telemetry', 'briefing', 'signals', 'evidence']
const toPoints = (points: Point[]) => points.map(([x, y]) => `${x},${y}`).join(' ')

export function InvestigationScreen({ onBack }: { onBack: () => void }) {
  const { settings, play } = useGameSettings()
  const [active, setActive] = useState<StationId | null>(null)
  const [hot, setHot] = useState<StationId | null>(null)
  const [camera, setCamera] = useState<StationId>('briefing')
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<SVGElement | null>(null)
  const station = active ? STATIONS[active] : null
  const cameraPosition = CAMERA_POSITIONS[camera]
  const sceneStyle: CSSProperties = {
    transform: `translate3d(${cameraPosition.x}%, ${cameraPosition.y}%, 0) scale(${cameraPosition.zoom})`,
    transformOrigin: '50% 50%',
    transformBox: 'view-box',
    transition: settings.reducedMotion ? 'none' : 'transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1)',
  }

  useEffect(() => {
    if (active && active !== 'telemetry') closeRef.current?.focus()
  }, [active])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (active && event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        setActive(null)
        window.setTimeout(() => lastFocus.current?.focus(), 0)
        return
      }
      if (active || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
      const index = CAMERA_ORDER.indexOf(camera)
      const nextIndex = Math.max(0, Math.min(CAMERA_ORDER.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)))
      if (nextIndex !== index) setCamera(CAMERA_ORDER[nextIndex])
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [active, camera])

  const openStation = (id: StationId, target: SVGElement) => {
    lastFocus.current = target
    play('click')
    setActive(id)
  }

  const closeStation = () => {
    play('back')
    setActive(null)
    window.setTimeout(() => lastFocus.current?.focus(), 0)
  }

  const selectCamera = (id: StationId) => {
    if (id === camera) return
    play('click')
    setCamera(id)
  }

  const handleHotspotKey = (event: KeyboardEvent<SVGGElement>, id: StationId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openStation(id, event.currentTarget)
    }
  }

  return (
    <section className="@container fixed inset-0 z-30 isolate overflow-hidden bg-[#010409] text-[#eaf4ff]" aria-label="Opportunity Mission Control">
      <svg
        className="absolute inset-0 size-full"
        style={sceneStyle}
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMid slice"
        role="group"
        aria-label="Interactive Opportunity Mission Control room"
      >
        <image href="/images/opportunity-mission-control-final.webp" x="0" y="0" width={SCENE_W} height={SCENE_H} preserveAspectRatio="none" aria-hidden="true" />
        {HOTSPOTS.map((spot) => {
          const focused = hot === spot.id
          const color = spot.amber ? '#f2b35d' : '#49d7ff'
          const labelWidth = spot.label.length * 8 + 30
          return (
            <g
              key={spot.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${STATIONS[spot.id].name}`}
              aria-haspopup="dialog"
              aria-controls="station-dialog"
              onClick={(event) => openStation(spot.id, event.currentTarget)}
              onKeyDown={(event) => handleHotspotKey(event, spot.id)}
              onPointerEnter={() => setHot(spot.id)}
              onPointerLeave={() => setHot((current) => current === spot.id ? null : current)}
              onFocus={() => setHot(spot.id)}
              onBlur={() => setHot((current) => current === spot.id ? null : current)}
              className="cursor-pointer outline-none"
            >
              <polygon points={toPoints(spot.shape)} fill="#ffffff" fillOpacity="0.001" />
              <polygon
                points={toPoints(spot.shape)}
                fill={color}
                fillOpacity={focused ? 0.035 : 0}
                stroke={color}
                strokeOpacity={focused ? 0.88 : 0}
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
              />
              {focused && (
                <g pointerEvents="none">
                  <rect
                    x={spot.anchor[0] - labelWidth / 2}
                    y={spot.anchor[1] - 18}
                    width={labelWidth}
                    height="36"
                    rx="18"
                    fill="#03111d"
                    fillOpacity="0.96"
                    stroke={color}
                    strokeOpacity="0.68"
                    strokeWidth="1"
                  />
                  <text
                    x={spot.anchor[0]}
                    y={spot.anchor[1] + 5}
                    textAnchor="middle"
                    fill={spot.amber ? '#ffe1a5' : '#d9f8ff'}
                    fontFamily="var(--font-exo), Arial, sans-serif"
                    fontSize="14"
                    fontWeight="700"
                    letterSpacing="1.1"
                  >
                    {spot.label}
                  </text>
                </g>
              )}
              <title>{`Open ${STATIONS[spot.id].name}`}</title>
            </g>
          )
        })}
      </svg>

      <header className="pointer-events-none absolute inset-x-[1.8%] top-[3%] z-20 flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => { play('back'); onBack() }}
          className="pointer-events-auto inline-flex items-center gap-[0.5cqw] rounded-full border border-[#49d7ff]/40 bg-[#040e18]/90 px-[1.1cqw] py-[0.55cqw] text-[max(10px,0.72cqw)] font-semibold tracking-[.1em] backdrop-blur-sm transition-colors hover:border-[#49d7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#49d7ff]"
        >
          <ArrowLeft aria-hidden className="size-[max(12px,0.9cqw)]" /> EXIT INVESTIGATION
        </button>
        <div className="rounded-md border border-[#49d7ff]/20 bg-[#030a12]/85 px-[1cqw] py-[0.5cqw] text-right backdrop-blur-sm">
          <p className="text-[max(8px,0.55cqw)] font-semibold tracking-[.25em] text-[#6cdffe]">OUTPOST M-07 · MISSION 01</p>
          <h1 className="mt-[0.2cqw] font-display text-[max(10px,1.05cqw)] leading-tight tracking-[.1em]">OPPORTUNITY / THE FINAL STORM</h1>
        </div>
      </header>

      <nav className="absolute left-1/2 top-[3%] z-20 flex -translate-x-1/2 items-center gap-[0.15cqw] rounded-full border border-[#49d7ff]/20 bg-[#030a12]/85 p-[0.25cqw] shadow-[0_8px_30px_#0008] backdrop-blur-sm" aria-label="Mission Control camera framing">
        {HOTSPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            aria-label={`Frame ${CAMERA_POSITIONS[spot.id].label}`}
            aria-pressed={camera === spot.id}
            onClick={() => selectCamera(spot.id)}
            className={`rounded-full px-[clamp(8px,0.85cqw,16px)] py-[clamp(7px,0.48cqw,10px)] text-[clamp(8px,0.58cqw,11px)] font-semibold tracking-[.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#49d7ff] ${camera === spot.id ? 'border border-[#49d7ff]/50 bg-[#49d7ff]/15 text-[#d9f8ff]' : 'border border-transparent text-[#9fc7d7] hover:text-white'}`}
          >
            {CAMERA_POSITIONS[spot.id].shortLabel}
          </button>
        ))}
      </nav>

      <footer className="pointer-events-none absolute inset-x-[1.8%] bottom-[2.4%] z-20 flex items-end justify-between gap-2">
        <p className="w-[38%] text-[max(8px,0.55cqw)] tracking-[.16em] text-[#70cbe0]/90">INVESTIGATION ACTIVE · NASA ARCHIVE</p>
        <p aria-live="polite" className="hidden text-center font-mono text-[max(8px,0.55cqw)] tracking-[.12em] text-[#a7eaff]/85 sm:block">FRAME: {cameraPosition.label}</p>
        <p className="w-[38%] text-right text-[max(8px,0.55cqw)] tracking-[.16em] text-[#f2b35d]/90">SELECT A CONSOLE TO BEGIN</p>
      </footer>

      {active === 'telemetry' && <DarkeningSkyPuzzle onClose={closeStation} />}

      {station && active !== 'telemetry' && (
        <div id="station-dialog" className="absolute inset-0 z-30 flex items-center justify-center bg-[#020814]/90 p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="station-title">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[#49d7ff]/40 bg-[linear-gradient(140deg,#112d40,#061322_70%)] p-5 shadow-[0_0_80px_#49d7ff1b] sm:p-9">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#49d7ff]/60 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[.25em] text-[#79e7ff]">{station.serial}</p>
                <h2 id="station-title" className="mt-3 font-display text-xl tracking-[.12em] sm:text-3xl">{station.title}</h2>
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
            <button type="button" onClick={closeStation} className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#49d7ff]/60 px-5 py-2.5 text-xs font-semibold tracking-[.1em] hover:bg-[#49d7ff]/10 focus-visible:outline-2 focus-visible:outline-[#49d7ff]">RETURN TO ROOM <ArrowRight aria-hidden className="size-4" /></button>
          </div>
        </div>
      )}
    </section>
  )
}
