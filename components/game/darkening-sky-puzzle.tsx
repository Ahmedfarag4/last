'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, LockKeyhole, ScanSearch, X } from 'lucide-react'
import { OPPORTUNITY_TAU_FINAL } from './archives/opportunity-tau-data'
import { HolographicReconstruction } from './holographic-reconstruction'

const SAVE_KEY = 'last-signal.opportunity.evidence-01.v1'
const TASKS = ['INSPECT THE STORM', 'FIND THE MISSING DATA', 'CHECK SOLAR POWER', 'REBUILD THE EVIDENCE CORE'] as const
type Stage = 0 | 1 | 2 | 3

function readSaved() {
  try { return window.localStorage.getItem(SAVE_KEY) === 'collected' } catch { return false }
}

function TauPlot({ range, selected, onSelect }: {
  range: 'all' | 'storm'
  selected: number
  onSelect: (index: number) => void
}) {
  const observations = useMemo(() => OPPORTUNITY_TAU_FINAL.filter(p => range === 'all' || p.sol >= 5090), [range])
  const left = range === 'all' ? 5000 : 5090
  const right = 5111
  const plot = { x: 62, y: 20, width: 660, height: 210 }
  const x = (sol: number) => plot.x + (sol - left) / (right - left) * plot.width
  const y = (tau: number) => plot.y + plot.height - tau / 2.65 * plot.height
  const path = observations.map((p, i) => (i === 0 ? 'M ' : ' L ') + x(p.sol).toFixed(2) + ' ' + y(p.tau).toFixed(2)).join('')
  const value = OPPORTUNITY_TAU_FINAL[selected]
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-[#030c17] p-3">
      <svg viewBox="0 0 760 278" className="w-full" role="img" aria-label="Real NASA PDS atmospheric opacity measurements, ending at Sol 5105.61; no direct Sol 5111 observation">
        {[0, 0.5, 1, 1.5, 2, 2.5].map(tau => (
          <g key={tau}>
            <line x1={plot.x} y1={y(tau)} x2={plot.x + plot.width} y2={y(tau)} stroke="#284155" strokeDasharray="3 5"/>
            <text x="49" y={y(tau) + 4} textAnchor="end" fill="#91b3c8" fontSize="12">{tau.toFixed(1)}</text>
          </g>
        ))}
        {[left, Math.round((left + 5105) / 2), 5105, 5111].filter((v, i, a) => a.indexOf(v) === i).map(sol => (
          <text key={sol} x={x(sol)} y="253" fill="#91b3c8" fontSize="12" textAnchor="middle">{sol}</text>
        ))}
        <line x1={x(5105.61)} y1={plot.y} x2={x(5105.61)} y2={plot.y + plot.height} stroke="#f5b760" strokeDasharray="5 4"/>
        <path d={path} fill="none" stroke="#55d9ff" strokeWidth="2.5"/>
        {observations.map((p, i) => (
          <circle key={i} cx={x(p.sol)} cy={y(p.tau)} r="3" fill="#72edff"/>
        ))}
        <circle cx={x(value.sol)} cy={y(value.tau)} r="7" fill="#f5b760" stroke="#fff" strokeWidth="1.5"/>
        <text x={x(5105.61) - 6} y="12" fill="#f5b760" textAnchor="end" fontSize="12">LAST DIRECT READING</text>
        <text x={x(5111) - 3} y="267" fill="#f5b760" textAnchor="end" fontSize="11">LAST CONTACT</text>
        <text x="10" y="14" fill="#91b3c8" fontSize="12">TAU</text>
      </svg>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-[#112638] p-3 font-mono text-xs text-cyan-100">
          SELECTED — Sol {value.sol.toFixed(3)} · Tau {value.tau.toFixed(3)} ± {value.error.toFixed(3)}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => onSelect(Math.max(0, selected - 1))} className="rounded-lg border border-cyan-400/40 p-2" aria-label="Previous reading"><ChevronLeft size={17}/></button>
          <button type="button" onClick={() => onSelect(Math.min(OPPORTUNITY_TAU_FINAL.length - 1, selected + 1))} className="rounded-lg border border-cyan-400/40 p-2" aria-label="Next reading"><ChevronRight size={17}/></button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">Select individual observations with the Previous / Next controls. The line connects recorded samples for visual reading; points between samples are not additional measurements.</p>
    </div>
  )
}

export function DarkeningSkyPuzzle({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>(0)
  const [range, setRange] = useState<'all' | 'storm'>('storm')
  const [selected, setSelected] = useState(OPPORTUNITY_TAU_FINAL.length - 1)
  const [baselineFound, setBaselineFound] = useState(false)
  const [stormFound, setStormFound] = useState(false)
  const [gapChoice, setGapChoice] = useState<'measured' | 'missing' | null>(null)
  const [powerChoice, setPowerChoice] = useState<'higher' | 'lower' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [sourceOpen, setSourceOpen] = useState(false)
  const [seenGraphic, setSeenGraphic] = useState(false)
  const [collected, setCollected] = useState(false)
  useEffect(() => { setCollected(readSaved()) }, [])
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose() }
    }
    window.addEventListener('keydown', onEscape, true)
    return () => window.removeEventListener('keydown', onEscape, true)
  }, [onClose])
  const inspectReading = (index: number) => {
    setSelected(index)
    const sol = OPPORTUNITY_TAU_FINAL[index].sol
    if (sol >= 5090 && sol <= 5102) setBaselineFound(true)
    if (sol >= 5103) setStormFound(true)
  }
  const changeStage = (next: Stage) => { setFeedback(''); setStage(next) }
  const finish = () => {
    try { window.localStorage.setItem(SAVE_KEY, 'collected') } catch { /* gameplay still completes without persistent storage */ }
    setCollected(true)
    onClose()
  }

  return (
    <section className={'fixed inset-0 z-50 text-slate-100 ' + (stage === 3 ? 'overflow-hidden bg-[#020814]' : 'overflow-y-auto bg-[#020814]')} role="dialog" aria-modal="true" aria-label="The Darkening Sky investigation">
      <div className={stage === 3 ? 'flex h-[100dvh] min-h-[520px] w-full flex-col' : 'mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-8'}>
        <header className={(stage === 3 ? 'hidden ' : '') + 'flex flex-wrap items-start justify-between gap-3 border-b border-cyan-400/20 pb-5'}>
          <div>
            <p className="text-xs tracking-[.25em] text-cyan-400">MER-B / TELEMETRY INVESTIGATION / NASA PDS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[.08em] sm:text-4xl">THE DARKENING SKY</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Reconstruct the last measured changes in Mars atmospheric opacity. Separate direct measurements from later published mission context.</p>
          </div>
          <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-full border border-cyan-300/40 px-4 py-2 text-xs hover:bg-cyan-300/10"><X size={16}/> RETURN TO ROOM</button>
        </header>
        <nav className={(stage === 3 ? 'hidden ' : '') + 'mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4'} aria-label="Investigation progress">
          {TASKS.map((task, index) => (
            <div key={task} className={'rounded-xl border p-3 text-[10px] tracking-wider ' + (stage === index ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-slate-500')}>
              {index + 1}. {task}
            </div>
          ))}
        </nav>
        <div className={stage === 3 ? 'min-h-0 flex-1' : 'mt-6 flex-1'}>
          {stage === 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between gap-3">
                <h3 className="text-lg text-cyan-100">01 / Inspect the final readings</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRange('all')} className={'rounded-lg border px-3 py-2 text-xs ' + (range === 'all' ? 'border-cyan-300 text-cyan-200' : 'border-white/20')}>ALL SOLS</button>
                  <button type="button" onClick={() => setRange('storm')} className={'rounded-lg border px-3 py-2 text-xs ' + (range === 'storm' ? 'border-cyan-300 text-cyan-200' : 'border-white/20')}>FINAL SOLS</button>
                </div>
              </div>
              <TauPlot range={range} selected={selected} onSelect={inspectReading}/>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => inspectReading(OPPORTUNITY_TAU_FINAL.findIndex(p => p.sol >= 5096))} className={`rounded-xl border p-4 text-left transition-colors ${baselineFound ? 'border-emerald-300/60 bg-emerald-300/10' : 'border-amber-300/40 hover:bg-amber-300/10'}`}>
                  <span className="block text-[10px] tracking-[.2em] text-amber-200">SCAN 01 · BASELINE</span>
                  <span className="mt-2 block text-sm">{baselineFound ? 'Recorded — pre-storm baseline secured' : 'Inspect a reading before the abrupt rise'}</span>
                </button>
                <button type="button" onClick={() => inspectReading(OPPORTUNITY_TAU_FINAL.length - 1)} className={`rounded-xl border p-4 text-left transition-colors ${stormFound ? 'border-emerald-300/60 bg-emerald-300/10' : 'border-amber-300/40 hover:bg-amber-300/10'}`}>
                  <span className="block text-[10px] tracking-[.2em] text-amber-200">SCAN 02 · STORM</span>
                  <span className="mt-2 block text-sm">{stormFound ? 'Recorded — final direct reading secured' : 'Inspect the last available reading'}</span>
                </button>
              </div>
              <details className="rounded-xl border border-white/15 p-4" open={sourceOpen} onToggle={e => setSourceOpen(e.currentTarget.open)}>
                <summary className="cursor-pointer text-sm text-cyan-200">SOURCE INSPECTOR — NASA PDS Pancam 880 nm</summary>
                <p className="mt-3 text-sm leading-6 text-slate-300">The measurements are imported directly from the project’s existing NASA PDS table extraction. Invalid readings were excluded in the source dataset. This series ends at Sol 5105.61; it contains no direct measurement at Sol 5111.</p>
                <a className="mt-3 inline-block text-xs text-cyan-300 underline" href="/data/opportunity/scientific/atmospheric-opacity/1tau880_5106_20181207a.tab" target="_blank" rel="noreferrer">Inspect the original PDS .tab file</a>
              </details>
              <button type="button" disabled={!baselineFound || !stormFound} onClick={() => changeStage(1)} className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-bold tracking-wider text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">CONTINUE ANALYSIS <ChevronRight size={16} className="ml-2 inline"/></button>
            </div>
          )}
          {stage === 1 && (
            <div className="mx-auto max-w-4xl space-y-5">
              <p className="text-xs tracking-[.22em] text-amber-200">DATA FORENSICS / FIND THE BREAK</p>
              <h3 className="text-2xl text-cyan-100">When did direct measurements stop?</h3>
              <p className="text-sm leading-6 text-slate-300">The rover's last contact was Sol 5111. Your scanned dataset stops earlier. Decide whether a reading exists for the last-contact sol — do not confuse NASA's later published estimates with these instrument samples.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-cyan-300/25 bg-[#081a2b] p-5">
                  <p className="text-[11px] tracking-wider text-cyan-300">PDS LAST DIRECT OBSERVATION</p>
                  <p className="mt-3 font-mono text-2xl text-white">SOL 5105.610</p>
                  <p className="mt-2 font-mono text-lg text-amber-200">τ = 2.259 ± 0.049</p>
                </div>
                <div className="rounded-2xl border border-amber-300/30 bg-[#211b12] p-5">
                  <p className="text-[11px] tracking-wider text-amber-300">NASA LAST COMMUNICATION</p>
                  <p className="mt-3 font-mono text-2xl text-white">SOL 5111</p>
                  <p className="mt-2 text-sm text-amber-100">June 10, 2018</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-cyan-100">What does the gap between these two records mean?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" aria-pressed={gapChoice === 'measured'} onClick={() => {setGapChoice('measured');setFeedback('')}} className={`rounded-xl border p-4 text-left text-sm ${gapChoice === 'measured' ? 'border-amber-300 bg-amber-300/10' : 'border-white/20'}`}>The archive contains a direct Tau reading for Sol 5111.</button>
                <button type="button" aria-pressed={gapChoice === 'missing'} onClick={() => {setGapChoice('missing');setFeedback('')}} className={`rounded-xl border p-4 text-left text-sm ${gapChoice === 'missing' ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/20'}`}>This PDS series cannot establish the exact Tau at Sol 5111. The final direct reading is earlier.</button>
              </div>
              {feedback && <p role="status" className="text-amber-300">{feedback}</p>}
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => changeStage(0)} className="rounded-full border border-white/30 px-5 py-3 text-xs"><ArrowLeft size={14} className="mr-2 inline"/>REVIEW DATA</button>
                <button type="button" disabled={!gapChoice} onClick={() => gapChoice === 'missing' ? changeStage(2) : setFeedback('The PDS series has no Sol 5111 direct measurement. Compare the dates again.')} className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-bold text-slate-950 disabled:opacity-40">CONFIRM DATA GAP</button>
              </div>
            </div>
          )}
          {stage === 2 && (
            <div className="mx-auto max-w-4xl space-y-4">
              <h3 className="text-xl text-cyan-100">03 / Corroborate the solar power impact</h3>
              <p className="text-sm leading-6 text-slate-300">Study NASA's published Power vs Tau graphic. It is a separate published illustration, not a continuation of the direct Pancam opacity measurements.</p>
              <div className="relative aspect-[1.7] overflow-hidden rounded-xl border border-cyan-300/20 bg-slate-950">
                <Image src="/data/opportunity/scientific/power/Opportunity_Power_vs_Tau_2018.jpg" alt="NASA published Opportunity power versus atmospheric opacity graphic" fill sizes="(min-width: 768px) 800px, 95vw" className="object-contain"/>
              </div>
              <button type="button" onClick={() => setSeenGraphic(true)} className="rounded-full border border-cyan-300/50 px-4 py-3 text-xs text-cyan-200"><ScanSearch size={15} className="mr-2 inline"/>{seenGraphic ? 'PUBLISHED GRAPHIC EXAMINED' : 'EXAMINE PUBLISHED NASA GRAPHIC'}</button>
              <p className="text-sm text-slate-200">As dust opacity rises, what happens to available sunlight and solar power?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" aria-pressed={powerChoice === 'higher'} onClick={() => setPowerChoice('higher')} className={`rounded-xl border p-4 text-left text-sm ${powerChoice === 'higher' ? 'border-amber-300' : 'border-white/20'}`}>They increase because the dusty atmosphere amplifies sunlight.</button>
                <button type="button" aria-pressed={powerChoice === 'lower'} onClick={() => setPowerChoice('lower')} className={`rounded-xl border p-4 text-left text-sm ${powerChoice === 'lower' ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/20'}`}>They decrease as dust reduces the sunlight reaching the solar arrays.</button>
              </div>
              <p className="text-xs text-amber-200">Documented context and direct instrument measurements are separate evidence categories. Do not infer unmeasured rover values from this plot.</p>
              <button type="button" disabled={!seenGraphic || powerChoice !== 'lower'} onClick={() => changeStage(3)} className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">RECONSTRUCT CAUSE AND EFFECT</button>
            </div>
          )}
          {stage === 3 && (
            <HolographicReconstruction
              onFile={finish}
              alreadyCollected={collected}
              onReturn={onClose}
            />
          )}
        </div>
        <footer className={(stage === 3 ? 'hidden ' : '') + 'mt-8 flex items-center gap-2 border-t border-white/10 pt-4 text-[11px] text-slate-400'}>
          <LockKeyhole size={13}/> Historical data ≠ simulated rescue. <span className="ml-auto">MISSION 01 / OPPORTUNITY</span>
        </footer>
      </div>
    </section>
  )
}
