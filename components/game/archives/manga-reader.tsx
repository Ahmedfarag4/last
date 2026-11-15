'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, Expand, Flag, LoaderCircle, Minimize, RotateCcw, TriangleAlert, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { languageAttrs } from '@/lib/i18n'
import { useGameSettings } from '../settings-provider'
import { BackChip } from './archive-ui'
import { OPPORTUNITY_MANGA, chapterForPage, totalPages, type MangaChapter, type MangaConfig } from './manga-data'
import { markMangaFinished, saveMangaPage } from './manga-progress'
import { OPPORTUNITY_ARABIC_PAGES } from './opportunity-arabic-pages'

const ZOOM_LEVELS = [1, 1.25, 1.5, 2, 2.5, 3]
const MAX_DPR = 2

type PdfJs = typeof import('pdfjs-dist')

let pdfjsPromise: Promise<PdfJs> | null = null
function loadPdfJs() {
  pdfjsPromise ??= import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
    return lib
  })
  return pdfjsPromise
}

// Only chapters the reader actually visits are fetched; visited ones stay cached for the session.
const documentCache = new Map<string, Promise<PDFDocumentProxy>>()
function loadChapter(chapter: MangaChapter) {
  let doc = documentCache.get(chapter.pdf)
  if (!doc) {
    doc = loadPdfJs().then((lib) => lib.getDocument({ url: chapter.pdf }).promise)
    doc.catch(() => documentCache.delete(chapter.pdf))
    documentCache.set(chapter.pdf, doc)
  }
  return doc
}

type Status = 'loading' | 'ready' | 'error'

type MangaReaderProps = {
  initialPage: number
  onBack: () => void
  manga?: MangaConfig
}

export function MangaReader({ initialPage, onBack, manga = OPPORTUNITY_MANGA }: MangaReaderProps) {
  const { settings, t } = useGameSettings()
  const TOTAL_PAGES = totalPages(manga)
  const language = manga.copy?.language ?? settings.language
  const [page, setPage] = useState(() => Math.min(Math.max(initialPage, 1), TOTAL_PAGES))
  const [zoomIndex, setZoomIndex] = useState(0)
  const [doc, setDoc] = useState<{ pdf: string; proxy: PDFDocumentProxy } | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showArabic, setShowArabic] = useState(false)

  const rootRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const chapter = chapterForPage(manga, page)
  const localPage = page - chapter.firstPage + 1
  const zoom = ZOOM_LEVELS[zoomIndex]
  const arabicLines = manga.id === 'opportunity' ? OPPORTUNITY_ARABIC_PAGES[page] : undefined

  const goTo = useCallback((next: number) => {
    setFinished(false)
    setShowArabic(false)
    setPage(Math.min(Math.max(next, 1), TOTAL_PAGES))
    viewportRef.current?.scrollTo({ top: 0, left: 0 })
  }, [TOTAL_PAGES])
  const finish = useCallback(() => {
    markMangaFinished(manga)
    setFinished(true)
  }, [manga])
  const next = useCallback(() => (page >= TOTAL_PAGES ? finish() : goTo(page + 1)), [finish, goTo, page])
  const prev = useCallback(() => (finished ? setFinished(false) : goTo(page - 1)), [finished, goTo, page])

  useEffect(() => {
    saveMangaPage(manga, page)
  }, [manga, page])
  const zoomIn = useCallback(() => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1)), [])
  const zoomOut = useCallback(() => setZoomIndex((i) => Math.max(i - 1, 0)), [])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    loadChapter(chapter)
      .then((proxy) => {
        if (cancelled) return
        setDoc({ pdf: chapter.pdf, proxy })
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [chapter, attempt])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!doc || doc.pdf !== chapter.pdf || !size.w || !size.h) return
    let cancelled = false
    let task: RenderTask | null = null
    doc.proxy
      .getPage(localPage)
      .then((pdfPage) => {
        const canvas = canvasRef.current
        if (cancelled || !canvas) return
        const base = pdfPage.getViewport({ scale: 1 })
        const fit = Math.min(size.w / base.width, size.h / base.height)
        const cssScale = fit * zoom
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
        const viewport = pdfPage.getViewport({ scale: cssScale * dpr })
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.style.width = `${Math.floor(base.width * cssScale)}px`
        canvas.style.height = `${Math.floor(base.height * cssScale)}px`
        task = pdfPage.render({ canvas, viewport })
        return task.promise.then(() => !cancelled && setStatus('ready'))
      })
      .catch((err: Error) => {
        if (!cancelled && err?.name !== 'RenderingCancelledException') setStatus('error')
      })
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, chapter.pdf, localPage, size, zoom])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest('select, input, textarea')) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === '+' || e.key === '=') zoomIn()
      else if (e.key === '-') zoomOut()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, zoomIn, zoomOut])

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled))
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void rootRef.current?.requestFullscreen().catch(() => setCanFullscreen(false))
  }, [])

  const busy = status === 'loading'

  return (
    <section
      ref={rootRef}
      aria-label={`${manga.title} — ${t.readerTitle}`}
      {...languageAttrs(language)}
      className="arc-panel-in arc-glass relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:bg-[#04080e]"
      style={{ '--tone': '#49d7ff' } as React.CSSProperties}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hud/20 px-4 py-3 sm:px-6">
        <BackChip label={t.readerBack} onClick={onBack} />
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="manga-chapter">
            {t.readerChapterSelect}
          </label>
          <select
            id="manga-chapter"
            value={chapter.number}
            onChange={(e) => {
              const target = manga.chapters.find((c) => c.number === Number(e.target.value))
              if (target) goTo(target.firstPage)
            }}
            className="rounded-full border border-hud/35 bg-navy/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-frost uppercase outline-none focus-visible:ring-2 focus-visible:ring-hud/60"
          >
            {manga.chapters.map((c) => (
              <option key={c.number} value={c.number}>
                {t.readerChapter} {c.number} · {c.firstPage}–{c.lastPage}
              </option>
            ))}
          </select>
          <p
            aria-live="polite"
            className="min-w-[7.5rem] text-end font-display text-sm tracking-[0.2em] text-ember tabular-nums uppercase"
          >
            <span dir="ltr">
              {t.readerPage} {page} / {TOTAL_PAGES}
            </span>
          </p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={viewportRef}
          className={cn(
            'arc-scroll absolute inset-0 flex overflow-auto bg-midnight/60 p-3 sm:p-4',
            zoom > 1 && 'cursor-grab',
          )}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`${manga.title}, ${t.readerChapter} ${chapter.number}, ${t.readerPage} ${page} / ${TOTAL_PAGES}`}
            className={cn(
              'm-auto block max-w-none rounded-sm shadow-[0_0_40px_-10px_rgba(73,215,255,0.35)] transition-opacity duration-200',
              status === 'ready' ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>

        {manga.id === 'opportunity' && showArabic && (
          <aside dir="rtl" lang="ar" aria-label="الترجمة العربية للصفحة الحالية" className="absolute bottom-3 left-3 right-3 z-20 max-h-[45%] overflow-y-auto rounded-xl border border-hud/50 bg-[#061522]/95 p-4 shadow-xl backdrop-blur-md sm:left-auto sm:max-w-md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-hud">الترجمة العربية — صفحة {page}</p>
              <button type="button" onClick={() => setShowArabic(false)} className="rounded-full border border-hud/40 px-3 py-1 text-xs text-frost">إغلاق</button>
            </div>
            {arabicLines?.length ? <div className="mt-3 space-y-3 text-sm leading-7 text-frost">{arabicLines.map((line,i)=><p key={i}>{line}</p>)}</div>
              : <p className="mt-3 text-sm leading-7 text-frost/80">الترجمة الدقيقة للصفحة دي لسه مش متاحة. الصورة الأصلية بالإنجليزي موجودة كما هي، ومش هنعرض ملخصًا على إنه ترجمة.</p>}
          </aside>
        )}
        {busy && (
          <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-hud">
            <LoaderCircle aria-hidden className="size-8 animate-spin" />
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase">{t.readerLoading}</p>
          </div>
        )}

        {finished && (
          <div
            role="dialog"
            aria-modal="false"
            aria-labelledby="manga-complete-title"
            className="arc-panel-in absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-midnight/90 p-6 text-center backdrop-blur-sm"
          >
            <Flag aria-hidden className="size-8 text-ember" />
            <p className="text-[10px] font-semibold tracking-[0.32em] text-hud">{t.readerCompleteEyebrow}</p>
            <h2
              id="manga-complete-title"
              className="font-display text-[clamp(22px,3.5vw,36px)] uppercase leading-none tracking-[0.08em] text-frost"
            >
              {t.readerCompleteTitle}
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-frost/80">{manga.copy?.completeBody ?? t.readerCompleteBody}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => goTo(1)}
                className="inline-flex items-center gap-2 rounded-full border border-ember/50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-ember uppercase transition-colors hover:border-ember hover:text-frost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <RotateCcw aria-hidden className="size-3.5" />
                {t.readerReadAgain}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-hud/40 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-frost/85 uppercase transition-colors hover:border-hud hover:text-frost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud"
              >
                {t.readerBackToOverview}
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <TriangleAlert aria-hidden className="size-8 text-ember" />
            <p className="max-w-sm text-sm text-frost/85">{t.readerError}</p>
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-ember/50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-ember uppercase transition-colors hover:border-ember hover:text-frost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <RotateCcw aria-hidden className="size-3.5" />
              {t.readerRetry}
            </button>
          </div>
        )}
      </div>

      <footer dir="ltr" className="flex items-center justify-between gap-2 border-t border-hud/20 px-3 py-3 sm:px-6">
        <NavButton label={t.readerPrev} onClick={prev} disabled={page <= 1 && !finished}>
          <ChevronLeft aria-hidden className="size-5" />
          <span className="hidden sm:inline">{t.readerPrev}</span>
        </NavButton>

        <div className="flex items-center gap-1 sm:gap-2">
          {manga.id === 'opportunity' && (
            <button type="button" aria-pressed={showArabic} onClick={() => setShowArabic(v => !v)} className="rounded-full border border-hud/50 px-2 py-2 text-[10px] font-semibold text-hud hover:border-hud sm:px-3 sm:text-xs">
              {showArabic ? 'Hide Arabic' : 'ترجمة عربية'}
            </button>
          )}
          <ToolButton label={t.readerZoomOut} onClick={zoomOut} disabled={zoomIndex === 0}>
            <ZoomOut aria-hidden className="size-4" />
          </ToolButton>
          <button
            type="button"
            onClick={() => setZoomIndex(0)}
            aria-label={t.readerFit}
            title={t.readerFit}
            className="min-w-14 rounded-full px-2 py-1 text-center text-[11px] font-semibold tracking-[0.12em] text-frost/80 tabular-nums transition-colors hover:text-frost focus-visible:outline-2 focus-visible:outline-hud"
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolButton label={t.readerZoomIn} onClick={zoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1}>
            <ZoomIn aria-hidden className="size-4" />
          </ToolButton>
          <span aria-hidden className="mx-1 h-5 w-px bg-hud/20" />
          <ToolButton
            label={isFullscreen ? t.readerExitFullscreen : t.fullscreen}
            onClick={toggleFullscreen}
            disabled={!canFullscreen}
          >
            {isFullscreen ? <Minimize aria-hidden className="size-4" /> : <Expand aria-hidden className="size-4" />}
          </ToolButton>
        </div>

        <NavButton label={t.readerNext} onClick={next} disabled={finished} primary>
          <span className="hidden sm:inline">{t.readerNext}</span>
          <ChevronRight aria-hidden className="size-5" />
        </NavButton>
      </footer>
    </section>
  )
}

function NavButton({
  label,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold tracking-[0.2em] uppercase transition-[border-color,color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-35 sm:px-5',
        primary
          ? 'border-ember/50 text-ember hover:enabled:border-ember hover:enabled:shadow-[0_0_18px_rgba(255,176,72,0.3)] focus-visible:outline-ember'
          : 'border-hud/35 text-frost/85 hover:enabled:border-hud hover:enabled:text-frost hover:enabled:shadow-[0_0_18px_rgba(73,215,255,0.3)] focus-visible:outline-hud',
      )}
    >
      {children}
    </button>
  )
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-9 items-center justify-center rounded-full border border-hud/25 text-frost/80 transition-colors hover:enabled:border-hud hover:enabled:text-frost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  )
}
