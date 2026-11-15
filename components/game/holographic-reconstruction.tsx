'use client'

import { useState } from 'react'
import { Check, CircleDot, FileCheck2, RotateCcw, Sun, Wind, Zap } from 'lucide-react'

type NodeId = 'dust' | 'sun' | 'power'
const ORDER: NodeId[] = ['dust', 'sun', 'power']
const NODES = {
  dust: { title: 'DUST OPACITY', caption: 'The Martian atmosphere becomes more opaque.', icon: Wind, color: '#f4ad65' },
  sun: { title: 'SUNLIGHT', caption: 'Less sunlight reaches the surface.', icon: Sun, color: '#75d7f5' },
  power: { title: 'SOLAR POWER', caption: 'Solar-array generation is reduced.', icon: Zap, color: '#b8b5ff' },
} as const

export function HolographicReconstruction({ onFile, alreadyCollected, onReturn }: {
  onFile: () => void
  alreadyCollected: boolean
  onReturn: () => void
}) {
  const [sequence, setSequence] = useState<NodeId[]>([])
  const [hint, setHint] = useState('')
  const [ready, setReady] = useState(false)
  const selected = new Set(sequence)
  const choose = (node: NodeId) => {
    if (selected.has(node) || ready) return
    if (ORDER[sequence.length] !== node) {
      setHint(sequence.length === 0
        ? 'Start with the environmental change documented by the atmospheric measurements.'
        : 'Trace what happens immediately after the previous cause.')
      return
    }
    const next = [...sequence, node]
    setSequence(next)
    setHint('')
    if (next.length === ORDER.length) setReady(true)
  }
  const reset = () => { setSequence([]); setReady(false); setHint('') }
  return (
    <section aria-label="Holographic Evidence Reconstruction" className="relative isolate overflow-hidden rounded-[1.6rem] border border-cyan-300/25 bg-[#030b16] shadow-[inset_0_0_50px_#42d7ff10]">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{backgroundImage:'linear-gradient(#3cd7ff0b 1px,transparent 1px),linear-gradient(90deg,#3cd7ff0b 1px,transparent 1px)',backgroundSize:'30px 30px'}}/>
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 border-b border-cyan-300/15 px-5 py-5 sm:px-8">
        <div>
          <p className="font-mono text-[10px] tracking-[.27em] text-cyan-300">TELEMETRY / FORENSIC RECONSTRUCTION</p>
          <h3 className="mt-2 font-display text-xl tracking-[.08em] text-white sm:text-2xl">REBUILD THE POWER FAILURE CHAIN</h3>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-300">Activate the three holographic systems in causal order. Your investigation must connect real measurements to a supported physical explanation.</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 px-3 py-2 text-[11px] text-cyan-200 hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-cyan-300"><RotateCcw size={13}/> RESET</button>
      </div>

      <div className="relative min-h-[280px] overflow-hidden border-b border-cyan-300/15 bg-[radial-gradient(ellipse_at_50%_65%,#123246_0%,#081421_46%,#030a13_85%)] p-5 sm:min-h-[340px]">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[54%] size-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/25 bg-[radial-gradient(circle_at_30%_27%,#bc7849_0%,#a85a38_25%,#713f32_49%,#392d32_68%,#091421_74%)] opacity-65 shadow-[0_0_70px_#d3834d24] sm:size-[330px]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[54%] size-[264px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/25 shadow-[0_0_50px_#f3b56422] motion-safe:animate-pulse sm:size-[355px]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-[12%] top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="relative z-10 mx-auto grid max-w-4xl grid-cols-1 gap-3 pt-5 sm:grid-cols-3 sm:gap-5 sm:pt-24">
          {(['power', 'dust', 'sun'] as NodeId[]).map(node => {
            const item = NODES[node]
            const Icon = item.icon
            const order = sequence.indexOf(node)
            const done = order !== -1
            const enabled = !done && !ready
            return (
              <button key={node} type="button" onClick={() => choose(node)} disabled={!enabled}
                aria-label={item.title + (done ? ', linked as step ' + (order + 1) : ', unlinked')}
                className={"group relative flex min-h-20 items-center gap-4 rounded-xl border bg-[#061825]/90 p-4 text-left backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300 sm:min-h-[144px] sm:flex-col sm:justify-center sm:text-center " + (done ? 'border-emerald-300/75 shadow-[0_0_30px_#65e4ce38]' : 'border-cyan-300/35 hover:-translate-y-1 hover:border-amber-200/75 hover:shadow-[0_0_35px_#ffb75d28]') + (ready ? ' cursor-default' : '')}
                style={{ '--node-color': item.color } as React.CSSProperties}>
                <span className={"flex size-11 shrink-0 items-center justify-center rounded-full border " + (done ? 'border-emerald-300/80 bg-emerald-300/15' : 'border-cyan-300/40 bg-cyan-300/10')}>
                  {done ? <Check className="text-emerald-200" size={24}/> : <Icon className="text-cyan-100" size={24}/>}
                </span>
                <span>
                  <span className="block font-mono text-[10px] tracking-[.11em] text-white">{item.title}</span>
                  <span className="mt-1 block text-[11px] leading-5 text-slate-300">{item.caption}</span>
                </span>
                {done && <span className="absolute right-2 top-2 rounded bg-emerald-300/15 px-2 py-1 font-mono text-[10px] text-emerald-200">LINK {order + 1}</span>}
              </button>
            )
          })}
        </div>
        <div className="relative z-10 mx-auto mt-7 flex max-w-md items-center justify-center gap-2 text-[11px] font-mono tracking-wider text-cyan-100" aria-live="polite">
          {ORDER.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className={"rounded-full border px-3 py-1.5 " + (sequence[i] === step ? 'border-emerald-300/70 bg-emerald-300/15 text-emerald-100' : 'border-cyan-300/25 text-slate-400')}>
                {sequence[i] === step ? NODES[step].title : 'LINK ' + (i + 1)}
              </span>
              {i < 2 && <span className={sequence[i + 1] ? 'text-emerald-300' : 'text-cyan-400/50'}>→</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="relative grid items-center gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-8">
        <div aria-live="polite">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[.17em] text-cyan-200">
            <CircleDot size={15} className={ready ? 'text-emerald-300' : 'text-cyan-300'}/>
            {ready ? 'CAUSAL CONNECTION VERIFIED' : 'AWAITING SYSTEM LINK ' + (sequence.length + 1) + ' / 3'}
          </div>
          <p className={"mt-2 text-sm leading-6 " + (hint ? 'text-amber-200' : 'text-slate-400')}>
            {hint || (ready ? 'Rising atmospheric opacity → reduced sunlight → lower solar power. The exact Sol 5111 Tau value is not established by the direct PDS dataset.' : 'Select the system that starts the sequence. Connections will light up as the chain becomes valid.')}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">Visualization is a conceptual reconstruction, not a measured real-time power simulation.</p>
        </div>
        {ready ? (
          <button type="button" onClick={onFile} className="group flex items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-300 px-6 py-4 font-mono text-xs font-bold tracking-[.12em] text-[#091321] shadow-[0_0_35px_#ffba5670] hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
            <FileCheck2 size={20}/> FILE EVIDENCE CORE
          </button>
        ) : (
          <div className="flex items-center justify-end gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-[11px] font-mono text-slate-400">
            <span className="size-2 rounded-full bg-amber-300 motion-safe:animate-pulse"/> CORE LOCKED
          </div>
        )}
      </div>
      {alreadyCollected && (
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-emerald-300/25 bg-emerald-300/5 px-5 py-3 text-xs text-emerald-200 sm:px-8">
          <span>Evidence 01 is already stored in the Mission Control case file. Replay is optional.</span>
          <button type="button" onClick={onReturn} className="rounded-full border border-emerald-300/40 px-4 py-2 hover:bg-emerald-300/10">RETURN TO CASE FILE</button>
        </div>
      )}
    </section>
  )
}
