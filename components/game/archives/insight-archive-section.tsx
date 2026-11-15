'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Activity, ExternalLink, FileText, Camera, MapPin } from 'lucide-react'
import type { SectionId } from './scientific-archive'
import { InsightMeasurements } from './insight-measurements'

const NASA = 'https://science.nasa.gov/mission/insight/'
const PHOTOS = [
  { title: 'InSight First Selfie', date: '2018-12', id: 'PIA22876', image: '/nasa-data/insight/images/PIA22876.jpg', detail: 'Early mission panorama of the lander and deployed solar arrays on Mars.', source: 'https://science.nasa.gov/photojournal/insights-first-selfie/' },
  { title: 'Deployment Close-Up · Robotic Arm', date: '2019', id: 'PIA22977', image: '/nasa-data/insight/images/PIA22977.jpg', detail: 'Instrument handling and deployment operations recorded by InSight on the Martian surface.', source: 'https://science.nasa.gov/mission/insight/' },
  { title: 'Instrument Deployment on Mars', date: '2019', id: 'PIA23249', image: '/nasa-data/insight/images/PIA23249.jpg', detail: 'A close view of the robotic arm interacting with a scientific instrument on the ground.', source: 'https://science.nasa.gov/mission/insight/' },
  { title: 'InSight Final Selfie', date: '2022-04', id: 'PIA25287', image: '/nasa-data/insight/images/PIA25287.jpg', detail: 'Dust-coated lander and solar arrays near the end of the mission.', source: 'https://science.nasa.gov/photojournal/insights-final-selfie/' },
]
const EVENTS = [
  { date: '2018-05-05', title: 'Launch', detail: 'InSight launched aboard Atlas V from Vandenberg Air Force Base, California.', source: NASA },
  { date: '2018-11-26', title: 'Landing', detail: 'The stationary lander touched down at Elysium Planitia on Mars.', source: NASA },
  { date: '2018-12', title: 'Seismometer deployment', detail: 'The robotic arm positioned the SEIS instrument on the surface for seismic monitoring.', source: 'https://science.nasa.gov/mission/insight/science/' },
  { date: '2022-04-24', title: 'Final selfie', detail: 'A panorama documented substantial dust accumulation on InSight solar arrays.', source: 'https://science.nasa.gov/photojournal/insights-final-selfie/' },
  { date: '2022-12-15', title: 'Last contact', detail: 'The last communication from the spacecraft was recorded on December 15.', source: 'https://science.nasa.gov/blogs/insight/2022/12/19/nasa-insight-dec-19-2022/' },
  { date: '2022-12-21', title: 'Mission conclusion announced', detail: 'NASA announced that InSight had completed its mission after attempts to recontact the lander.', source: NASA },
]
const DATASETS = [
  { title: 'Marsquake Catalogue · V14', instrument: 'SEIS', detail: 'The supplied Marsquake export has been analyzed and monthly event counts are now displayed below.', source: 'https://service.earthscope.org/irisws/mars-event/1/', status: 'Derived chart imported · raw file awaiting upload' },
  { title: 'Calibrated surface radiometry', instrument: 'HP³ / RAD', detail: '138 calibrated radiometer measurements were inspected with their PDS4 XML label. Grouped brightness-temperature averages now appear below.', source: 'https://pds-geosciences.wustl.edu/missions/insight/hp3rad.htm', status: 'Derived chart imported · raw files awaiting upload' },
  { title: 'Subsurface temperature telemetry', instrument: 'HP³ / TEM', detail: 'Heat-flow instrument telemetry. The mole did not reach its originally planned depth; this is not a completed heat-flow profile.', source: 'https://pds-geosciences.wustl.edu/missions/insight/index.htm', status: 'Source indexed · data file pending' },
]
const EVIDENCE = [
  { id: 'insight-seis', title: 'Seismic station', desc: 'SEIS enabled the stationary lander to detect vibrations in Mars.', url: 'https://science.nasa.gov/mission/insight/science/' },
  { id: 'insight-hp3', title: 'Heat probe investigation', desc: 'HP³ attempted to measure heat transport through Martian subsurface materials.', url: 'https://science.nasa.gov/mission/insight/science/' },
  { id: 'insight-dust', title: 'Dust and power decline', desc: 'The final selfie documents dust on InSight’s solar arrays as available electrical power fell.', url: 'https://science.nasa.gov/photojournal/insights-final-selfie/' },
]
const KEY = 'last-signal:insight-evidence:v1'
function Source({href, children}:{href:string;children:React.ReactNode}) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-hud underline underline-offset-4 hover:text-white">{children}<ExternalLink size={12}/></a>
}
export function InsightArchiveSection({section}:{section:SectionId}) {
  const [active,setActive] = useState(0)
  const [missingImages,setMissingImages] = useState<string[]>([])
  const [collected,setCollected] = useState<string[]>([])
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem(KEY) ?? '[]'); if(Array.isArray(value)) setCollected(value.filter((v):v is string=>typeof v==='string' && EVIDENCE.some(e=>e.id===v)))}catch{/* storage unavailable */}},[])
  function collect(id:string){const next=collected.includes(id)?collected.filter(x=>x!==id):[...collected,id];setCollected(next);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{/* session only */}}
  return <div className="arc-swap flex flex-col gap-5 text-frost">
    <header className="border-b border-hud/20 pb-4">
      <p className="font-mono text-[10px] tracking-[.2em] text-ember">NASA / INSIGHT / OFFICIAL MISSION RECORD</p>
      <h3 className="mt-2 font-display text-2xl tracking-wider">INSIGHT · ELYSIUM PLANITIA</h3>
      <p className="mt-2 text-sm leading-6 text-frost/70">Stationary Mars lander · November 2018 – December 2022 · NASA/JPL-Caltech</p>
    </header>
    {section==='media' && <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl border border-hud/25 bg-midnight/60 p-5">
        <Camera className="text-hud" size={26}/>
        <h4 className="mt-3 font-display text-xl">{PHOTOS[active].title}</h4>
        <p className="mt-2 font-mono text-xs text-ember">{PHOTOS[active].id} · {PHOTOS[active].date}</p>
        <p className="mt-4 text-sm leading-7 text-frost/75">{PHOTOS[active].detail}</p>
        <div className="relative mt-5 aspect-video overflow-hidden rounded-xl border border-hud/20 bg-[#071c2c]">
          {!missingImages.includes(PHOTOS[active].id)
            ? <Image key={PHOTOS[active].image} src={PHOTOS[active].image} alt={PHOTOS[active].detail} fill unoptimized priority sizes="(min-width: 1024px) 720px, 90vw" className="object-contain" onError={()=>setMissingImages(previous=>previous.includes(PHOTOS[active].id)?previous:[...previous,PHOTOS[active].id])} />
            : <p className="flex h-full items-center justify-center p-4 text-center text-sm text-frost/65">The original NASA image is awaiting upload to the repository. Open its official source below.</p>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2"><Source href={PHOTOS[active].image}>Open local image directly</Source><Source href={PHOTOS[active].source}>View original NASA source</Source></div>
      </div>
      <div className="flex flex-col gap-2">
        {PHOTOS.map((p,i)=><button type="button" key={p.id} onClick={()=>setActive(i)} aria-pressed={active===i} className={'rounded-xl border p-4 text-left '+(active===i?'border-hud bg-hud/10':'border-hud/20 hover:border-hud/50')}>
          <span className="block font-semibold">{p.title}</span><span className="mt-2 block font-mono text-xs text-frost/50">{p.id} / {p.date}</span>
        </button>)}
      </div>
    </div>}
    {section==='signals' && <div className="grid gap-4 md:grid-cols-[1fr_1.25fr]">
      <div className="flex flex-col gap-2">{EVENTS.map((ev,i)=><button key={ev.title} type="button" aria-pressed={active===i} onClick={()=>setActive(i)} className={'rounded-xl border p-3 text-left '+(active===i?'border-hud bg-hud/10':'border-hud/20 hover:border-hud/50')}><span className="block font-mono text-xs text-ember">{ev.date}</span><span className="mt-1 block text-sm">{ev.title}</span></button>)}</div>
      <article className="rounded-2xl border border-hud/20 bg-midnight/60 p-5"><Activity className="text-hud" size={25}/><p className="mt-4 font-mono text-xs text-ember">{EVENTS[Math.min(active,EVENTS.length-1)].date}</p><h4 className="mt-3 font-display text-xl">{EVENTS[Math.min(active,EVENTS.length-1)].title}</h4><p className="mt-4 text-sm leading-7 text-frost/75">{EVENTS[Math.min(active,EVENTS.length-1)].detail}</p><div className="mt-4"><Source href={EVENTS[Math.min(active,EVENTS.length-1)].source}>Official NASA mission record</Source></div><p className="mt-4 text-xs text-frost/50">Documented timeline — not an original audio transmission.</p></article>
    </div>}
    {section==='notes' && <>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-hud/20 bg-midnight/50 p-4"><h4 className="font-semibold text-hud">SEIS · Seismic Experiment</h4><p className="mt-2 text-sm leading-6 text-frost/70">Seismometer measuring Mars vibrations and revealing details of the planet’s internal structure.</p></article>
        <article className="rounded-2xl border border-hud/20 bg-midnight/50 p-4"><h4 className="font-semibold text-hud">HP³ · Heat Flow Probe</h4><p className="mt-2 text-sm leading-6 text-frost/70">Heat-flow investigation; the mole’s penetration difficulties limited planned subsurface measurements.</p></article>
      </div>
      <InsightMeasurements />
      <h4 className="font-display text-lg tracking-wider text-ember">ORIGINAL SCIENTIFIC DATASETS</h4>
      {DATASETS.map(d=><article key={d.title} className="rounded-xl border border-hud/25 bg-midnight/50 p-4">
        <p className="font-mono text-xs text-hud">{d.instrument}</p><h5 className="mt-2 font-semibold">{d.title}</h5><p className="mt-2 text-sm leading-6 text-frost/70">{d.detail}</p><p className="mt-3 text-xs text-amber-200">{d.status}</p><div className="mt-3"><Source href={d.source}>Official science source</Source></div>
      </article>)}
      <div className="rounded-2xl border border-hud/30 bg-[#061623] p-5">
        <h4 className="font-display text-lg tracking-wider text-ember">EVIDENCE COLLECTION</h4>
        <p className="mt-2 text-xs leading-6 text-frost/65">Save scientifically grounded observations to a local InSight evidence collection. This does not claim the raw datasets have been loaded.</p>
        <p className="mt-3 font-mono text-sm text-hud">{collected.length} / {EVIDENCE.length} collected</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{EVIDENCE.map(e=><article key={e.id} className="rounded-xl border border-hud/20 p-4"><h5 className="font-semibold">{e.title}</h5><p className="mt-2 text-xs leading-6 text-frost/70">{e.desc}</p><div className="mt-3"><Source href={e.url}>View supporting source</Source></div><button type="button" onClick={()=>collect(e.id)} aria-pressed={collected.includes(e.id)} className="mt-3 rounded-full border border-hud/50 px-3 py-2 text-xs text-hud hover:bg-hud/10">{collected.includes(e.id)?'Collected · Remove':'Collect evidence'}</button></article>)}</div>
      </div>
    </>}
    {section==='traverse' && <div className="rounded-2xl border border-hud/25 bg-midnight/60 p-7">
      <MapPin className="text-hud" size={30}/><h4 className="mt-4 font-display text-2xl">Elysium Planitia</h4>
      <p className="mt-3 text-sm leading-7 text-frost/75">InSight was stationary after landing on 26 November 2018. It deployed instruments around the lander but never drove across Mars. This section records its landing-site environment and instrument operations, not a rover traverse.</p>
      <div className="mt-4"><Source href={NASA}>NASA mission overview</Source></div>
    </div>}
    <footer className="border-t border-hud/20 pt-4 text-xs text-frost/55"><FileText size={14} className="mr-2 inline"/>Public NASA mission facts are separated from PDS measurements that have not yet been uploaded. No simulated scientific readings are displayed.</footer>
  </div>
}
