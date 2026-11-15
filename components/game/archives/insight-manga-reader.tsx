'use client'

import { useEffect, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

const CHAPTERS = [
  { title: 'The Mission Begins', description: 'The journey to Mars, launch, approach and landing.', id: 'chapter-01' },
  { title: 'Listening to Mars', description: 'Arrival, SEIS deployment and the first seismic evidence.', id: 'chapter-02' },
  { title: 'The Heat of Mars', description: 'HP³ challenges, RISE, and discoveries about the deep interior.', id: 'chapter-03' },
  { title: 'The Final Signal', description: 'Dust, declining power and the mission’s legacy.', id: 'chapter-04' },
] as const
const CHAPTER_LENGTH = 5
const KEY = 'last-signal:insight-manga-progress:v1'
const IMAGE_ROOT = '/nasa-data/insight/manga'
const clamp = (value:number,min:number,max:number) => Math.min(max,Math.max(min,value))

export function InsightMangaReader() {
  const [index,setIndex] = useState(0)
  const [failed,setFailed] = useState<string[]>([])
  const [loaded,setLoaded] = useState(false)
  useEffect(()=>{
    try {
      const p = Number(localStorage.getItem(KEY))
      if(Number.isInteger(p) && p>=0 && p<CHAPTERS.length*CHAPTER_LENGTH) setIndex(p)
    } catch { /* browser storage is optional */ }
    setLoaded(true)
  },[])
  useEffect(()=>{
    if(!loaded) return
    try { localStorage.setItem(KEY,String(index)) } catch { /* session progress */ }
  },[index,loaded])
  const chapterIndex=Math.floor(index/CHAPTER_LENGTH)
  const pageIndex=index%CHAPTER_LENGTH
  const chapter=CHAPTERS[chapterIndex]
  const image=`${IMAGE_ROOT}/${chapter.id}/page-${String(pageIndex+1).padStart(2,'0')}.webp`
  function move(delta:number){setIndex(previous=>clamp(previous+delta,0,CHAPTERS.length*CHAPTER_LENGTH-1))}
  return <section aria-label="InSight English manga reader" className="rounded-2xl border border-hud/30 bg-[#061623] p-4 sm:p-5">
    <p className="font-mono text-[10px] tracking-[.2em] text-ember">INSIGHT / VISUAL STORY / ENGLISH</p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
      <div><h4 className="font-display text-xl tracking-wider text-frost">HEART OF MARS · MANGA</h4><p className="mt-1 text-xs text-frost/60">Four chapters · 20 pages · illustrated storytelling (not mission photography)</p></div>
      <BookOpen size={25} className="text-hud"/>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Choose a manga chapter">
      {CHAPTERS.map((ch,i)=><button key={ch.id} type="button" aria-pressed={chapterIndex===i}
        onClick={()=>setIndex(i*CHAPTER_LENGTH)}
        className={'rounded-xl border p-3 text-left text-xs transition-colors '+(chapterIndex===i?'border-hud bg-hud/15 text-hud':'border-hud/25 text-frost/70 hover:border-hud/60')}>
        <span className="block font-mono text-[10px] text-ember">CHAPTER {String(i+1).padStart(2,'0')}</span>
        <span className="mt-1 block font-semibold">{ch.title}</span>
      </button>)}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-frost/65">
      <span>{chapter.title} — Page {pageIndex+1} of {CHAPTER_LENGTH}</span>
      <span className="font-mono text-hud">{index+1} / {CHAPTERS.length*CHAPTER_LENGTH}</span>
    </div>
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-hud/15" aria-label="Reading progress">
      <div className="h-full bg-hud transition-all" style={{width:`${(index+1)/(CHAPTERS.length*CHAPTER_LENGTH)*100}%`}}/>
    </div>
    <div className="mt-4 flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border border-hud/20 bg-[#020a12] p-2">
      {failed.includes(image)
        ? <div role="alert" className="max-w-sm p-6 text-center text-sm leading-6 text-frost/70">Manga page not found in the deployed assets. Upload the 20 chapter images into <code className="text-hud">public/nasa-data/insight/manga/</code>.</div>
        : <img key={image} src={image} alt={`InSight English manga, chapter ${chapterIndex+1}, page ${pageIndex+1}`}
           className="max-h-[68vh] w-auto max-w-full object-contain" loading="eager"
           onError={()=>setFailed(prev=>prev.includes(image)?prev:[...prev,image])}/>}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <button type="button" disabled={index===0} onClick={()=>move(-1)} className="inline-flex items-center gap-1 rounded-full border border-hud/40 px-4 py-2 text-xs text-frost disabled:opacity-30"><ChevronLeft size={16}/> Previous</button>
      <a href={image} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-hud underline underline-offset-4"><Maximize2 size={13}/> Full size</a>
      <button type="button" disabled={index===CHAPTERS.length*CHAPTER_LENGTH-1} onClick={()=>move(1)} className="inline-flex items-center gap-1 rounded-full border border-hud/40 px-4 py-2 text-xs text-frost disabled:opacity-30">Next <ChevronRight size={16}/></button>
    </div>
    <p className="mt-4 text-xs leading-5 text-frost/50">Original illustrated chapter files provided by the project team. Artwork is narrative illustration, not an authentic NASA mission photograph or scientific measurement.</p>
  </section>
}
