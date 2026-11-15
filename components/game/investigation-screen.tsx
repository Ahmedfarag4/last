'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Battery, ClipboardList, RadioTower, ScanEye, X } from 'lucide-react'
import { useGameSettings } from './settings-provider'

type StationId = 'briefing' | 'telemetry' | 'signals' | 'evidence'

const STATIONS: { id: StationId; name: string; code: string; detail: string; objective: string }[] = [
  {
    id: 'briefing', name: 'Main Display', code: '01 / MISSION BRIEF',
    detail: 'Opportunity last communicated with Earth on June 10, 2018, during a planet-encircling dust storm.',
    objective: 'Reconstruct the final days of the mission using documented NASA records.',
  },
  {
    id: 'telemetry', name: 'Telemetry Console', code: '02 / ATMOSPHERIC DATA',
    detail: 'Investigate the atmospheric opacity (Tau) record and its gap before Sol 5111.',
    objective: 'The Darkening Sky — interactive data analysis is the next gameplay module.',
  },
  {
    id: 'signals', name: 'Signal Console', code: '03 / COMMUNICATIONS',
    detail: 'Explore the final transmission and the later recovery attempts as separate historical events.',
    objective: 'The Last Transmission — signal reconstruction is the next gameplay module.',
  },
  {
    id: 'evidence', name: 'Evidence Desk', code: '04 / CASE FILE',
    detail: 'Combine scientific and communications evidence to explain what is known and what remains uncertain.',
    objective: 'Evidence connections become available once investigation puzzles are implemented.',
  },
]

const PAN_LIMIT = 90

export function InvestigationScreen({ onBack }: { onBack: () => void }) {
  const { settings, play } = useGameSettings()
  const [active, setActive] = useState<StationId | null>(null)
  const [pan, setPan] = useState(0)
  const station = STATIONS.find((item) => item.id === active)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && active) {
        event.preventDefault()
        event.stopImmediatePropagation()
        setActive(null)
      }
      if (active) return
      if (event.key === 'ArrowLeft') setPan((value) => Math.max(-PAN_LIMIT, value - 15))
      if (event.key === 'ArrowRight') setPan((value) => Math.min(PAN_LIMIT, value + 15))
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [active])

  const openStation = (id: StationId) => {
    play('click')
    setActive(id)
  }

  const closeStation = () => {
    play('back')
    setActive(null)
  }

  return (
    <section className="fixed inset-0 z-30 overflow-hidden bg-[#040b16] text-[#e4f3fc]" aria-label="Opportunity Mission Control">
      {/* Original game environment constructed from CSS until final artwork is approved. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#1a4154_0%,#0c2034_32%,#050d1a_78%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent 0px,transparent 48px,#6fd6f51c 49px,#6fd6f51c 50px)' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[44%] bg-[linear-gradient(180deg,#050a14cc,transparent)]" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 py-4 sm:px-8">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-[#081a2b]/85 px-4 py-2 text-xs tracking-wider text-cyan-100 hover:border-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-200">
          <ArrowLeft size={14} /> Exit Investigation
        </button>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.3em] text-cyan-300/80">OUTPOST M-07 / MISSION 01</p>
          <p className="mt-1 text-xs font-semibold tracking-[0.15em]">OPPORTUNITY · THE FINAL STORM</p>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 top-[17%] mx-auto w-[min(92vw,1100px)]" aria-hidden="true">
        <div className="relative h-[48vh] min-h-[255px] overflow-hidden rounded-[46%_46%_10%_10%/22%_22%_8%_8%] border-x-[12px] border-t-[15px] border-[#1d3b51] bg-[linear-gradient(180deg,#0b192d_0%,#0b2031_60%,#142d3b_100%)] shadow-[inset_0_0_65px_#010913,0_0_75px_#173e51]">
          <div className="absolute inset-x-[7%] top-[9%] h-[53%] rounded-xl border-[5px] border-[#2c5064] bg-[#030b15] shadow-[0_0_35px_#1c759366,inset_0_0_30px_#225568]">
            <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_120%,#bd6240_0%,#502f36_27%,#132c44_64%,#061324_100%)]">
              <div className="absolute inset-x-0 bottom-0 h-[21%] bg-[linear-gradient(8deg,#6c3e34,#ae6045_49%,transparent_50%)]" />
              <div className="absolute left-[8%] top-[15%] h-px w-[30%] bg-cyan-200/40" />
              <div className="absolute right-[8%] top-[15%] text-[9px] tracking-[0.26em] text-cyan-200/60">MER-B // 2018</div>
              <div className="absolute inset-x-3 top-[40%] text-center text-[clamp(11px,2.2vw,24px)] font-semibold tracking-[0.28em] text-slate-100/90">SIGNAL LOST</div>
              <div className="absolute inset-x-0 top-[64%] text-center text-[9px] tracking-[0.18em] text-amber-200/80">LAST CONTACT · SOL 5111</div>
            </div>
          </div>
          <div className="absolute bottom-[9%] left-[9%] h-[18%] w-[24%] -skew-x-12 rounded-md border border-cyan-300/25 bg-[linear-gradient(135deg,#1f4a5c,#091b2c)]" />
          <div className="absolute bottom-[9%] right-[9%] h-[18%] w-[24%] skew-x-12 rounded-md border border-cyan-300/25 bg-[linear-gradient(135deg,#173b50,#071b2b)]" />
          <div className="absolute inset-x-[37%] bottom-[-14%] h-[31%] rounded-[35%] border border-amber-300/20 bg-[#0a1d2d]" />
        </div>
      </div>

      <div className="absolute inset-x-0 top-[17%] h-[48vh] min-h-[255px]" aria-label="Interactive stations">
        <button type="button" onClick={() => openStation('briefing')} className="group absolute left-[30%] top-[10%] h-[29%] w-[40%] rounded-xl border border-cyan-300/0 transition hover:border-cyan-300/80 hover:bg-cyan-300/10 focus-visible:border-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-200" aria-label="Open Main Display">
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-200/40 bg-[#051525]/90 px-3 py-1 text-[10px] tracking-widest opacity-70 group-hover:opacity-100">MAIN DISPLAY</span>
        </button>
        <button type="button" onClick={() => openStation('telemetry')} className="group absolute bottom-[9%] left-[8%] h-[23%] w-[27%] -skew-x-6 rounded-lg border border-cyan-300/0 hover:border-cyan-300/80 hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-cyan-200" aria-label="Open Telemetry Console">
          <span className="absolute -bottom-7 left-0 whitespace-nowrap rounded-full bg-[#051525]/90 px-2 py-1 text-[10px] tracking-wider text-cyan-100">TELEMETRY</span>
        </button>
        <button type="button" onClick={() => openStation('signals')} className="group absolute bottom-[9%] right-[8%] h-[23%] w-[27%] skew-x-6 rounded-lg border border-cyan-300/0 hover:border-cyan-300/80 hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-cyan-200" aria-label="Open Signal Console">
          <span className="absolute -bottom-7 right-0 whitespace-nowrap rounded-full bg-[#051525]/90 px-2 py-1 text-[10px] tracking-wider text-cyan-100">SIGNALS</span>
        </button>
        <button type="button" onClick={() => openStation('evidence')} className="group absolute bottom-[-18%] left-[36%] h-[26%] w-[28%] rounded-[50%] border border-amber-300/20 bg-[#132637]/80 hover:border-amber-300/80 hover:bg-amber-400/10 focus-visible:outline-2 focus-visible:outline-amber-200" aria-label="Open Evidence Desk">
          <ClipboardList className="mx-auto size-5 text-amber-200/75" />
          <span className="mt-1 block text-[10px] tracking-widest">EVIDENCE DESK</span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-4 z-10 flex flex-col items-center gap-3 px-4 text-center sm:bottom-7">
        <p className="max-w-xl text-xs leading-relaxed text-slate-200/75">Reconstruct Opportunity’s final days. Select a console to investigate the available records.</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPan((v) => Math.max(-PAN_LIMIT, v - 15))} className="rounded-full border border-cyan-200/30 bg-[#081b2c] p-2 hover:border-cyan-200" aria-label="Look left"><ArrowLeft size={15} /></button>
          <span className="min-w-24 text-[10px] tracking-wider text-cyan-200/75">VIEW {pan > 0 ? '+' : ''}{pan}° / ±90°</span>
          <button type="button" onClick={() => setPan((v) => Math.min(PAN_LIMIT, v + 15))} className="rounded-full border border-cyan-200/30 bg-[#081b2c] p-2 hover:border-cyan-200" aria-label="Look right"><ArrowRight size={15} /></button>
        </div>
        <p className="text-[10px] tracking-wider text-slate-400">PREVIEW ENVIRONMENT · FINAL ROOM ART & CAMERA PAN PENDING</p>
      </div>

      {station && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#020712]/90 p-4 backdrop-blur-lg" role="dialog" aria-modal="true" aria-label={station.name}>
          <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/40 bg-[linear-gradient(140deg,#11283b,#071322)] p-5 shadow-[0_0_75px_#144b6580] sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-cyan-300">{station.code}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-wide sm:text-3xl">{station.name}</h2>
              </div>
              <button type="button" onClick={closeStation} className="rounded-full border border-cyan-300/30 p-2 hover:border-cyan-300" aria-label="Close station"><X size={18} /></button>
            </div>
            <div className="my-7 h-px bg-gradient-to-r from-cyan-300/60 to-transparent" />
            <div className="flex items-start gap-4">
              {station.id === 'telemetry' ? <Battery className="shrink-0 text-cyan-300" /> : station.id === 'signals' ? <RadioTower className="shrink-0 text-cyan-300" /> : <ScanEye className="shrink-0 text-cyan-300" />}
              <div>
                <p className="text-sm leading-7 text-slate-100">{station.detail}</p>
                <p className="mt-4 text-sm leading-6 text-cyan-200/75">{station.objective}</p>
              </div>
            </div>
            {station.id !== 'briefing' && <p className="mt-8 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100/80">Interactive puzzle is not implemented in this first room milestone. No evidence can be collected here yet.</p>}
            <button type="button" onClick={closeStation} className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/60 px-5 py-2 text-xs font-semibold tracking-wider hover:bg-cyan-300/15">Return to Mission Control <ArrowRight size={14}/></button>
          </div>
        </div>
      )}
    </section>
  )
}
