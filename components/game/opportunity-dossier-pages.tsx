'use client'

import Image from 'next/image'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ClipboardList, FileText, LockKeyhole, Radio, ScanEye, Stamp, Telescope } from 'lucide-react'
import { OPPORTUNITY_FACTS, OPPORTUNITY_OBJECTIVES, OPPORTUNITY_OVERVIEW, OPPORTUNITY_ROVER, SIGNAL_LOGS, TRAVERSE, TRAVERSE_DISTANCE, MEDIA } from './archives/archive-data'
import { OPPORTUNITY_TAU_FINAL } from './archives/opportunity-tau-data'

export const DOSSIER_PAGES = [
  { id: 'overview', label: 'Overview', heading: 'Mission overview', serial: '01 / BRIEFING' },
  { id: 'timeline', label: 'Timeline', heading: 'Traverse timeline', serial: '02 / FLIGHT LOG' },
  { id: 'telemetry', label: 'Telemetry', heading: 'Atmospheric readings', serial: '03 / SCIENCE RECORD' },
  { id: 'signals', label: 'Signal logs', heading: 'Communications record', serial: '04 / SIGNAL ARCHIVE' },
  { id: 'field-notes', label: 'Field notes', heading: 'Perseverance Valley', serial: '05 / PANCAM NOTES' },
  { id: 'evidence', label: 'Evidence', heading: 'Recovered evidence', serial: '06 / CASE MATERIAL' },
  { id: 'summary', label: 'Summary', heading: 'Investigation summary', serial: '07 / FINDINGS' },
] as const

export type DossierPageId = (typeof DOSSIER_PAGES)[number]['id']
export type CollectibleId = 'mission-profile' | 'rover-traverse' | 'tau-record' | 'communications-record' | 'last-panorama' | 'solar-impact' | 'supported-finding'

export const DOSSIER_COLLECTIBLES: { id: CollectibleId; page: DossierPageId; title: string; detail: string }[] = [
  { id: 'mission-profile', page: 'overview', title: 'MER-B mission profile', detail: 'Opportunity was designed for 90 sols and operated for more than fourteen years.' },
  { id: 'rover-traverse', page: 'timeline', title: '45.16 km traverse record', detail: 'The rover crossed Meridiani Planum and explored the rim of Endeavour crater.' },
  { id: 'tau-record', page: 'telemetry', title: 'Pancam 880 nm Tau series', detail: 'The supplied PDS series ends at Sol 5105.61; it has no direct Sol 5111 measurement.' },
  { id: 'communications-record', page: 'signals', title: 'Last received communication', detail: 'The final received rover communication was on June 10, 2018, Sol 5111.' },
  { id: 'last-panorama', page: 'field-notes', title: 'Perseverance Valley photograph', detail: 'NASA/JPL Pancam imagery documents Opportunity’s final work site.' },
  { id: 'solar-impact', page: 'evidence', title: 'Dust and available sunlight', detail: 'NASA reports that the planet-wide dust storm reduced sunlight reaching the solar arrays.' },
  { id: 'supported-finding', page: 'summary', title: 'Supported conclusion', detail: 'Dust reduced available solar energy; the rover’s exact condition after contact was not verified.' },
]

const coverPhoto = '/images/archives/opportunity.png'
const signalEntries = SIGNAL_LOGS.filter((entry) => entry.kind === 'history')

export type DossierStatus = 'UNREAD' | 'REVIEWED' | 'COLLECTED'

function CollectRecord({ item, status, onCollect }: {
  item: (typeof DOSSIER_COLLECTIBLES)[number]
  status: DossierStatus
  onCollect: (id: CollectibleId) => void
}) {
  return (
    <div className={'dossier-record ' + (status === 'COLLECTED' ? 'is-collected' : '')}>
      <div className="dossier-record-icon" aria-hidden="true">{status === 'COLLECTED' ? <Check size={15} /> : <FileText size={15} />}</div>
      <div className="min-w-0 flex-1">
        <p className="dossier-micro dossier-ink-soft">{status}</p>
        <p className="dossier-record-title">{item.title}</p>
        <p className="dossier-caption">{item.detail}</p>
      </div>
      {status !== 'COLLECTED' && (
        <button className="dossier-collect" type="button" onClick={() => onCollect(item.id)} aria-label={`Collect ${item.title}`}>
          <ClipboardList size={14} /><span>COLLECT</span>
        </button>
      )}
    </div>
  )
}

function MissionPhotograph({ src = coverPhoto, alt, caption, className = '' }: { src?: string; alt: string; caption: string; className?: string }) {
  return (
    <figure className={'dossier-photo ' + className}>
      <div className="dossier-photo-image">
        <Image src={src} alt={alt} fill sizes="(max-width: 720px) 88vw, 42vw" className="object-cover" />
        <span className="dossier-photo-pin" aria-hidden="true" />
      </div>
      <figcaption><span>{caption}</span><span className="dossier-photo-credit">NASA / JPL</span></figcaption>
    </figure>
  )
}

function TauChart({ selected, range, onSelect, onRange }: {
  selected: number
  range: 'all' | 'storm'
  onSelect: (index: number) => void
  onRange: (range: 'all' | 'storm') => void
}) {
  const visible = OPPORTUNITY_TAU_FINAL.map((point, index) => ({ ...point, index })).filter((point) => range === 'all' || point.sol >= 5090)
  const left = range === 'all' ? 5000 : 5090
  const right = 5111
  const plot = { x: 40, y: 18, width: 460, height: 160 }
  const x = (sol: number) => plot.x + ((sol - left) / (right - left)) * plot.width
  const y = (tau: number) => plot.y + plot.height - (tau / 2.65) * plot.height
  const path = visible.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.sol).toFixed(2)} ${y(point.tau).toFixed(2)}`).join(' ')
  const value = OPPORTUNITY_TAU_FINAL[selected]
  const prev = Math.max(0, selected - 1)
  const next = Math.min(OPPORTUNITY_TAU_FINAL.length - 1, selected + 1)

  return (
    <div className="dossier-chart-sheet">
      <div className="dossier-chart-heading"><span>FIG. 03A</span><span>PANCAM / 880 NM</span><span>NASA PDS</span></div>
      <svg viewBox="0 0 530 220" className="dossier-tau-chart" role="img" aria-label="NASA PDS Pancam atmospheric opacity samples through Sol 5105.61; no direct reading exists at Sol 5111">
        {[0, 0.5, 1, 1.5, 2, 2.5].map((tau) => <g key={tau}><line x1={plot.x} y1={y(tau)} x2={plot.x + plot.width} y2={y(tau)} className="dossier-gridline"/><text x="32" y={y(tau) + 4} textAnchor="end">{tau.toFixed(1)}</text></g>)}
        {[left, Math.round((left + 5105) / 2), 5105, 5111].filter((sol, index, values) => values.indexOf(sol) === index).map((sol) => <text key={sol} x={x(sol)} y="204" textAnchor="middle">{sol}</text>)}
        <line x1={x(5105.61)} y1={plot.y} x2={x(5105.61)} y2={plot.y + plot.height} className="dossier-last-measurement" />
        <path d={path} className="dossier-tau-line" />
        {visible.map((point) => <circle key={point.index} cx={x(point.sol)} cy={y(point.tau)} r={point.index === selected ? 5 : 2.1} className={point.index === selected ? 'dossier-point-selected' : 'dossier-point'} />)}
        <text x={x(5105.61) - 5} y="11" textAnchor="end" className="dossier-chart-annotation">LAST DIRECT READING</text>
        <text x={x(5111) - 2} y="218" textAnchor="end" className="dossier-chart-annotation">LAST CONTACT</text>
      </svg>
      <div className="dossier-chart-controls">
        <div className="dossier-reading-value"><span>SELECTED SAMPLE</span><strong>SOL {value.sol.toFixed(3)} · τ {value.tau.toFixed(3)} ± {value.error.toFixed(3)}</strong></div>
        <div className="dossier-chart-buttons" aria-label="Chart controls">
          <button type="button" aria-label="Previous Tau observation" onClick={() => onSelect(prev)}><ArrowLeft size={14} /></button>
          <button type="button" aria-label="Next Tau observation" onClick={() => onSelect(next)}><ArrowRight size={14} /></button>
        </div>
      </div>
      <div className="dossier-chart-ranges" aria-label="Measurement range">
        <button type="button" aria-pressed={range === 'storm'} onClick={() => onRange('storm')}>FINAL SOLS</button>
        <button type="button" aria-pressed={range === 'all'} onClick={() => onRange('all')}>FULL SERIES</button>
      </div>
      <p className="dossier-caption">Direct samples only. The line connects observations; it does not imply unsampled readings.</p>
    </div>
  )
}

export function DossierSpread({
  page,
  collected,
  reviewed,
  evidence01,
  evidence02,
  tauIndex,
  tauRange,
  selectedSignal,
  onCollect,
  onTauSelect,
  onTauRange,
  onSignalSelect,
  onOpenPuzzle,
}: {
  page: DossierPageId
  collected: CollectibleId[]
  reviewed: DossierPageId[]
  evidence01: boolean
  evidence02: boolean
  tauIndex: number
  tauRange: 'all' | 'storm'
  selectedSignal: string
  onCollect: (id: CollectibleId) => void
  onTauSelect: (index: number) => void
  onTauRange: (range: 'all' | 'storm') => void
  onSignalSelect: (id: string) => void
  onOpenPuzzle: (puzzle: 'telemetry' | 'signals') => void
}) {
  const item = DOSSIER_COLLECTIBLES.find((record) => record.page === page)!
  const status: DossierStatus = collected.includes(item.id) ? 'COLLECTED' : reviewed.includes(page) ? 'REVIEWED' : 'UNREAD'
  const selected = signalEntries.find((entry) => entry.id === selectedSignal) ?? signalEntries[0]

  return (
    <div className="dossier-spread" data-spread={page}>
      <article className="dossier-sheet dossier-sheet-left">
        <div className="dossier-page-meta"><span>MISSION FILE: OPPORTUNITY (MER-B)</span><span>PAGE {String(DOSSIER_PAGES.findIndex((entry) => entry.id === page) * 2 + 1).padStart(2, '0')} / 14</span></div>
        <header className="dossier-page-title"><p>{DOSSIER_PAGES.find((entry) => entry.id === page)?.serial}</p><h2>{DOSSIER_PAGES.find((entry) => entry.id === page)?.heading}</h2></header>

        {page === 'overview' && <>
          <p className="dossier-lede">A field record of a rover that outlasted its design by nearly fourteen years—and fell silent as Mars disappeared beneath dust.</p>
          <p className="dossier-body-copy">{OPPORTUNITY_OVERVIEW} The investigation uses documented NASA records; the Outpost M-07 signal is a fictional game event.</p>
          <div className="dossier-fact-grid">{OPPORTUNITY_FACTS.map((fact) => <div className="dossier-fact" key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}</div>
          <div className="dossier-rule-label"><span>MISSION OBJECTIVES</span><span>NASA / JPL HISTORY</span></div>
          <ul className="dossier-objectives">{OPPORTUNITY_OBJECTIVES.slice(0, 3).map((objective) => <li key={objective}>{objective}</li>)}</ul>
          <CollectRecord item={item} status={status} onCollect={onCollect} />
        </>}

        {page === 'timeline' && <>
          <p className="dossier-lede">A fourteen-year traverse from the red plains to the western rim of Endeavour crater.</p>
          <ol className="dossier-timeline">{TRAVERSE.map((stop, index) => <li key={stop.site} className="dossier-timeline-entry"><span className="dossier-timeline-dot">{String(index + 1).padStart(2, '0')}</span><div><span className="dossier-date">{stop.year}</span><h3>{stop.site}</h3><p>{stop.note}</p></div></li>)}</ol>
          <div className="dossier-distance"><span>FINAL ODOMETRY</span><strong>{TRAVERSE_DISTANCE}</strong><span>NASA MISSION RECORD</span></div>
          <CollectRecord item={item} status={status} onCollect={onCollect} />
        </>}

        {page === 'telemetry' && <>
          <p className="dossier-lede">Atmospheric opacity rose sharply in the final sols. Inspect individual samples from the actual PDS extraction.</p>
          <TauChart selected={tauIndex} range={tauRange} onSelect={onTauSelect} onRange={onTauRange} />
          <div className="dossier-source-note"><LockKeyhole size={13} /><span>The direct PDS series ends at Sol 5105.61. It contains no Tau measurement for last-contact Sol 5111.</span></div>
          <CollectRecord item={item} status={status} onCollect={onCollect} />
        </>}

        {page === 'signals' && <>
          <p className="dossier-lede">Separate the last signal received from the commands sent afterward. These are historical NASA records.</p>
          <div className="dossier-signal-list" role="list" aria-label="NASA communications record">
            {signalEntries.map((entry, index) => <button key={entry.id} type="button" role="listitem" aria-pressed={selected.id === entry.id} onClick={() => onSignalSelect(entry.id)} className="dossier-signal-entry">
              <span className="dossier-signal-index">{String(index + 1).padStart(2, '0')}</span><span className="dossier-signal-copy"><span className="dossier-date">{entry.stamp}</span><strong>{entry.title}</strong></span><ArrowRight size={13} />
            </button>)}
          </div>
          <CollectRecord item={item} status={status} onCollect={onCollect} />
        </>}

        {page === 'field-notes' && <>
          <p className="dossier-lede">Pancam and Navcam records trace the last traverses through Perseverance Valley.</p>
          <div className="dossier-note-card"><Stamp size={16} /><div><span className="dossier-date">SOL 4793 · NAVCAM</span><p>Looking back uphill after Opportunity entered Perseverance Valley. Part of the rover deck remains visible in the foreground.</p></div></div>
          <div className="dossier-note-card"><Telescope size={16} /><div><span className="dossier-date">SOL 5111 · PANCAM</span><p>The last received frame was incomplete and showed the dust-darkened sky. Missing image area is part of the downlinked record.</p></div></div>
          <p className="dossier-body-copy">Field note: image frames and ground measurements are historical material. Outpost M-07 narrative events are fiction and are not presented as NASA telemetry.</p>
          <CollectRecord item={item} status={status} onCollect={onCollect} />
        </>}

        {page === 'evidence' && <>
          <p className="dossier-lede">Evidence is filed only when its investigation is completed. Reviewing this page does not collect an artifact.</p>
          <div className="dossier-evidence-record">
            <span className="dossier-evidence-number">01</span><div className="min-w-0 flex-1"><p className="dossier-date">SCIENTIFIC RECORD</p><h3>The Darkening Sky</h3><p>Direct Tau observations, the measured data gap, and separate NASA power-versus-Tau context.</p></div><span className={'dossier-status-stamp ' + (evidence01 ? 'is-filed' : '')}>{evidence01 ? 'FILED' : 'OPEN'}</span>
          </div>
          <div className="dossier-evidence-record">
            <span className="dossier-evidence-number">02</span><div className="min-w-0 flex-1"><p className="dossier-date">COMMUNICATIONS RECORD</p><h3>The Last Transmission</h3><p>Last received communication, later recovery attempts, and the mission-end announcement.</p></div><span className={'dossier-status-stamp ' + (evidence02 ? 'is-filed' : '')}>{evidence02 ? 'FILED' : 'OPEN'}</span>
          </div>
          <div className="dossier-source-note"><LockKeyhole size={13} /><span>Evidence is saved with the existing game progress keys and remains intact.</span></div>
          <CollectRecord item={item} status={status} onCollect={onCollect} />
        </>}

        {page === 'summary' && <>
          <p className="dossier-lede">The dossier supports a documented power-loss context, not a definitive diagnosis of the rover’s internal condition.</p>
          <div className="dossier-finding"><span>SUPPORTED BY THE RECORD</span><p>A planet-encircling dust storm reduced the sunlight reaching Opportunity’s solar arrays. The actual final direct Tau sample in this series predates the last communication.</p></div>
          <div className="dossier-finding dossier-finding-caution"><span>NOT ESTABLISHED BY THESE SOURCES</span><p>No direct Sol 5111 Tau sample appears in the supplied PDS series. NASA did not verify the rover’s hardware condition after contact was lost.</p></div>
          <div className="dossier-summary-stats"><div><strong>{reviewed.length} / 7</strong><span>PAGES REVIEWED</span></div><div><strong>{collected.length} / 7</strong><span>RECORDS COLLECTED</span></div><div><strong>{Number(evidence01) + Number(evidence02)} / 2</strong><span>EVIDENCE FILED</span></div></div>
          <CollectRecord item={item} status={status} onCollect={onCollect} />
        </>}
      </article>

      <article className="dossier-sheet dossier-sheet-right">
        {page === 'overview' && <>
          <div className="dossier-paper-illustration">
            <MissionPhotograph src={coverPhoto} alt="Opportunity rover on an orange Martian plain beneath a pale sky" caption="OPPORTUNITY / MER-B" className="dossier-photo-feature" />
            <div className="dossier-red-stamp" aria-label="Classified archive file">NASA ARCHIVE<br /><strong>CLASSIFIED</strong></div>
          </div>
          <div className="dossier-document-block"><div className="dossier-rule-label"><span>ROVER SPECIFICATION</span><span>MER-B</span></div><dl className="dossier-spec-list">{OPPORTUNITY_ROVER.slice(0, 4).map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></div>
          <div className="dossier-objective-note"><p>FIELD OBJECTIVE</p><span>Search for evidence of past water activity on Mars.</span></div>
          <p className="dossier-page-footnote">HISTORICAL MISSION DATA · FICTIONAL INVESTIGATION FRAMEWORK</p>
        </>}

        {page === 'timeline' && <>
          <MissionPhotograph src="/data/opportunity/images/22508_PIA23246-800w.jpg" alt="Martian terrain in Perseverance Valley recorded by Opportunity" caption="TRAVERSE / PERSEVERANCE VALLEY" className="dossier-photo-wide" />
          <div className="dossier-document-block"><div className="dossier-rule-label"><span>SPACECRAFT DETAILS</span><span>NASA / JPL</span></div><dl className="dossier-spec-list">{OPPORTUNITY_ROVER.slice(4).map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></div>
          <div className="dossier-annotation"><span>ARCHIVE NOTE</span><p>Opportunity traversed {TRAVERSE_DISTANCE} before its final communication.</p></div>
          <p className="dossier-page-footnote">TRAVERSE SUMMARY · NASA MISSION ARCHIVE</p>
        </>}

        {page === 'telemetry' && <>
          <div className="dossier-document-heading"><span>FIG. 03B · PUBLISHED CONTEXT</span><span>NASA SCIENCE</span></div>
          <div className="dossier-power-figure"><Image src="/data/opportunity/scientific/power/Opportunity_Power_vs_Tau_2018.jpg" alt="NASA published Opportunity solar power versus atmospheric opacity graphic" fill sizes="(max-width: 720px) 88vw, 42vw" className="object-contain" /></div>
          <p className="dossier-caption">Published NASA power-versus-Tau context. This separate graphic is not a continuation of the PDS instrument series above.</p>
          <div className="dossier-annotation"><span>INSPECT THE DATA</span><p>Follow the direct Pancam samples, find the unmeasured Sol 5111 gap, and compare the published power context.</p></div>
          <button type="button" className="dossier-action-button" onClick={() => onOpenPuzzle('telemetry')}><ScanEye size={15} /> OPEN TELEMETRY INVESTIGATION <ArrowUpRight size={13} /></button>
          <a className="dossier-source-link" href="/data/opportunity/scientific/atmospheric-opacity/1tau880_5106_20181207a.tab" target="_blank" rel="noreferrer">OPEN ORIGINAL PDS TABLE <ArrowUpRight size={12} /></a>
          <p className="dossier-page-footnote">PANCAM 880 NM · SOL 5105.61 LAST DIRECT SAMPLE</p>
        </>}

        {page === 'signals' && <>
          <div className="dossier-signal-document">
            <div className="dossier-document-heading"><span>RECORD INSPECTOR</span><span>{selected.stamp}</span></div>
            <Radio size={18} className="dossier-radio-icon" />
            <h3>{selected.title}</h3><p>{selected.body}</p>
            {selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="dossier-source-link">NASA / JPL SOURCE <ArrowUpRight size={12} /></a>}
            <div className="dossier-red-stamp dossier-red-stamp-small">HISTORY<br /><strong>VERIFIED</strong></div>
          </div>
          <div className="dossier-annotation"><span>ARCHIVE TASK</span><p>Arrange the dated records. Later Earth commands are not proof of another rover reply.</p></div>
          <button type="button" className="dossier-action-button" onClick={() => onOpenPuzzle('signals')}><Radio size={15} /> RECONSTRUCT CHRONOLOGY <ArrowUpRight size={13} /></button>
          <p className="dossier-page-footnote">DOCUMENTED NASA HISTORY · NO FICTIONAL SIGNALS INCLUDED</p>
        </>}

        {page === 'field-notes' && <>
          <MissionPhotograph src={MEDIA[1].src} alt={MEDIA[1].caption} caption="SOL 5111 / FINAL DOWNLINKED FRAME" className="dossier-photo-wide dossier-final-frame" />
          <div className="dossier-photo-caption"><span>{MEDIA[1].credit}</span><p>{MEDIA[1].caption}</p><a href={MEDIA[1].sourceUrl} target="_blank" rel="noopener noreferrer">NASA PHOTOJOURNAL <ArrowUpRight size={12} /></a></div>
          <div className="dossier-hand-note"><span>FIELD MARGIN / 10 JUN 2018</span><p>“The sky was darkening. The frame returned to Earth was incomplete.”</p><small>Caption summarizes the documented image; quotation marks are editorial.</small></div>
          <p className="dossier-page-footnote">PANCAM IMAGE · NASA / JPL-CALTECH / CORNELL</p>
        </>}

        {page === 'evidence' && <>
          <div className="dossier-evidence-photo-stack">
            <MissionPhotograph src="/data/opportunity/images/PIA22930.jpg" alt="Opportunity Pancam images of the Sun through dust on Mars" caption="LAST IMAGES OF THE SUN / PIA22930" className="dossier-photo-wide" />
            <div className="dossier-polaroid"><div className="dossier-polaroid-image"><Image src="/data/opportunity/images/8846_PIA21725_SOL4793-ncam-full2.jpg" alt="Navcam image looking back uphill through Perseverance Valley" fill sizes="30vw" className="object-cover" /></div><span>NAVCAM · SOL 4793</span></div>
          </div>
          <div className="dossier-annotation"><span>CASE FILE / 02 ARTIFACTS</span><p>Complete each investigation to file its evidence card. Existing evidence keys are preserved.</p></div>
          <p className="dossier-page-footnote">ORIGINAL OPPORTUNITY IMAGERY · NASA / JPL-CALTECH</p>
        </>}

        {page === 'summary' && <>
          <div className="dossier-summary-seal"><div className="dossier-seal-ring"><span>MER-B</span><strong>CASE<br />FILE</strong><span>2018 — 2019</span></div></div>
          <div className="dossier-summary-artifacts"><span>COLLECTED RECORDS</span>{DOSSIER_COLLECTIBLES.filter((record) => collected.includes(record.id)).map((record) => <p key={record.id}><Check size={12} />{record.title}</p>)}{collected.length === 0 && <p className="dossier-empty-record">Collected records will be inventoried here.</p>}</div>
          <div className="dossier-annotation"><span>HISTORY / FICTION BOUNDARY</span><p>NASA history is cited in its source inspector. The M-07 echo remains an explicitly fictional game event.</p></div>
          <p className="dossier-page-footnote">MISSION STATUS: ENDED · ROVER INACTIVE ON MARS</p>
        </>}
      </article>
    </div>
  )
}
