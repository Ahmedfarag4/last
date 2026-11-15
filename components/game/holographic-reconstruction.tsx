'use client'

import { useEffect, useState } from 'react'
import { Check, CircleAlert, RotateCcw, SkipForward, Sun, Wind, Zap } from 'lucide-react'
import { useGameSettings } from './settings-provider'

type NodeId = 'dust' | 'sun' | 'power'
const ORDER: NodeId[] = ['dust', 'sun', 'power']
const NODES = {
  dust: { title: 'DUST OPACITY', icon: Wind, color: '#f3ad69', caption: 'Atmospheric haze thickens' },
  sun: { title: 'SUNLIGHT', icon: Sun, color: '#85d9f5', caption: 'Surface illumination falls' },
  power: { title: 'SOLAR POWER', icon: Zap, color: '#b9a9ff', caption: 'Array energy flow weakens' },
} as const
const PARTICLES = [
  ['7%', '19%'], ['13%', '73%'], ['21%', '37%'], ['28%', '86%'], ['34%', '12%'], ['39%', '63%'],
  ['47%', '24%'], ['53%', '82%'], ['61%', '15%'], ['67%', '70%'], ['73%', '35%'], ['79%', '88%'],
  ['87%', '21%'], ['93%', '58%'], ['17%', '52%'], ['31%', '28%'], ['70%', '51%'], ['84%', '77%'],
] as const

export function HolographicReconstruction({ onFile, alreadyCollected, onReturn }: {
  onFile: () => void
  alreadyCollected: boolean
  onReturn: () => void
}) {
  const { settings, play } = useGameSettings()
  const [sequence, setSequence] = useState<NodeId[]>([])
  const [hint, setHint] = useState('')
  const [skipAnimations, setSkipAnimations] = useState(false)
  const [coreFormed, setCoreFormed] = useState(false)
  const ready = sequence.length === ORDER.length
  const motionDisabled = settings.reducedMotion || skipAnimations

  useEffect(() => {
    if (!ready) {
      setCoreFormed(false)
      return
    }
    if (motionDisabled) {
      setCoreFormed(true)
      return
    }
    setCoreFormed(false)
    const timer = window.setTimeout(() => setCoreFormed(true), 1550)
    return () => window.clearTimeout(timer)
  }, [ready, motionDisabled])

  const choose = (node: NodeId) => {
    if (sequence.includes(node) || ready) return
    if (ORDER[sequence.length] !== node) {
      play('hover')
      setHint('That system is not synchronized yet. Recheck the available evidence and try again.')
      return
    }
    play('click')
    setSequence(current => [...current, node])
    setHint('')
  }

  const reset = () => {
    play('back')
    setSequence([])
    setHint('')
  }

  return (
    <section
      aria-label="Holographic evidence reconstruction"
      className={'holo-reconstruction relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#050b14] text-slate-100 ' + (motionDisabled ? 'holo-motion-disabled' : '') + (ready ? ' holo-core-preparing' : '')}
    >
      <div aria-hidden="true" className="holo-grid pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="holo-vignette pointer-events-none absolute inset-0" />

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-4 border-b border-cyan-200/10 bg-[#07111d]/75 px-5 py-3 backdrop-blur-md sm:px-8">
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[.26em] text-cyan-300/75 sm:text-[10px]">MER-B / OPPORTUNITY / CASE RECONSTRUCTION</p>
          <h2 className="mt-1 font-display text-sm tracking-[.08em] text-white sm:text-lg">THE DARKENING SKY</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-pressed={skipAnimations}
            onClick={() => setSkipAnimations(value => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 px-3 py-2 font-mono text-[9px] tracking-wider text-cyan-100/80 transition-colors hover:border-cyan-200/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:text-[10px]"
          >
            <SkipForward size={12} aria-hidden="true" />
            <span className="hidden sm:inline">{skipAnimations ? 'ANIMATIONS SKIPPED' : 'SKIP ANIMATIONS'}</span>
            <span className="sm:hidden">{skipAnimations ? 'SKIP ON' : 'SKIP FX'}</span>
          </button>
          <button
            type="button"
            onClick={onReturn}
            className="rounded-full border border-white/15 px-3 py-2 font-mono text-[9px] tracking-wider text-slate-300 transition-colors hover:border-amber-200/50 hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:text-[10px]"
          >
            RETURN TO ROOM
          </button>
        </div>
      </header>

      <main className={'holo-scene relative min-h-0 flex-1 overflow-hidden ' + (sequence.includes('sun') ? 'is-sun-dimmed ' : '') + (sequence.includes('power') ? 'is-power-reduced' : '')} aria-label="Interactive Mars reconstruction">
        <div className="holo-scanline pointer-events-none absolute inset-x-0 top-0 z-10" aria-hidden="true" />
        <div className="holo-stars pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className={'holo-particle-field pointer-events-none absolute inset-0 ' + (sequence.includes('dust') ? 'is-dust-active' : '')} aria-hidden="true">
          {PARTICLES.map(([left, top], index) => <span key={index} style={{ left, top, animationDelay: `${(index % 7) * -0.65}s` }} />)}
        </div>

        <svg className="holo-energy-map pointer-events-none absolute inset-0" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="dust-link" x1="0" x2="1"><stop stopColor="#eeb06e" stopOpacity=".04"/><stop offset="1" stopColor="#f4b878"/></linearGradient>
            <linearGradient id="sun-link" x1="1" x2="0"><stop stopColor="#7ddfff" stopOpacity=".04"/><stop offset="1" stopColor="#ffe4a6"/></linearGradient>
            <linearGradient id="power-link" x1="1" x2="0"><stop stopColor="#b7a3ff" stopOpacity=".04"/><stop offset="1" stopColor="#7be5ef"/></linearGradient>
          </defs>
          <path className={'holo-energy-line holo-line-dust ' + (sequence.includes('dust') ? 'is-linked' : '')} d="M 190 300 C 300 300 348 300 423 300" stroke="url(#dust-link)" />
          <path className={'holo-energy-line holo-line-sun ' + (sequence.includes('sun') ? 'is-linked' : '')} d="M 790 155 C 690 164 646 218 586 250" stroke="url(#sun-link)" />
          <path className={'holo-energy-line holo-line-power ' + (sequence.includes('power') ? 'is-linked' : '')} d="M 786 438 C 696 426 647 385 584 355" stroke="url(#power-link)" />
          <path className="holo-sunlight-beam" d="M 839 20 L 581 235 L 557 277 L 630 287 Z" />
        </svg>

        <div role="img" className={'holo-planet-system absolute left-1/2 top-[52%] ' + (sequence.includes('sun') ? 'is-darkened ' : '') + (sequence.includes('dust') ? 'is-hazed ' : '')} aria-label="Conceptual Mars atmosphere and surface reconstruction">
          <div className="holo-orbit holo-orbit-one" aria-hidden="true" />
          <div className="holo-orbit holo-orbit-two" aria-hidden="true" />
          <div className="holo-mars" aria-hidden="true">
            <div className="holo-mars-land" />
            <div className="holo-mars-crater holo-crater-one" />
            <div className="holo-mars-crater holo-crater-two" />
            <div className="holo-mars-crater holo-crater-three" />
            <div className="holo-mars-haze" />
            <div className="holo-mars-glint" />
          </div>
          <div className="holo-planet-label" aria-hidden="true">MARS / ATMOSPHERE</div>
        </div>

        <div className={'holo-solar-array pointer-events-none absolute ' + (sequence.includes('power') ? 'is-dimmed' : '')} aria-hidden="true">
          <div className="holo-array-frame"><span /><span /><span /><span /><span /><span /></div>
          <div className="holo-array-label">SOLAR ARRAY / CONCEPT</div>
        </div>
        <div className={'holo-power-stream pointer-events-none absolute ' + (sequence.includes('power') ? 'is-weakened' : '')} aria-hidden="true"><i /><i /><i /><i /></div>

        {ORDER.map((node, index) => {
          const item = NODES[node]
          const Icon = item.icon
          const linkedAt = sequence.indexOf(node)
          const linked = linkedAt !== -1
          return (
            <button
              key={node}
              type="button"
              data-node={node}
              aria-pressed={linked}
              aria-label={`${item.title}${linked ? `, connected as link ${linkedAt + 1}` : ', not yet connected'}`}
              disabled={linked || ready}
              onClick={() => choose(node)}
              className={'holo-node absolute z-20 ' + (linked ? 'is-linked' : '') + (ready ? ' is-converging' : '')}
              style={{ '--node-accent': item.color, '--node-order': index } as React.CSSProperties}
            >
              <span className="holo-node-orbit" aria-hidden="true" />
              <span className="holo-node-icon" aria-hidden="true">{linked ? <Check size={19} /> : <Icon size={19} />}</span>
              <span className="holo-node-copy">
                <span className="holo-node-title">{item.title}</span>
                <span className="holo-node-caption">{item.caption}</span>
              </span>
              {linked && <span className="holo-node-link">LINK 0{linkedAt + 1}</span>}
            </button>
          )
        })}

        <div className="holo-scene-readout absolute left-5 top-5 z-20 font-mono text-[9px] leading-5 tracking-[.12em] text-cyan-100/60 sm:left-8 sm:top-7">
          <p>RECONSTRUCTION MODE</p>
          <p className="text-amber-100/70">CONCEPTUAL / NOT DIRECT TELEMETRY</p>
        </div>

        <div className={'holo-evidence-core absolute left-1/2 top-[52%] z-30 ' + (coreFormed ? 'is-formed' : '')}>
          <span className="holo-core-aura" aria-hidden="true" />
          <button
            type="button"
            onClick={onFile}
            disabled={!coreFormed}
            aria-label="File Evidence 01, The Darkening Sky"
            className="holo-core-button"
          >
            <span className="holo-core-crystal" aria-hidden="true"><span /><span /><span /></span>
            <span className="holo-core-label">EVIDENCE 01</span>
            <span className="holo-core-title">THE DARKENING SKY</span>
            <span className="holo-core-action">{coreFormed ? 'SELECT CORE TO FILE' : 'FORMING EVIDENCE CORE'}</span>
          </button>
        </div>

        {hint && (
          <p role="status" className="holo-warning absolute bottom-5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap border-b border-amber-300/30 px-4 pb-2 font-mono text-[10px] tracking-wide text-amber-200 sm:bottom-7">
            <CircleAlert size={13} className="mr-2 inline-block" aria-hidden="true" />{hint}
          </p>
        )}
      </main>

      <footer className="relative z-20 flex shrink-0 flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-cyan-200/10 bg-[#07111d]/75 px-5 py-3 backdrop-blur-md sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5" aria-label={`${sequence.length} of 3 systems connected`}>
            {ORDER.map((node, index) => <span key={node} className={'holo-progress-mark ' + (sequence.includes(node) ? 'is-active' : '')} aria-hidden="true">0{index + 1}</span>)}
          </div>
          <p className="truncate font-mono text-[9px] tracking-[.09em] text-slate-300/70 sm:text-[10px]" aria-live="polite">
            {ready ? coreFormed ? 'SYSTEMS CONVERGED / CORE READY TO FILE' : 'ENERGY PATHS CONVERGING / EVIDENCE FORMING' : `CONNECT THE CAUSAL SEQUENCE / ${sequence.length} OF 3 LINKS`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden font-mono text-[9px] tracking-wider text-slate-400/65 md:block">VISUAL MODEL ONLY · NO SOL 5111 TAU READING</p>
          <button type="button" onClick={reset} disabled={!sequence.length} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 font-mono text-[9px] tracking-wider text-slate-300/80 transition-colors hover:border-cyan-200/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
            <RotateCcw size={12} aria-hidden="true" /> RESET
          </button>
        </div>
        {alreadyCollected && <span className="sr-only">Evidence 01 is already stored. This replay will not remove it.</span>}
      </footer>
    </section>
  )
}
