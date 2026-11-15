'use client'
import { useState } from 'react'
import { Activity, Camera, ExternalLink, NotebookPen } from 'lucide-react'
import { APOLLO_ORDER, APOLLO_RECORDS, type ApolloId } from './apollo-archive-data'
import seismicSummary from './apollo11-seismic-summary.json'
import type { SectionId } from './scientific-archive'
import { SourceTag } from './archive-ui'
import { ApolloEvidenceBoard } from './apollo-evidence-board'
import { Apollo12SolarWindChart } from './apollo12-solar-wind-chart'
import { ApolloMangaReader } from './apollo-manga-reader'

export function ApolloArchiveSection({ section }: { section: SectionId }) {
  const [mission, setMission] = useState<ApolloId>('apollo11')
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageFailed, setImageFailed] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState(0)
  const data = APOLLO_RECORDS[mission]
  const switchMission = (id: ApolloId) => {
    setMission(id); setSelectedImage(0); setSelectedEvent(0)
  }
  const media = data.photos[selectedImage]
  return (
    <div className="arc-swap flex min-h-full flex-col gap-5 text-frost">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Select Apollo mission" className="flex flex-wrap gap-2">
          {APOLLO_ORDER.map(id => (
            <button key={id} type="button" onClick={() => switchMission(id)} aria-pressed={mission === id}
              className={'rounded-full border px-4 py-2 text-xs tracking-[.12em] transition-colors focus-visible:outline-2 focus-visible:outline-hud ' + (mission === id ? 'border-hud bg-hud/15 text-frost' : 'border-hud/25 text-frost/65 hover:border-hud/60')}>
              {APOLLO_RECORDS[id].label}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-wider text-ember">NASA · HISTORICAL RECORD</span>
      </div>
      <div className="flex flex-col gap-1 border-b border-hud/20 pb-4">
        <h3 className="font-display text-2xl tracking-[.08em]">{data.label} / {section === 'traverse' ? 'LUNAR EXPLORATION' : section === 'notes' ? 'FIELD NOTES' : section === 'signals' ? 'MISSION RECORDS' : 'MISSION MEDIA'}</h3>
        <p className="text-xs leading-6 text-frost/65">{data.vehicle} · {data.site} · Landing: {data.landing}</p>
      </div>

      {section === 'media' && mission === 'apollo11' && <ApolloMangaReader />}
      {section === 'media' && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <figure className="flex flex-col gap-3">
            <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-hud/30 bg-[#06111b]">
              {!imageFailed.includes(media.id)
                ? <img key={media.id} src={media.imageUrl} alt={media.description} onError={() => setImageFailed(prev=>[...prev,media.id])} className="max-h-[53vh] w-full object-contain" loading="lazy" />
                : <p role="status" className="p-8 text-center text-sm text-frost/70">Image server is unavailable. The official source can still be opened below.</p>}
            </div>
            <figcaption className="space-y-2">
              <p className="flex flex-wrap items-center gap-2 font-semibold"><span>{media.title}</span><SourceTag kind="history"/></p>
              <p className="text-sm text-frost/75">{media.description}</p>
              <p className="font-mono text-[10px] text-frost/50">{media.credit} · {media.archiveFile}</p>
              <a href={media.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-hud underline underline-offset-4">Open NASA image record <ExternalLink size={13}/></a>
            </figcaption>
          </figure>
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-wider text-hud">SOURCE PHOTOGRAPHS / {data.photos.length}</p>
            {data.photos.map((photo,i)=>(
              <button key={photo.id} type="button" aria-pressed={selectedImage===i} onClick={()=>setSelectedImage(i)}
                className={'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors '+(selectedImage===i?'border-hud bg-hud/10':'border-hud/15 hover:border-hud/50')}>
                <Camera className="shrink-0 text-hud" size={18}/>
                <span><span className="block text-sm">{photo.title}</span><span className="font-mono text-[10px] text-frost/50">{photo.id}</span></span>
              </button>
            ))}
            <p className="mt-3 text-xs leading-6 text-frost/50">Apollo 12 photos uploaded to this project load locally from the NASA data archive. Other historic images may load from linked NASA sources. Images with unverified capture details are labeled accordingly.</p>
          </div>
        </div>
      )}
      {section === 'signals' && (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <ol className="flex flex-col gap-2">
            {data.events.map((event,i)=>(
              <li key={i}>
                <button type="button" onClick={()=>setSelectedEvent(i)} aria-pressed={selectedEvent===i}
                  className={'w-full rounded-xl border p-4 text-left '+(selectedEvent===i?'border-hud bg-hud/10':'border-hud/15 hover:border-hud/40')}>
                  <span className="block font-mono text-xs text-ember">{event.date}</span><span className="mt-1 block text-sm">{event.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <article className="rounded-2xl border border-hud/25 bg-midnight/50 p-6">
            <Activity className="text-hud" size={25}/>
            <p className="mt-4 font-mono text-xs text-ember">{data.events[selectedEvent].date}</p>
            <h4 className="mt-3 font-display text-xl">{data.events[selectedEvent].title}</h4>
            <p className="mt-4 text-sm leading-7 text-frost/75">{data.events[selectedEvent].body}</p>
            <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs text-hud underline underline-offset-4">{data.sourceLabel}<ExternalLink size={13}/></a>
            <p className="mt-5 text-xs text-frost/45">Historical chronology, not a reconstructed original audio recording.</p>
          </article>
        </div>
      )}
      {section === 'notes' && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {data.notes.map(note=><article key={note.title} className="rounded-2xl border border-hud/20 bg-midnight/50 p-5"><NotebookPen size={20} className="text-hud"/><h4 className="mt-3 font-semibold">{note.title}</h4><p className="mt-3 text-sm leading-7 text-frost/70">{note.body}</p></article>)}
          </div>
          {mission === 'apollo11' && (
            <div className="rounded-2xl border border-hud/25 bg-midnight/60 p-5">
              <h4 className="font-display text-lg tracking-wider text-ember">PASSIVE SEISMIC / SOURCE SUMMARY</h4>
              <p className="mt-2 text-xs leading-6 text-frost/65">NASA PDS-derived July 21, 1969 channel statistics. Values are raw uncalibrated digital counts, not verified moonquake amplitudes.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {seismicSummary.channels.map(channel => (
                  <div key={channel.channel} className="rounded-xl border border-hud/20 bg-[#061623] p-4">
                    <p className="font-mono text-sm text-hud">{channel.channel}</p>
                    <p className="mt-3 font-mono text-lg text-frost">{channel.meanCounts.toFixed(3)}</p>
                    <p className="text-[10px] text-frost/55">Mean raw counts</p>
                    <p className="mt-3 text-xs text-frost/70">{channel.rows.toLocaleString('en-US')} records</p>
                    <p className="mt-1 text-xs text-amber-200">{channel.missingSamples.toLocaleString('en-US')} missing</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-frost/50">Instrument sampling: {seismicSummary.samplingRateHz} Hz. This is an aggregate metadata view; no artificial seismic waveform is drawn.</p>
            </div>
          )}
          <ApolloEvidenceBoard />
          {mission === 'apollo12' && <Apollo12SolarWindChart />}
          {mission === 'apollo12' && (
            <div className="rounded-2xl border border-hud/25 bg-midnight/60 p-5">
              <h4 className="font-display text-lg tracking-wider text-ember">APOLLO 12 / ORIGINAL DATA FILES</h4>
              <p className="mt-2 text-xs leading-6 text-frost/65">Solar Wind Spectrometer source files are preserved in the project. These are original records and label definitions, not yet a calibrated interactive chart.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/nasa-data/apollo-12/apollo12_sws_1hr_1969c9381.tab" download className="rounded-full border border-hud/50 px-4 py-2 text-xs text-hud hover:bg-hud/10">Download measurement table (.tab)</a>
                <a href="/nasa-data/apollo-12/apollo12_sws_1hr_1969c9381.xml" download className="rounded-full border border-hud/50 px-4 py-2 text-xs text-hud hover:bg-hud/10">Download PDS label (.xml)</a>
                <a href="/nasa-data/apollo-12/apollo12_metadata.json" target="_blank" rel="noopener noreferrer" className="rounded-full border border-hud/50 px-4 py-2 text-xs text-hud hover:bg-hud/10">Open mission metadata (.json)</a>
              </div>
            </div>
          )}
          <h4 className="font-display text-lg tracking-wider text-ember">ORIGINAL SCIENTIFIC DATASETS</h4>
          {data.science.map(item=>(
            <article key={item.originalFile} className="rounded-xl border border-hud/25 bg-midnight/50 p-5">
              <p className="text-xs font-semibold tracking-wide text-hud">{item.instrument}</p>
              <h5 className="mt-2 text-base">{item.dataset}</h5>
              <p className="mt-2 text-sm leading-7 text-frost/70">{item.description}</p>
              <p className="mt-3 font-mono text-[10px] text-amber-200">SOURCE FILE · {item.originalFile}</p>
              <p className="mt-3 text-xs text-frost/55">{item.caveat}</p>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-hud underline">View scientific archive</a>
            </article>
          ))}
        </div>
      )}
      {section === 'traverse' && (
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col justify-center rounded-2xl border border-hud/25 bg-[radial-gradient(ellipse_at_center,#1c2f3b,#081421_68%)] p-8">
            <span className="font-mono text-xs tracking-[.2em] text-ember">LUNAR LANDING SITE</span>
            <h4 className="mt-4 font-display text-2xl">{data.site}</h4>
            <p className="mt-4 text-sm leading-7 text-frost/75">{data.missionDescription}</p>
            <p className="mt-4 font-mono text-xs text-hud">Landing: {data.landing}</p>
            <p className="mt-4 text-xs text-frost/50">Georeferenced surface maps will be added only with verified NASA map assets.</p>
          </div>
          <div className="flex flex-col gap-3">
            {data.notes.map(note=><div key={note.title} className="rounded-xl border border-hud/15 bg-midnight/50 p-4"><p className="text-sm text-hud">{note.title}</p><p className="mt-2 text-xs leading-6 text-frost/75">{note.body}</p></div>)}
            <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-hud underline">{data.sourceLabel}<ExternalLink size={13}/></a>
          </div>
        </div>
      )}
    </div>
  )
}
