'use client'

import { useEffect, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

const CHAPTERS = [
  {title:'The Dream of Reaching the Moon',count:5},
  {title:'Preparing for the Impossible',count:5},
  {title:'The Journey to the Moon',count:3},
  {title:'Landing on Another World',count:6},
  {title:'Steps on the Moon',count:8},
  {title:'The Return to Earth',count:5},
  {title:'Beyond the First Step',count:5},
] as const
const TOTAL = CHAPTERS.reduce((sum,c)=>sum+c.count,0)
const ROOT = '/nasa-data/apollo/manga'
const KEY = 'last-signal:apollo-manga-progress:v1'
function startOf(chapter:number) {return CHAPTERS.slice(0,chapter).reduce((sum,c)=>sum+c.count,0)}
function activeChapter(index:number) {let n=0;for(let i=0;i<CHAPTERS.length;i++){n+=CHAPTERS[i].count;if(index<n)return i}return CHAPTERS.length-1}
const clamp=(n:number)=>Math.max(0,Math.min(TOTAL-1,n))

export function ApolloMangaReader({ initialPage = 1, onBack }: { initialPage?: number; onBack?: () => void }) {
  const [index,setIndex]=useState(()=>Math.max(0,Math.min(TOTAL-1,initialPage-1)))
  const [ready,setReady]=useState(false)
  const [failed,setFailed]=useState<string[]>([])
  useEffect(()=>{
    if(initialPage===1) {try {const saved=Number(localStorage.getItem(KEY));if(Number.isInteger(saved)&&saved>=0&&saved<TOTAL)setIndex(saved)}catch{/* optional */}}
    setReady(true)
  },[])
  useEffect(()=>{if(!ready)return;try{localStorage.setItem(KEY,String(index))}catch{/* optional */}},[index,ready])
  const ch=activeChapter(index)
  const chapterPage=index-startOf(ch)
  const src=`${ROOT}/chapter-${String(ch+1).padStart(2,'0')}/page-${String(chapterPage+1).padStart(2,'0')}.webp`
  const summarySrc=`${ROOT}/summary-en.webp`
  return <section className="rounded-2xl border border-hud/30 bg-[#061623] p-4 sm:p-5" aria-label="Apollo 11 English manga">
    {onBack && <button type="button" onClick={onBack} className="mb-3 inline-flex w-fit items-center gap-1 rounded-full border border-hud/40 px-4 py-2 text-xs text-frost hover:border-hud"><ChevronLeft size={16}/> Back to Manga Archive</button>}
    <p className="font-mono text-[10px] tracking-[.2em] text-ember">APOLLO 11 / VISUAL STORY / ENGLISH</p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h4 className="font-display text-xl tracking-wider text-frost">APOLLO 11 · MANGA</h4>
        <p className="mt-1 text-xs text-frost/60">Seven chapters · {TOTAL} pages · illustrated mission story</p>
      </div>
      <BookOpen size={25} className="text-hud"/>
    </div>
    <details className="mt-4 rounded-xl border border-hud/25 bg-[#03101b] p-3">
      <summary className="cursor-pointer text-sm font-semibold text-hud">View Apollo 11 · Illustrated Overview</summary>
      <a href={summarySrc} target="_blank" rel="noopener noreferrer" className="mt-3 block" aria-label="Open English Apollo 11 illustrated overview at full size">
        <img src={summarySrc} alt="Apollo 11 illustrated overview in English" loading="lazy" className="mx-auto max-h-[64vh] max-w-full rounded-lg object-contain" />
      </a>
    </details>
    <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4" role="group" aria-label="Choose a manga chapter">
      {CHAPTERS.map((chapter,i)=><button type="button" key={i} aria-pressed={ch===i} onClick={()=>setIndex(startOf(i))}
        className={'rounded-xl border p-3 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-hud '+(ch===i?'border-hud bg-hud/15 text-hud':'border-hud/25 text-frost/70 hover:border-hud/60')}>
        <span className="block font-mono text-[10px] text-ember">CHAPTER {String(i+1).padStart(2,'0')}</span>
        <span className="mt-1 block font-semibold">{chapter.title}</span>
        <span className="mt-1 block text-[10px] text-frost/50">{chapter.count} pages</span>
      </button>)}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-frost/70">
      <span>{CHAPTERS[ch].title} — Page {chapterPage+1} of {CHAPTERS[ch].count}</span>
      <span className="font-mono text-hud">{index+1} / {TOTAL}</span>
    </div>
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-hud/15" aria-label="Reading progress">
      <div className="h-full bg-hud transition-all" style={{width:`${(index+1)/TOTAL*100}%`}}/>
    </div>
    <div className="mt-4 flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border border-hud/20 bg-[#020a12] p-2">
      {failed.includes(src)
        ? <div role="alert" className="max-w-md p-6 text-center text-sm leading-6 text-frost/70">This manga page is not available on the deployed site yet. Upload the matching WebP images into <code className="text-hud">public/nasa-data/apollo/manga/</code>.</div>
        : <img key={src} src={src} alt={`Apollo 11 manga, chapter ${ch+1}, page ${chapterPage+1}`} loading="eager" className="max-h-[68vh] w-auto max-w-full object-contain" onError={()=>setFailed(prev=>prev.includes(src)?prev:[...prev,src])}/>}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <button type="button" disabled={index===0} onClick={()=>setIndex(n=>clamp(n-1))} className="inline-flex items-center gap-1 rounded-full border border-hud/40 px-4 py-2 text-xs text-frost disabled:opacity-30"><ChevronLeft size={16}/> Previous</button>
      <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-hud underline underline-offset-4"><Maximize2 size={13}/> Full size</a>
      <button type="button" disabled={index===TOTAL-1} onClick={()=>setIndex(n=>clamp(n+1))} className="inline-flex items-center gap-1 rounded-full border border-hud/40 px-4 py-2 text-xs text-frost disabled:opacity-30">Next <ChevronRight size={16}/></button>
    </div>
    <p className="mt-4 text-xs leading-5 text-frost/50">Project-provided manga illustrations; these are narrative artwork, not original NASA photographs or historical primary documents. The supplied PDF set has inconsistent printed page labels, so reader order follows the provided chapter material.</p>
  </section>
}
