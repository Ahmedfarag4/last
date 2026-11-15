'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, FolderOpen, CheckCircle2 } from 'lucide-react'

type Folder = 'unfiled' | 'apollo11' | 'apollo12' | 'apollo15'
type Evidence = {
  id: string
  mission: Exclude<Folder, 'unfiled'>
  title: string
  detail: string
  source: string
  image?: string
  sourceUrl: string
}
const ITEMS: Evidence[] = [
  {
    id: 'a11-eagle-equipment', mission: 'apollo11', title: 'Eagle science equipment',
    detail: 'Apollo 11 photographs document equipment removed from the lunar module for surface experiments.',
    source: 'NASA / AS11-40-5927', image: '/apollo-11/images/AS11-40-5927.jfif',
    sourceUrl: 'https://eol.jsc.nasa.gov/SearchPhotos/photo.pl?mission=AS11&roll=40&frame=5927',
  },
  {
    id: 'a11-seismic', mission: 'apollo11', title: 'Passive seismic experiment',
    detail: 'The Apollo 11 surface package included an early passive seismic experiment. The photograph records deployment, not a measured seismic event.',
    source: 'NASA / AS11-40-5948', image: '/apollo-11/images/AS11-40-5948.jfif',
    sourceUrl: 'https://history.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11_eva_thumbs.html',
  },
  {
    id: 'a12-surveyor', mission: 'apollo12', title: 'Surveyor 3 recovery',
    detail: 'Apollo 12 landed near the earlier Surveyor 3 spacecraft; astronauts inspected it and retrieved hardware for examination on Earth.',
    source: 'NASA / GPN-2000-001316', image: '/nasa-data/apollo-12/images/GPN-2000-001316.jpg',
    sourceUrl: 'https://science.nasa.gov/resource/apollo-12-and-surveyor-3/',
  },
  {
    id: 'a12-solar-wind', mission: 'apollo12', title: 'Solar wind observations',
    detail: 'Hourly observations from the Apollo 12 ALSEP Solar Wind Spectrometer. This evidence refers to the measured dataset, not a synthetic signal.',
    source: 'NASA PDS / Apollo 12 SWS', sourceUrl: '/nasa-data/apollo-12/apollo12_sws_1hr_1969c9381.xml',
  },
]
const KEY = 'last-signal:apollo-evidence:v1'
const FOLDERS: { id: Folder; label: string }[] = [
  { id: 'unfiled', label: 'Unfiled' }, { id: 'apollo11', label: 'Apollo 11' },
  { id: 'apollo12', label: 'Apollo 12' }, { id: 'apollo15', label: 'Apollo 15' },
]
const EMPTY: Record<string, Folder> = {}

function sanitize(value: unknown): Record<string, Folder> {
  if (!value || typeof value !== 'object') return EMPTY
  const result: Record<string, Folder> = {}
  for (const item of ITEMS) {
    const folder = (value as Record<string, unknown>)[item.id]
    if (FOLDERS.some(f => f.id === folder)) result[item.id] = folder as Folder
  }
  return result
}

export function ApolloEvidenceBoard() {
  const [filing, setFiling] = useState<Record<string, Folder>>(EMPTY)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try { setFiling(sanitize(JSON.parse(localStorage.getItem(KEY) ?? '{}'))) } catch { setFiling(EMPTY) }
    setReady(true)
  }, [])
  function move(id: string, folder: Folder) {
    const next = { ...filing, [id]: folder }
    setFiling(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* in-memory session only */ }
  }
  const correct = (mission: Evidence['mission']) => ITEMS.filter(item => item.mission === mission && filing[item.id] === mission).length
  const total = (mission: Evidence['mission']) => ITEMS.filter(item => item.mission === mission).length
  const visible = ITEMS.filter(item => item.mission !== 'apollo15')
  return (
    <section className="rounded-2xl border border-hud/30 bg-[#061523]/80 p-4 sm:p-5" aria-labelledby="apollo-evidence-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[.2em] text-ember">MISSION INVESTIGATION / HISTORICAL EVIDENCE</p>
          <h4 id="apollo-evidence-title" className="mt-2 font-display text-xl tracking-wider text-frost">EVIDENCE BOARD</h4>
          <p className="mt-2 text-xs leading-6 text-frost/65">Review NASA evidence and place each record into a mission folder. Move records freely; there is no penalty or quiz.</p>
        </div>
        <FolderOpen className="shrink-0 text-hud" size={25}/>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3" aria-label="Evidence folder progress">
        {(['apollo11', 'apollo12', 'apollo15'] as const).map(m => (
          <div key={m} className="rounded-xl border border-hud/20 bg-midnight/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-frost">{m.replace('apollo','Apollo ')}</p>
            <p className="mt-1 font-mono text-sm text-hud">{ready ? correct(m) : 0} / {total(m)} filed</p>
            <div role="progressbar" aria-label={m + ' filed evidence'} aria-valuenow={ready ? correct(m) : 0} aria-valuemax={Math.max(1,total(m))} aria-valuemin={0} className="mt-2 h-1.5 overflow-hidden rounded-full bg-hud/15">
              <div className="h-full bg-hud transition-[width]" style={{width: `${total(m) ? (ready ? correct(m) : 0) / total(m) * 100 : 0}%`}} />
            </div>
            {total(m) === 0 && <p className="mt-1 text-[10px] text-frost/50">Evidence pending source review</p>}
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {visible.map(item => {
          const folder = filing[item.id] ?? 'unfiled'
          return (
            <article key={item.id} className="overflow-hidden rounded-xl border border-hud/20 bg-midnight/60">
              {item.image && <img src={item.image} alt={item.title} loading="lazy" className="h-36 w-full bg-[#03101b] object-contain" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-semibold text-frost">{item.title}</h5>
                  {ready && folder === item.mission && <CheckCircle2 aria-label="Filed in matching mission" className="shrink-0 text-hud" size={17}/>}
                </div>
                <p className="mt-2 text-xs leading-6 text-frost/70">{item.detail}</p>
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-hud underline underline-offset-4">{item.source}<ArrowUpRight size={12}/></a>
                <label htmlFor={'folder-'+item.id} className="mt-4 block text-[10px] font-semibold uppercase tracking-[.15em] text-frost/55">Store in mission folder</label>
                <select id={'folder-'+item.id} disabled={!ready} value={folder} onChange={e => move(item.id,e.target.value as Folder)}
                  className="mt-1.5 w-full rounded-lg border border-hud/40 bg-[#071b2b] px-3 py-2 text-sm text-frost focus-visible:outline-2 focus-visible:outline-hud">
                  {FOLDERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </article>
          )
        })}
      </div>
      <p className="mt-4 text-xs leading-6 text-frost/50">Folder placements are saved locally in this browser. Correct placement increases the displayed mission progress; misplaced records remain saved and can be moved. Apollo rescue gameplay is not yet implemented, so this board does not unlock a nonfunctional action.</p>
    </section>
  )
}
