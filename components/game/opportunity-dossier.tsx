'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useGameSettings } from './settings-provider'
import { DarkeningSkyPuzzle } from './darkening-sky-puzzle'
import { LastTransmissionPuzzle } from './last-transmission-puzzle'
import { OPPORTUNITY_TAU_FINAL } from './archives/opportunity-tau-data'
import { DOSSIER_COLLECTIBLES, DOSSIER_PAGES, DossierSpread, type CollectibleId, type DossierPageId } from './opportunity-dossier-pages'
import './dossier.css'

type Puzzle = 'telemetry' | 'signals'
type PersistedDossier = {
  version: 1
  opened: boolean
  lastPage: DossierPageId
  reviewedPages: DossierPageId[]
  collectedInfo: CollectibleId[]
  evidence01: boolean
  evidence02: boolean
}
type OpenRequest = { page: DossierPageId; sequence: number }

const DOSSIER_KEY = 'last-signal.opportunity.dossier.v1'
const EVIDENCE_01_KEY = 'last-signal.opportunity.evidence-01.v1'
const EVIDENCE_02_KEY = 'last-signal.opportunity.evidence-02.v1'
const DEFAULT_PROGRESS: PersistedDossier = {
  version: 1,
  opened: false,
  lastPage: 'overview',
  reviewedPages: [],
  collectedInfo: [],
  evidence01: false,
  evidence02: false,
}
const isPage = (value: unknown): value is DossierPageId => DOSSIER_PAGES.some((page) => page.id === value)
const isCollectible = (value: unknown): value is CollectibleId => DOSSIER_COLLECTIBLES.some((item) => item.id === value)

function readProgress(): PersistedDossier {
  let saved: Partial<PersistedDossier> = {}
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(DOSSIER_KEY) ?? 'null')
    if (parsed && typeof parsed === 'object' && (parsed as { version?: unknown }).version === 1) {
      const value = parsed as Partial<PersistedDossier>
      saved = {
        ...value,
        opened: value.opened === true,
        lastPage: isPage(value.lastPage) ? value.lastPage : 'overview',
        reviewedPages: Array.isArray(value.reviewedPages) ? [...new Set(value.reviewedPages.filter(isPage))] : [],
        collectedInfo: Array.isArray(value.collectedInfo) ? [...new Set(value.collectedInfo.filter(isCollectible))] : [],
        evidence01: value.evidence01 === true,
        evidence02: value.evidence02 === true,
      }
    }
  } catch {
    saved = {}
  }
  let evidence01 = saved.evidence01 === true
  let evidence02 = saved.evidence02 === true
  try {
    evidence01 ||= window.localStorage.getItem(EVIDENCE_01_KEY) === 'collected'
    evidence02 ||= window.localStorage.getItem(EVIDENCE_02_KEY) === 'collected'
  } catch {
    // Existing game evidence remains available in the active session when storage is restricted.
  }
  return { ...DEFAULT_PROGRESS, ...saved, version: 1, evidence01, evidence02 }
}

export function OpportunityDossier({
  visible,
  openRequest,
  onClose,
  onExit,
}: {
  visible: boolean
  openRequest: OpenRequest
  onClose: () => void
  onExit: () => void
}) {
  const { settings, play } = useGameSettings()
  const [progress, setProgress] = useState(DEFAULT_PROGRESS)
  const progressRef = useRef(DEFAULT_PROGRESS)
  const [page, setPage] = useState<DossierPageId>('overview')
  const [bookOpen, setBookOpen] = useState(false)
  const [coverOpening, setCoverOpening] = useState(false)
  const [transition, setTransition] = useState<'next' | 'previous' | null>(null)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [tauIndex, setTauIndex] = useState(0)
  const [tauRange, setTauRange] = useState<'all' | 'storm'>('storm')
  const [selectedSignal, setSelectedSignal] = useState('last')
  const openFileRef = useRef<HTMLButtonElement>(null)

  const save = useCallback((update: (current: PersistedDossier) => PersistedDossier) => {
    const next = update(progressRef.current)
    progressRef.current = next
    setProgress(next)
    try {
      window.localStorage.setItem(DOSSIER_KEY, JSON.stringify(next))
    } catch {
      // The investigation remains playable for this session if local storage is unavailable.
    }
  }, [])

  const markReviewed = useCallback((nextPage: DossierPageId) => {
    save((current) => ({
      ...current,
      opened: true,
      lastPage: nextPage,
      reviewedPages: current.reviewedPages.includes(nextPage) ? current.reviewedPages : [...current.reviewedPages, nextPage],
    }))
  }, [save])

  useEffect(() => {
    const loaded = readProgress()
    progressRef.current = loaded
    setProgress(loaded)
    setPage(loaded.lastPage)
    setBookOpen(loaded.opened)
    setTauIndex(OPPORTUNITY_TAU_FINAL.length - 1)
  }, [])

  useEffect(() => {
    if (openRequest.sequence === 0) return
    const wasHidden = !visible
    setPage(openRequest.page)
    setBookOpen(true)
    markReviewed(openRequest.page)
    if (wasHidden) play('archives')
  }, [openRequest, visible, markReviewed, play])

  useEffect(() => {
    if (!visible || puzzle) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (bookOpen) {
        play('back')
        setBookOpen(false)
        onClose()
      } else {
        onExit()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [visible, puzzle, bookOpen, onClose, onExit, play])

  useEffect(() => {
    if (!visible || puzzle || bookOpen) return
    openFileRef.current?.focus()
  }, [visible, puzzle, bookOpen])

  const openFile = () => {
    play('archives')
    setCoverOpening(true)
    markReviewed(page)
    window.setTimeout(() => {
      setBookOpen(true)
      setCoverOpening(false)
    }, settings.reducedMotion ? 0 : 560)
  }

  const changePage = (nextPage: DossierPageId) => {
    if (nextPage === page || transition) return
    const nextIndex = DOSSIER_PAGES.findIndex((item) => item.id === nextPage)
    const previousIndex = DOSSIER_PAGES.findIndex((item) => item.id === page)
    setTransition(nextIndex > previousIndex ? 'next' : 'previous')
    play('archives')
    setPage(nextPage)
    markReviewed(nextPage)
    window.setTimeout(() => setTransition(null), settings.reducedMotion ? 1 : 480)
  }

  const changeAdjacentPage = (direction: -1 | 1) => {
    const currentIndex = DOSSIER_PAGES.findIndex((item) => item.id === page)
    const next = DOSSIER_PAGES[Math.max(0, Math.min(DOSSIER_PAGES.length - 1, currentIndex + direction))]
    if (next) changePage(next.id)
  }

  const collect = (id: CollectibleId) => {
    if (progressRef.current.collectedInfo.includes(id)) return
    play('click')
    save((current) => ({ ...current, collectedInfo: [...current.collectedInfo, id] }))
  }

  const fileEvidence = () => {
    let evidence01 = false
    let evidence02 = false
    try {
      evidence01 = window.localStorage.getItem(EVIDENCE_01_KEY) === 'collected'
      evidence02 = window.localStorage.getItem(EVIDENCE_02_KEY) === 'collected'
    } catch {
      evidence01 = progressRef.current.evidence01
      evidence02 = progressRef.current.evidence02
    }
    save((current) => ({ ...current, evidence01: current.evidence01 || evidence01, evidence02: current.evidence02 || evidence02 }))
  }

  const closeBook = () => {
    play('back')
    setPuzzle(null)
    setBookOpen(false)
    onClose()
  }

  const pageIndex = DOSSIER_PAGES.findIndex((item) => item.id === page)
  const totalProgress = progress.reviewedPages.length + progress.collectedInfo.length + Number(progress.evidence01) + Number(progress.evidence02)
  const progressPercent = Math.round((totalProgress / 16) * 100)
  const currentTitle = DOSSIER_PAGES[pageIndex]?.heading ?? 'Mission overview'

  if (!visible) return null

  return (
    <section id="opportunity-dossier" className={'opportunity-dossier ' + (settings.reducedMotion ? 'reduced-motion ' : '') + (bookOpen ? 'is-book-open' : 'is-book-closed')} role="dialog" aria-modal="true" aria-label="Opportunity mission dossier">
      <div className="dossier-room-light" aria-hidden="true" />
      <header className="dossier-hud">
        <button type="button" className="dossier-exit-button" onClick={onExit}><ArrowLeft size={13} /> EXIT INVESTIGATION</button>
        <div className="dossier-progress-hud" aria-label={`Investigation progress ${progressPercent} percent`}>
          <div><span>INVESTIGATION PROGRESS</span><strong>{progressPercent}%</strong></div>
          <div className="dossier-progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
        </div>
      </header>

      {!bookOpen ? (
        <main className={'dossier-cover-stage ' + (coverOpening ? 'is-opening' : '')} aria-label="Closed Opportunity mission file">
          <div className="dossier-cover-edge" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="dossier-cover">
            <div className="dossier-cover-spine" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="dossier-cover-orbit" aria-hidden="true"><i /></div>
            <div className="dossier-cover-content">
              <p className="dossier-cover-nasa"><span className="dossier-nasa-roundel">NASA</span><span>NATIONAL AERONAUTICS<br />AND SPACE ADMINISTRATION</span></p>
              <p className="dossier-cover-kicker">MISSION FILE</p>
              <h1>OPPORTUNITY</h1>
              <p className="dossier-cover-serial">MER-B &nbsp;·&nbsp; 2003—2019</p>
              <div className="dossier-cover-photo"><Image src="/images/archives/opportunity.png" alt="Opportunity rover beneath the Martian sky" width={1200} height={900} sizes="(max-width: 720px) 65vw, 440px" priority /><span>MISSION ARTWORK / MER-B</span></div>
              <div className="dossier-cover-footer"><span>MERIDIANI PLANUM<br />MARS EXPLORATION ROVER</span><span className="dossier-classified-stamp">ARCHIVE<br />CLASSIFIED</span></div>
              <p className="dossier-cover-bottom">JPL · MISSION ARCHIVE · VOL. 01</p>
            </div>
            <button ref={openFileRef} type="button" className="dossier-open-action" onClick={openFile}><BookOpen size={16} /> OPEN FILE <ArrowRight size={16} /></button>
            <span className="dossier-cover-scratch scratch-one" aria-hidden="true" /><span className="dossier-cover-scratch scratch-two" aria-hidden="true" />
          </div>
          <div className="dossier-cover-tabs" aria-hidden="true"><span>OVERVIEW</span><span>TIMELINE</span><span>TELEMETRY</span><span>SIGNAL LOGS</span><span>FIELD NOTES</span><span>EVIDENCE</span><span>SUMMARY</span></div>
          <p className="dossier-cover-caption">OPPORTUNITY / MER-B &nbsp;·&nbsp; SELECT OPEN FILE TO BEGIN</p>
        </main>
      ) : (
        <main className="dossier-open-stage" aria-label={`Open mission dossier, ${currentTitle}`}>
          <div className="dossier-book-shadow" aria-hidden="true" />
          <div className="dossier-open-book" data-turn={transition ?? 'none'}>
            <div className="dossier-page-stack dossier-page-stack-left" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="dossier-page-stack dossier-page-stack-right" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="dossier-page-frame">
              <div className="dossier-page-gutter" aria-hidden="true" />
              <div className="dossier-page-content" key={page}>
                <DossierSpread
                  page={page}
                  collected={progress.collectedInfo}
                  reviewed={progress.reviewedPages}
                  evidence01={progress.evidence01}
                  evidence02={progress.evidence02}
                  tauIndex={tauIndex}
                  tauRange={tauRange}
                  selectedSignal={selectedSignal}
                  onCollect={collect}
                  onTauSelect={setTauIndex}
                  onTauRange={(range) => { setTauRange(range); if (range === 'storm') setTauIndex(OPPORTUNITY_TAU_FINAL.length - 1) }}
                  onSignalSelect={setSelectedSignal}
                  onOpenPuzzle={setPuzzle}
                />
              </div>
              <div className="dossier-binding" aria-hidden="true"><span /><span /><span /><span /></div>
              <div className="dossier-book-footer">
                <span>MER-B / OPPORTUNITY &nbsp;·&nbsp; NASA DOCUMENTED HISTORY</span>
                <span>SPREAD {String(pageIndex + 1).padStart(2, '0')} / 07</span>
                <div className="dossier-book-pagination">
                  <button type="button" aria-label="Previous spread" disabled={pageIndex === 0 || !!transition} onClick={() => changeAdjacentPage(-1)}><ChevronLeft size={15} /></button>
                  <button type="button" aria-label="Next spread" disabled={pageIndex === DOSSIER_PAGES.length - 1 || !!transition} onClick={() => changeAdjacentPage(1)}><ChevronRight size={15} /></button>
                </div>
              </div>
            </div>
            <nav className="dossier-tabs" aria-label="Mission file pages">
              {DOSSIER_PAGES.map((tab, index) => <button key={tab.id} type="button" aria-current={page === tab.id ? 'page' : undefined} onClick={() => changePage(tab.id)} className={'dossier-tab dossier-tab-' + String(index + 1).padStart(2, '0') + (page === tab.id ? ' is-active' : '')}><span>{tab.label}</span><small>{String(index + 1).padStart(2, '0')}</small></button>)}
            </nav>
            <button type="button" aria-label="Close mission file and return to Mission Control" className="dossier-close-file" onClick={closeBook}><X size={14} /><span>MISSION CONTROL</span></button>
            {puzzle && <div className="dossier-puzzle-layer" role="group" aria-label={puzzle === 'telemetry' ? 'Telemetry investigation overlay' : 'Signal log investigation overlay'}>
              {puzzle === 'telemetry' ? <DarkeningSkyPuzzle embedded onClose={() => { setPuzzle(null); fileEvidence() }} /> : <LastTransmissionPuzzle embedded onClose={() => { setPuzzle(null); fileEvidence() }} />}
            </div>}
          </div>
          <div className="dossier-progress-legend" aria-live="polite"><span><i className="legend-unread" />UNREAD</span><span><i className="legend-reviewed" />REVIEWED</span><span><i className="legend-collected" />COLLECTED</span><span className="dossier-progress-count">{progress.reviewedPages.length} / 7 PAGES &nbsp;·&nbsp; {progress.collectedInfo.length} / 7 RECORDS &nbsp;·&nbsp; {Number(progress.evidence01) + Number(progress.evidence02)} / 2 EVIDENCE</span></div>
        </main>
      )}
      <footer className="dossier-hud-footer"><span>OUTPOST M-07 · MISSION 01</span><span>{bookOpen ? 'ARCHIVAL RECORDS / FIELD INVESTIGATION' : 'MISSION CONTROL / FILE ACCESS'}</span></footer>
    </section>
  )
}
