'use client'

import { useState } from 'react'
import { INSIGHT_MARSQUAKE_STATS, INSIGHT_MARSQUAKE_MONTHS, INSIGHT_LARGEST_EVENTS, INSIGHT_RAD_GROUPS, INSIGHT_RAD_STATS } from './insight-observations'

export function InsightMeasurements() {
  const [showMagnitudes,setShowMagnitudes] = useState(false)
  const max = Math.max(...INSIGHT_MARSQUAKE_MONTHS.map(d => d.total))
  const w=860,h=235,pad=38
  const size=INSIGHT_MARSQUAKE_MONTHS.length
  const x=(index:number)=>pad+(index/(size-1))*(w-pad*2)
  const y=(value:number)=>h-pad-(value/max)*(h-pad*2)
  const path=INSIGHT_MARSQUAKE_MONTHS.map((d,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(showMagnitudes?d.withMagnitude:d.total).toFixed(1)).join(' ')
  return <div className="flex flex-col gap-4">
    <section className="rounded-2xl border border-hud/30 bg-[#061623] p-4">
      <h4 className="font-display text-lg tracking-wider text-ember">SEIS / MARSQUAKE CATALOGUE</h4>
      <p className="mt-1 text-xs text-frost/65">Supplied EarthScope export · {INSIGHT_MARSQUAKE_STATS.from} — {INSIGHT_MARSQUAKE_STATS.to}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <p className="rounded-xl border border-hud/20 p-3"><span className="block text-xs text-frost/60">Catalogue event rows</span><strong className="font-mono text-xl text-hud">{INSIGHT_MARSQUAKE_STATS.count.toLocaleString()}</strong></p>
        <p className="rounded-xl border border-hud/20 p-3"><span className="block text-xs text-frost/60">Rows with magnitude</span><strong className="font-mono text-xl text-hud">{INSIGHT_MARSQUAKE_STATS.withMagnitude.toLocaleString()}</strong></p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" aria-pressed={!showMagnitudes} onClick={()=>setShowMagnitudes(false)} className={'rounded-full border px-3 py-2 text-xs '+(!showMagnitudes?'border-hud bg-hud/10 text-hud':'border-hud/30 text-frost/65')}>All recorded events</button>
        <button type="button" aria-pressed={showMagnitudes} onClick={()=>setShowMagnitudes(true)} className={'rounded-full border px-3 py-2 text-xs '+(showMagnitudes?'border-hud bg-hud/10 text-hud':'border-hud/30 text-frost/65')}>With magnitude</button>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-hud/20 bg-[#030e17] p-2">
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Monthly count of InSight catalogue events, including automatically detected rows; no events are inferred for omitted months." className="w-full">
          {[0,0.25,0.5,0.75,1].map(n=><g key={n}><line x1={pad} x2={w-pad} y1={y(max*n)} y2={y(max*n)} stroke="#477384" opacity=".35" strokeDasharray="3 5"/><text x={pad-7} y={y(max*n)+4} textAnchor="end" fill="#91b9c6" fontSize="12">{Math.round(max*n)}</text></g>)}
          <path d={path} fill="none" stroke="#54d9ed" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/>
          <text x={pad} y={h-9} fill="#91b9c6" fontSize="12">2019</text><text x={w/2} y={h-9} textAnchor="middle" fill="#91b9c6" fontSize="12">2020–2021</text><text x={w-pad} y={h-9} textAnchor="end" fill="#91b9c6" fontSize="12">2022</text>
        </svg>
      </div>
      <p className="mt-3 text-xs leading-5 text-frost/60">Monthly records are plotted from the supplied catalogue; the export includes automatic detections, and not every event has a magnitude estimate. Missing months are not filled with invented observations.</p>
      <div className="mt-3 grid gap-2">
        <p className="text-xs font-semibold tracking-wider text-hud">LARGEST REPORTED MAGNITUDES</p>
        {INSIGHT_LARGEST_EVENTS.map(e=><p key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-hud/20 p-3 text-xs"><span className="font-mono text-ember">{e.id} · M{e.magnitude}</span><span className="text-frost/75">{e.time.slice(0,10)} · {e.location}</span></p>)}
      </div>
    </section>
    <section className="rounded-2xl border border-hud/30 bg-[#061623] p-4">
      <h4 className="font-display text-lg tracking-wider text-ember">HP³ / RADIOMETER MEASUREMENTS</h4>
      <p className="mt-1 text-xs leading-5 text-frost/65">{INSIGHT_RAD_STATS.count} calibrated observations · {INSIGHT_RAD_STATS.period} · Sol 983, 991 and 998</p>
      <p className="mt-3 text-xs text-frost/60">Mean brightness temperature (Kelvin) from calibrated RAD XML columns `TB Sensor 1A` and `TB Sensor 2A`; values grouped by Sol and early/later local time.</p>
      <div className="mt-3 flex flex-col gap-3">
        {INSIGHT_RAD_GROUPS.map(r=><div key={r.sol+'-'+r.period} className="rounded-xl border border-hud/20 bg-midnight/30 p-3">
          <p className="mb-2 text-xs text-frost/75">Sol {r.sol} · {r.period} · {r.observations} readings</p>
          {[{label:'Sensor 1A',value:r.sensor1A},{label:'Sensor 2A',value:r.sensor2A}].map(s=><div key={s.label} className="mb-1 grid grid-cols-[70px_1fr_65px] items-center gap-2 text-[11px]"><span className="text-frost/65">{s.label}</span><div className="h-2 overflow-hidden rounded-full bg-hud/10"><div className="h-full rounded-full bg-hud" style={{width:(s.value/300*100)+'%'}}/></div><span className="text-right font-mono text-hud">{s.value.toFixed(1)} K</span></div>)}
        </div>)}
      </div>
      <p className="mt-3 text-xs leading-5 text-frost/60">This chart shows brightness temperatures derived from the uploaded RAD calibrated product, not ambient air temperature, deep subsurface temperature, or continuous time-series readings.</p>
    </section>
  </div>
}
