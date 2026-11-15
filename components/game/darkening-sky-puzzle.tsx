'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, LockKeyhole, ScanSearch, X } from 'lucide-react'
import { OPPORTUNITY_TAU_FINAL } from './archives/opportunity-tau-data'

const SAVE_KEY = 'last-signal.opportunity.evidence-01.v1'
const TASKS = ['INSPECT THE STORM', 'FIND THE MISSING DATA', 'CHECK SOLAR POWER', 'RECONSTRUCT THE CHAIN'] as const
const CAUSES = ['Reduced sunlight', 'Increased dust opacity', 'Reduced solar power']
const CORRECT_CHAIN = ['Increased dust opacity', 'Reduced sunlight', 'Reduced solar power']
type Observation = (typeof OPPORTUNITY_TAU_FINAL)[number]
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
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [sourceOpen, setSourceOpen] = useState(false)
  const [seenGraphic, setSeenGraphic] = useState(false)
  const [chain, setChain] = useState(CAUSES)
  const [collected, setCollected] = useState(false)
  useEffect(() => { setCollected(readSaved()) }, [])
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose() }
    }
    window.addEventListener('keydown', onEscape, true)
    return () => window.removeEventListener('keydown', onEscape, true)
  }, [onClose])
  const changeStage = (next: Stage) => { setFeedback(''); setStage(next) }
  const moveCard = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= chain.length) return
    const copy = chain.slice()
    const item = copy[index]
    copy[index] = copy[target]
    copy[target] = item
    setChain(copy)
    setFeedback('')
  }
  const finish = () => {
    if (!chain.every((item, i) => item === CORRECT_CHAIN[i])) {
      setFeedback('Check the causal order: what blocks the sunlight first?')
      return
    }
    try { window.localStorage.setItem(SAVE_KEY, 'collected') } catch { /* session still completes */ }
    setCollected(true)
    setFeedback('Evidence 01 captured — The Darkening Sky')
  }
  return (
    <section className="fixed inset-0 z-50 overflow-y-auto bg-[#020814] text-slate-100" role="dialog" aria-modal="true" aria-label="The Darkening Sky investigation">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-cyan-400/20 pb-5">
          <div>
            <p className="text-xs tracking-[.25em] text-cyan-400">MER-B / TELEMETRY INVESTIGATION / NASA PDS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[.08em] sm:text-4xl">THE DARKENING SKY</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Reconstruct the last measured changes in Mars atmospheric opacity. Separate direct measurements from later published mission context.</p>
          </div>
          <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-full border border-cyan-300/40 px-4 py-2 text-xs hover:bg-cyan-300/10"><X size={16}/> RETURN TO ROOM</button>
        </header>
        <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Investigation progress">
          {TASKS.map((task, index) => (
            <div key={task} className={'rounded-xl border p-3 text-[10px] tracking-wider ' + (stage === index ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-slate-500')}>
              {index + 1}. {task}
            </div>
          ))}
        </nav>
        <div className="mt-6 flex-1">
          {stage === 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between gap-3">
                <h3 className="text-lg text-cyan-100">01 / Inspect the final readings</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRange('all')} className={'rounded-lg border px-3 py-2 text-xs ' + (range === 'all' ? 'border-cyan-300 text-cyan-200' : 'border-white/20')}>ALL SOLS</button>
                  <button type="button" onClick={() => setRange('storm')} className={'rounded-lg border px-3 py-2 text-xs ' + (range === 'storm' ? 'border-cyan-300 text-cyan-200' : 'border-white/20')}>FINAL SOLS</button>
                </div>
              </div>
              <TauPlot range={range} selected={selected} onSelect={setSelected}/>
              <details className="rounded-xl border border-white/15 p-4" open={sourceOpen} onToggle={e => setSourceOpen(e.currentTarget.open)}>
                <summary className="cursor-pointer text-sm text-cyan-200">SOURCE INSPECTOR — NASA PDS Pancam 880 nm</summary>
                <p className="mt-3 text-sm leading-6 text-slate-300">The measurements are imported directly from the project’s existing NASA PDS table extraction. Invalid readings were excluded in the source dataset. This series ends at Sol 5105.61; it contains no direct measurement at Sol 5111.</p>
                <a className="mt-3 inline-block text-xs text-cyan-300 underline" href="/data/opportunity/scientific/atmospheric-opacity/1tau880_5106_20181207a.tab" target="_blank" rel="noreferrer">Inspect the original PDS .tab file</a>
              </details>
              <button type="button" onClick={() => changeStage(1)} className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-bold tracking-wider text-slate-950">CONTINUE ANALYSIS <ChevronRight size={16} className="ml-2 inline"/></button>
            </div>
          )}
          {stage === 1 && (
            <div className="mx-auto max-w-3xl space-y-5">
              <h3 className="text-xl text-cyan-100">02 / What can the dataset actually prove?</h3>
              <p className="text-sm text-slate-300">Opportunity's last communication was on Sol 5111. Which statement is supported by the direct opacity measurements?</p>
              {[
                'Tau was measured as exactly 10.8 on Sol 5111 in this dataset.',
                'The last direct observation in this series is Sol 5105.61 (Tau 2.259); there is no direct Sol 5111 measurement.',
                'The rover continued returning opacity samples until February 2019.'
              ].map((option, i) => (
                <label key={option} className={'flex cursor-pointer gap-3 rounded-xl border p-4 text-sm ' + (answer === String(i) ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/20')}>
                  <input type="radio" name="tau-answer" value={i} checked={answer === String(i)} onChange={() => {setAnswer(String(i));setFeedback('')}}/>
                  {option}
                </label>
              ))}
              {feedback && <p role="status" className="text-amber-300">{feedback}</p>}
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => changeStage(0)} className="rounded-full border border-white/30 px-5 py-3 text-xs"><ArrowLeft size={14} className="mr-2 inline"/>REVIEW DATA</button>
                <button type="button" onClick={() => { if (answer === '1') changeStage(2); else setFeedback('Not supported. Revisit the last direct observation and the missing Sol 5111 reading.') }} className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-bold text-slate-950">VERIFY INTERPRETATION</button>
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
              <button type="button" onClick={() => setSeenGraphic(true)} className="rounded-full border border-cyan-300/50 px-4 py-3 text-xs text-cyan-200"><ScanSearch size={15} className="mr-2 inline"/>I INSPECTED THE NASA GRAPHIC</button>
              <p className="text-xs text-amber-200">Documented context and direct instrument measurements are separate evidence categories. Do not infer unmeasured rover values from this plot.</p>
              <button type="button" disabled={!seenGraphic} onClick={() => changeStage(3)} className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">RECONSTRUCT CAUSE AND EFFECT</button>
            </div>
          )}
          {stage === 3 && (
            <div className="mx-auto max-w-3xl space-y-5">
              <h3 className="text-xl text-cyan-100">04 / Reconstruct the evidence chain</h3>
              <p className="text-sm text-slate-300">Arrange these three findings into the most scientifically supported causal order. Use the arrow buttons to move each card.</p>
              {chain.map((item, i) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-cyan-400/25 bg-[#0a1c2c] p-3">
                  <span className="w-8 text-center font-mono text-amber-300">{i + 1}</span>
                  <span className="flex-1 text-sm">{item}</span>
                  <button type="button" disabled={i === 0} onClick={() => moveCard(i, -1)} className="rounded-lg border border-white/25 px-3 py-2 text-xs disabled:opacity-30" aria-label={'Move ' + item + ' earlier'}>↑</button>
                  <button type="button" disabled={i === 2} onClick={() => moveCard(i, 1)} className="rounded-lg border border-white/25 px-3 py-2 text-xs disabled:opacity-30" aria-label={'Move ' + item + ' later'}>↓</button>
                </div>
              ))}
              {feedback && <p role="status" className={collected ? 'text-cyan-200' : 'text-amber-300'}>{feedback}</p>}
              {collected ? (
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-5">
                  <CheckCircle2 className="mb-3 text-emerald-300"/>
                  <p className="font-semibold tracking-wider text-emerald-200">EVIDENCE 01 — THE DARKENING SKY</p>
                  <p className="mt-2 text-sm text-slate-300">Recorded in your Opportunity case file. The evidence persists when local browser storage is available.</p>
                  <button type="button" onClick={onClose} className="mt-5 rounded-full bg-cyan-300 px-5 py-3 text-xs font-bold text-slate-950">RETURN TO INVESTIGATION</button>
                </div>
              ) : (
                <button type="button" onClick={finish} className="rounded-full bg-amber-300 px-6 py-3 text-xs font-bold tracking-wider text-slate-950">CAPTURE EVIDENCE 01</button>
              )}
            </div>
          )}
        </div>
        <footer className="mt-8 flex items-center gap-2 border-t border-white/10 pt-4 text-[11px] text-slate-400">
          <LockKeyhole size={13}/> Historical data ≠ simulated rescue. <span className="ml-auto">MISSION 01 / OPPORTUNITY</span>
        </footer>
      </div>
    </section>
  )
}
