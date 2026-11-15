'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BatteryCharging, ClipboardList, FileSearch, RadioTower, ScanEye, X } from 'lucide-react'
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

const PAN_LIMIT = 45
const PAN_STEP = 15

export function InvestigationScreen({ onBack }: { onBack: () => void }) {
  const { settings, play } = useGameSettings()
  const [active, setActive] = useState<StationId | null>(null)
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

  const openStation = (id: StationId, event: React.MouseEvent<HTMLButtonElement>) => {
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

  return (
    <section className="fixed inset-0 z-30 isolate overflow-hidden bg-[#020814] text-[#eaf4ff]" aria-label="Opportunity Mission Control">
      {/* Entire investigation room is a fixed single-viewport scene; no dashboard-like scrolling. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_43%,#163851_0%,#081b2e_44%,#020814_83%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.13] [background-image:repeating-linear-gradient(0deg,transparent_0px,transparent_3px,#8cdef0_4px)]" />

      <div
        className={'absolute inset-0 origin-center ' + motion}
        style={{ transform: 'translate3d(' + (-pan * 1.7) + 'px,0,0) scale(1.12)' }}
        aria-hidden="true"
      >
        <div className="absolute inset-x-[-4%] top-[-5%] h-[26%] border-b-[10px] border-[#233a4e] bg-[linear-gradient(180deg,#01040a,#101f2e_65%,#17334a)] shadow-[0_18px_60px_#0009]" />
        <div className="absolute left-1/2 top-[11%] h-[7%] w-[58%] -translate-x-1/2 rounded-[100%] border-t-[5px] border-[#316076]/80 bg-[#061423] shadow-[0_0_30px_#49d7ff1f]" />
        <div className="absolute left-[-5%] top-[12%] h-[71%] w-[19%] -skew-x-6 border-r-[12px] border-[#243e53] bg-[linear-gradient(90deg,#020813,#0a2131)] shadow-[inset_-15px_0_35px_#000b]" />
        <div className="absolute right-[-5%] top-[12%] h-[71%] w-[19%] skew-x-6 border-l-[12px] border-[#243e53] bg-[linear-gradient(270deg,#020813,#0a2131)] shadow-[inset_15px_0_35px_#000b]" />
        <div className="absolute inset-x-[10%] top-[17%] h-[56%] rounded-[44%_44%_3%_3%/12%_12%_3%_3%] border-[10px] border-[#1e3d50] bg-[linear-gradient(180deg,#102b3e,#061522_82%)] shadow-[inset_0_0_90px_#010911,0_0_60px_#1a536431]" />
        <div className="absolute inset-x-[15%] top-[18%] h-[2px] bg-gradient-to-r from-transparent via-[#49d7ff]/35 to-transparent" />

        {/* Central situation display: original approved artistic rover render, clearly not telemetry. */}
        <div className="absolute left-[26%] right-[26%] top-[22%] h-[36%] overflow-hidden rounded-lg border-[5px] border-[#31566c] bg-[#08131f] shadow-[0_0_0_2px_#07111d,0_0_48px_#49d7ff24,inset_0_0_25px_#000]">
          <Image src="/images/archives/opportunity.png" alt="" fill priority sizes="65vw" className="object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040b17] via-[#020714]/30 to-[#020714]/45" />
          <div className="absolute left-[5%] top-[8%] flex items-center gap-2 font-mono text-[9px] tracking-[.18em] text-[#98eeff]">
            <span className="size-1.5 animate-pulse rounded-full bg-[#f2b35d] motion-reduce:animate-none" /> MER-B · ARCHIVE FEED
          </div>
          <div className="absolute right-[5%] top-[8%] font-mono text-[9px] text-[#b8d6e7]">SOL 5111</div>
          <div className="absolute inset-x-3 bottom-[13%] text-center">
            <p className="font-display text-[clamp(14px,2vw,28px)] font-semibold tracking-[.22em] text-[#f7e9d5] [text-shadow:0_3px_12px_#000]">SIGNAL LOST</p>
            <p className="mt-1 font-mono text-[clamp(8px,.8vw,11px)] tracking-[.14em] text-[#f2b35d]">LAST CONTACT · 10 JUN 2018</p>
          </div>
          <div className="absolute bottom-2 left-3 rounded border border-[#fff3] bg-[#020714]/70 px-2 py-0.5 text-[8px] tracking-[.1em] text-white/65">ARTISTIC RENDER</div>
        </div>

        {/* Angled physical control bays. Labels sit inside the devices rather than overlapping the wall. */}
        <div className="absolute left-[12%] top-[48%] h-[23%] w-[25%] -skew-y-6 rounded-xl border-[5px] border-[#294d62] bg-[linear-gradient(145deg,#0d3145,#03101d_68%)] shadow-[0_18px_28px_#000a,inset_0_0_25px_#2f849322]" />
        <div className="absolute right-[12%] top-[48%] h-[23%] w-[25%] skew-y-6 rounded-xl border-[5px] border-[#294d62] bg-[linear-gradient(210deg,#0d3145,#03101d_68%)] shadow-[0_18px_28px_#000a,inset_0_0_25px_#2f849322]" />
        <div className="absolute left-[15%] top-[53%] h-[11%] w-[20%] -skew-y-6 rounded border border-[#49d7ff]/30 bg-[repeating-linear-gradient(90deg,#08273a_0px,#08273a_13px,#174a5b_14px,#174a5b_15px)] opacity-70" />
        <div className="absolute right-[15%] top-[53%] h-[11%] w-[20%] skew-y-6 rounded border border-[#49d7ff]/30 bg-[repeating-linear-gradient(90deg,#08273a_0px,#08273a_13px,#174a5b_14px,#174a5b_15px)] opacity-70" />
        {/* Embedded diagnostic readouts: stylized, not presented as live NASA measurements. */}
        <div aria-hidden className="absolute left-[15.5%] top-[51.5%] h-[16%] w-[19%] -skew-y-6 overflow-hidden rounded border border-[#46cbed]/30 bg-[#03111e]/85 px-[5%] py-2 shadow-[inset_0_0_24px_#49d7ff24]">
          <div className="flex items-center justify-between border-b border-[#49d7ff]/20 pb-1 text-[clamp(6px,.65vw,10px)] tracking-[.14em] text-[#90eaff]">
            <span>ATMOSPHERIC SCAN</span><span className="text-[#f2b35d]">TAU</span>
          </div>
          <svg className="mt-2 h-[50%] w-full" viewBox="0 0 160 46" preserveAspectRatio="none" role="img" aria-label="Decorative rising dust trace">
            <path d="M0 10H160 M0 24H160 M0 38H160" stroke="#49d7ff" strokeOpacity=".14" />
            <path d="M1 37 L28 34 L50 30 L71 32 L92 24 L116 19 L140 9 L159 5" stroke="#65e2ff" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M1 37 L28 34 L50 30 L71 32 L92 24 L116 19 L140 9 L159 5 V46 H1 Z" fill="#49d7ff" fillOpacity=".10" />
          </svg>
          <p className="mt-1 font-mono text-[clamp(6px,.65vw,10px)] tracking-[.1em] text-[#b1ccda]">ARCHIVED DATA · PREVIEW</p>
        </div>
        <div aria-hidden className="absolute right-[15.5%] top-[51.5%] h-[16%] w-[19%] skew-y-6 overflow-hidden rounded border border-[#46cbed]/30 bg-[#03111e]/85 px-[5%] py-2 shadow-[inset_0_0_24px_#49d7ff24]">
          <div className="flex items-center justify-between border-b border-[#49d7ff]/20 pb-1 text-[clamp(6px,.65vw,10px)] tracking-[.14em] text-[#90eaff]">
            <span>COMMS ARRAY</span><span className="text-[#f2b35d]">OFFLINE</span>
          </div>
          <svg className="mt-2 h-[50%] w-full" viewBox="0 0 160 46" preserveAspectRatio="none" role="img" aria-label="Decorative signal trace">
            <path d="M0 23H160" stroke="#49d7ff" strokeOpacity=".25" strokeDasharray="3 5" />
            <path d="M0 23L18 23L25 14L31 32L38 8L45 37L54 23L75 23L80 19L85 27L91 23H160" stroke="#73dbf0" strokeWidth="1.8" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="mt-1 font-mono text-[clamp(6px,.65vw,10px)] tracking-[.1em] text-[#b1ccda]">LAST CONTACT · SOL 5111</p>
        </div>
        <div className="absolute inset-x-[-10%] bottom-[-22%] h-[52%] rounded-[50%_50%_0_0] border-t-[14px] border-[#1d394e] bg-[repeating-linear-gradient(90deg,#081321_0%,#081321_12%,#0d2434_12.3%,#081321_13%)] shadow-[0_-30px_60px_#010611]" />
        <div className="absolute left-[37%] top-[70%] h-[21%] w-[26%] rounded-[50%_50%_14%_14%] border-[7px] border-[#456273] bg-[radial-gradient(ellipse_at_50%_15%,#153e52,#061322_72%)] shadow-[0_-8px_35px_#f2b35d20,0_14px_50px_#000c]" />
        <div aria-hidden className="absolute left-[40%] top-[73%] h-[14%] w-[20%] overflow-hidden rounded-[45%_45%_13%_13%] border border-[#f2b35d]/25 bg-[linear-gradient(180deg,#2d4350,#091826)] shadow-[inset_0_8px_28px_#f2b35d11]">
          <div className="mx-auto mt-[8%] h-[45%] w-[75%] rounded-md border border-[#49d7ff]/30 bg-[#061521] p-2">
            <div className="flex items-center justify-between gap-1"><span className="h-1.5 w-1/3 bg-[#49d7ff]/40" /><span className="h-1.5 w-1/5 bg-[#f2b35d]/40" /></div>
            <div className="mt-1.5 h-px w-full bg-[#49d7ff]/25" />
            <div className="mt-1.5 h-px w-2/3 bg-[#49d7ff]/25" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[11%] h-px bg-gradient-to-r from-transparent via-[#f2b35d]/20 to-transparent" />
      </div>

      {/* Hit areas intentionally use the same percentage positioning as the visual consoles. */}
      <div className={"absolute inset-0 z-10 origin-center " + motion}
        style={{ transform: 'translate3d(' + (-pan * 1.7) + 'px,0,0) scale(1.12)' }}
        aria-label="Interactive room stations">
        <button type="button" onClick={(e) => openStation('briefing', e)}
          className="group absolute left-[28%] top-[26%] h-[29%] w-[44%] rounded-xl border border-transparent transition-colors hover:border-[#49d7ff]/70 hover:bg-[#49d7ff]/10 focus-visible:border-[#49d7ff] focus-visible:outline-2 focus-visible:outline-[#49d7ff]"
          aria-label="Open Main Display">
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-[#49d7ff]/60 bg-[#03121e]/90 px-3 py-1 text-[9px] font-semibold tracking-[.18em] text-[#c1f3ff] opacity-0 shadow-[0_0_16px_#49d7ff55] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">MAIN DISPLAY</span>
        </button>
        <button type="button" onClick={(e) => openStation('telemetry', e)}
          className="group absolute left-[10%] top-[53%] h-[20%] w-[27%] rounded-xl border border-transparent transition-colors hover:border-[#49d7ff]/70 hover:bg-[#49d7ff]/10 focus-visible:outline-2 focus-visible:outline-[#49d7ff]"
          aria-label="Open Telemetry Console">
          <span className="absolute bottom-1 left-3 inline-flex items-center gap-2 rounded-full border border-[#49d7ff]/35 bg-[#03121e]/90 px-3 py-1.5 text-[10px] font-semibold tracking-[.1em] text-[#cef5ff]"><BatteryCharging className="size-3.5" /> TELEMETRY</span>
        </button>
        <button type="button" onClick={(e) => openStation('signals', e)}
          className="group absolute right-[10%] top-[53%] h-[20%] w-[27%] rounded-xl border border-transparent transition-colors hover:border-[#49d7ff]/70 hover:bg-[#49d7ff]/10 focus-visible:outline-2 focus-visible:outline-[#49d7ff]"
          aria-label="Open Signal Console">
          <span className="absolute bottom-1 right-3 inline-flex items-center gap-2 rounded-full border border-[#49d7ff]/35 bg-[#03121e]/90 px-3 py-1.5 text-[10px] font-semibold tracking-[.1em] text-[#cef5ff]"><RadioTower className="size-3.5" /> SIGNALS</span>
        </button>
        <button type="button" onClick={(e) => openStation('evidence', e)}
          className="group absolute left-[37%] top-[76%] h-[13%] w-[26%] rounded-[50%] border border-transparent transition-colors hover:border-[#f2b35d]/60 hover:bg-[#f2b35d]/10 focus-visible:outline-2 focus-visible:outline-[#f2b35d]"
          aria-label="Open Evidence Desk">
          <span className="absolute left-1/2 top-[38%] inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#f2b35d]/50 bg-[#07131e]/90 px-3 py-1.5 text-[10px] font-semibold tracking-[.1em] text-[#ffe1a5]"><ClipboardList className="size-3.5" /> EVIDENCE DESK</span>
        </button>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 bg-gradient-to-b from-[#020814]/95 via-[#020814]/60 to-transparent px-4 pb-7 pt-4 sm:px-7">
        <button type="button" onClick={() => { play('back'); onBack() }}
          className="pointer-events-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-[#49d7ff]/40 bg-[#061b2b]/90 px-4 py-2 text-[11px] font-semibold tracking-[.09em] hover:border-[#49d7ff] focus-visible:outline-2 focus-visible:outline-[#49d7ff]">
          <ArrowLeft className="size-4" /> EXIT INVESTIGATION
        </button>
        <div className="max-w-[50%] rounded-lg border border-[#49d7ff]/15 bg-[#020814]/75 px-3 py-2 text-right backdrop-blur-sm">
          <p className="text-[9px] font-semibold tracking-[.25em] text-[#6cdffe]">OUTPOST M-07 · MISSION 01</p>
          <h1 className="mt-1 font-display text-[clamp(10px,1.15vw,14px)] leading-tight tracking-[.08em]">OPPORTUNITY <span className="hidden lg:inline">/ THE FINAL STORM</span></h1>
        </div>
      </header>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2 bg-gradient-to-t from-[#020814] via-[#020814]/90 to-transparent px-4 pb-4 pt-10 sm:px-7">
        <div className="hidden max-w-[30%] text-[9px] tracking-[.14em] text-[#70cbe0]/70 sm:block">INVESTIGATION ACTIVE · NASA ARCHIVE</div>
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[#49d7ff]/20 bg-[#03111e]/85 px-2 py-1">
          <button type="button" onClick={() => move(-1)} disabled={pan <= -PAN_LIMIT} aria-label="Look left" className="rounded-full border border-[#49d7ff]/35 p-2 hover:bg-[#49d7ff]/10 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[#49d7ff]"><ArrowLeft className="size-4" /></button>
          <span aria-live="polite" className="min-w-20 text-center font-mono text-[10px] text-[#a7eaff]">VIEW {pan > 0 ? '+' : ''}{pan}°</span>
          <button type="button" onClick={() => move(1)} disabled={pan >= PAN_LIMIT} aria-label="Look right" className="rounded-full border border-[#49d7ff]/35 p-2 hover:bg-[#49d7ff]/10 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[#49d7ff]"><ArrowRight className="size-4" /></button>
        </div>
        <div className="hidden max-w-[30%] text-right text-[9px] tracking-[.13em] text-[#f2b35d]/75 sm:block">SELECT A CONSOLE TO BEGIN</div>
      </footer>

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
