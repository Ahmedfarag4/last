'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useGameSettings } from './settings-provider'
import { OpportunityDossier } from './opportunity-dossier'
import type { DossierPageId } from './opportunity-dossier-pages'

type StationId = 'briefing' | 'telemetry' | 'signals' | 'evidence'

type Point = readonly [number, number]

type Hotspot = {
  id: StationId
  label: string
  shape: Point[]
  anchor: Point
  amber?: boolean
}

const STATION_NAMES: Record<StationId, string> = {
  briefing: 'MISSION OVERVIEW',
  telemetry: 'TELEMETRY',
  signals: 'SIGNAL LOGS',
  evidence: 'EVIDENCE INVENTORY',
}

const STATION_PAGES: Record<StationId, DossierPageId> = {
  briefing: 'overview',
  telemetry: 'telemetry',
  signals: 'signals',
  evidence: 'evidence',
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
  const [hot, setHot] = useState<StationId | null>(null)
  const [camera, setCamera] = useState<StationId>('briefing')
  const [dossierVisible, setDossierVisible] = useState(true)
  const [openRequest, setOpenRequest] = useState<{ page: DossierPageId; sequence: number }>({ page: 'overview', sequence: 0 })
  const lastFocus = useRef<SVGElement | null>(null)
  const cameraPosition = CAMERA_POSITIONS[camera]
  const sceneStyle: CSSProperties = {
    transform: `translate3d(${cameraPosition.x}%, ${cameraPosition.y}%, 0) scale(${cameraPosition.zoom})`,
    transformOrigin: '50% 50%',
    transformBox: 'view-box',
    transition: settings.reducedMotion ? 'none' : 'transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1)',
  }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (dossierVisible || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
      const index = CAMERA_ORDER.indexOf(camera)
      const nextIndex = Math.max(0, Math.min(CAMERA_ORDER.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)))
      if (nextIndex !== index) setCamera(CAMERA_ORDER[nextIndex])
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [dossierVisible, camera])

  const openStation = (id: StationId, target: SVGElement) => {
    lastFocus.current = target
    play('click')
    setOpenRequest((current) => ({ page: STATION_PAGES[id], sequence: current.sequence + 1 }))
    setDossierVisible(true)
  }

  const closeStation = () => {
    setDossierVisible(false)
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
              aria-label={`Open ${STATION_NAMES[spot.id]}`}
              aria-haspopup="dialog"
              aria-controls="opportunity-dossier"
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
              <title>{`Open ${STATION_NAMES[spot.id]}`}</title>
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

      <OpportunityDossier
        visible={dossierVisible}
        openRequest={openRequest}
        onClose={closeStation}
        onExit={() => { play('back'); onBack() }}
      />
    </section>
  )
}
