'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType, CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, BookMarked, ClipboardList, X } from 'lucide-react'
import { useGameSettings } from '../settings-provider'
import { CollectedPanel } from './collected-panel'
import { DossierBlockView, type BlockContext } from './dossier-blocks'
import { DossierCover } from './dossier-cover'
import { DossierTabs } from './dossier-tabs'
import { MissionCinematics } from './mission-cinematics'
import { localizeOpportunity } from './localize-opportunity'
import { notifyDossierChange, useDossierProgress } from './progress'
import type { MissionFile } from './types'
import './dossier.css'

export type AnalysisRegistry = Record<string, ComponentType<{ onClose: () => void }>>

export function MissionFileScreen({ file, analyses, onBack }: { file: MissionFile; analyses: AnalysisRegistry; onBack: () => void }) {
  const { settings, play } = useGameSettings()
  const progress = useDossierProgress(file)
  const displayFile = useMemo(() => localizeOpportunity(file, settings.language), [file, settings.language])
  const { hydrated, save, collected, pageState, totals, percent } = progress
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [showCinematics, setShowCinematics] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  const pageIndex = Math.min(save.page, progress.unlockedCount - 1)
  const page = displayFile.pages[pageIndex]
  const opened = hydrated && save.opened

  const goTo = (index: number) => {
    if (index < 0 || index >= file.pages.length || !progress.isUnlocked(index)) return
    if (index !== pageIndex || !save.opened) play('click')
    progress.goTo(index)
    pageRef.current?.scrollTo({ top: 0 })
  }

  const closeAnalysis = () => {
    setAnalysis(null)
    notifyDossierChange()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (analysis || drawer)) {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (analysis) {
          play('back')
          closeAnalysis()
        } else setDrawer(false)
        return
      }
      if (analysis) return
      const target = event.target as HTMLElement | null
      if (!opened || target?.closest('input, textarea, select')) return
      if (event.key === 'ArrowRight') goTo(pageIndex + 1)
      if (event.key === 'ArrowLeft') goTo(pageIndex - 1)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const ctx: BlockContext = {
    file: displayFile,
    arabic: settings.language === 'ar',
    collected,
    onCollect: (id) => {
      play('click')
      progress.collect(id)
    },
    onAnalysis: (id) => {
      play('start')
      setAnalysis(id)
    },
  }

  const Analysis = analysis ? analyses[analysis] : null
  const isArabic = settings.language === 'ar'
  const pageLabel = `${isArabic ? 'صفحة' : 'Page'} ${String(pageIndex + 1).padStart(2, '0')} / ${String(file.pages.length).padStart(2, '0')}`
  const missing = progress.requirementsFor(page.id).filter(id => !collected.has(id))
  const hasRequired = progress.requirementsFor(page.id).length > 0

  const panel = (
    <CollectedPanel file={displayFile} pageId={page.id} collected={collected} totals={totals} onReset={() => { play('back'); progress.reset() }} />
  )

  return (
    <section
      className="dossier fixed inset-0 z-30 isolate flex flex-col overflow-hidden bg-[#03070c] font-file text-[#eaf4ff]"
      data-reduced-motion={settings.reducedMotion}
      dir={settings.language === 'ar' ? 'rtl' : 'ltr'}
      lang={settings.language}
      aria-label={`${file.name} mission file`}
      style={{ '--backdrop': `url(${file.backdrop})` } as CSSProperties}
    >
      <div aria-hidden className="dossier-backdrop absolute inset-0 -z-10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000c_100%)]" />

      <header className="flex shrink-0 items-center gap-3 px-3 pt-3 sm:px-5">
        <button
          type="button"
          onClick={() => { play('back'); onBack() }}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--hud)]/40 bg-[#040e18]/90 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-[var(--hud)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hud)]"
        >
          <ArrowLeft aria-hidden className="size-4" />
          <span className="max-sm:sr-only">{isArabic ? 'الخروج من التحقيق' : 'Exit investigation'}</span>
        </button>

        <div className="mx-auto flex w-full max-w-[360px] flex-col gap-1">
          <div className="flex items-baseline justify-between text-[12px] font-semibold uppercase tracking-[0.2em]">
            <span className="text-[#8fb4c6]">{isArabic ? 'تقدم التحقيق' : 'Investigation progress'}</span>
            <span className="tabular-nums text-[var(--hud)]">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Investigation progress"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-[#0b2232]"
          >
            <div className="h-full rounded-full bg-[var(--hud)] shadow-[0_0_10px_var(--hud)] transition-[width] duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {opened && (
            <button
              type="button"
              onClick={() => { play('back'); progress.close() }}
              className="hidden items-center gap-1.5 rounded-full border border-[var(--hud)]/30 bg-[#040e18]/90 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#b5cbd8] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--hud)] sm:inline-flex"
            >
              <BookMarked aria-hidden className="size-3.5" /> {isArabic ? 'إغلاق الملف' : 'Close file'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-expanded={drawer}
            aria-controls="dossier-drawer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hud)]/40 bg-[#040e18]/90 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-[var(--hud)] xl:hidden"
          >
            <ClipboardList aria-hidden className="size-3.5" />
            <span className="tabular-nums">{totals.collected}/{totals.items}</span>
            <span className="sr-only">collected — open tracking panel</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-stretch justify-center gap-3 px-3 py-3 sm:px-5">
        {!hydrated ? null : !opened ? (
          <div className="flex h-full w-full items-center justify-center gap-0">
            <DossierCover file={displayFile} resumePage={save.visited.length ? pageIndex : 0} onOpen={() => goTo(pageIndex)} />
            <div className="hidden self-center md:block">
              <DossierTabs pages={displayFile.pages} current={null} pageState={pageState} onSelect={goTo} side="right" isUnlocked={progress.isUnlocked} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 w-full max-w-[1240px] flex-1 gap-0 max-md:flex-col">
              <div className="z-10 shrink-0 md:pt-10">
                <DossierTabs pages={file.pages} current={pageIndex} pageState={pageState} onSelect={goTo} side="left" isUnlocked={progress.isUnlocked} />
              </div>

              <article
                aria-labelledby="dossier-page-title"
                className="dossier-leather dossier-open relative flex min-h-0 min-w-0 flex-1 rounded-md p-1.5 sm:p-2.5"
              >
                <div
                  key={page.id}
                  ref={pageRef}
                  className="dossier-turn dossier-scroll relative grid min-h-0 flex-1 overflow-y-auto rounded-sm md:grid-cols-2 md:overflow-hidden"
                >
                  <div className="dossier-paper dossier-page-left dossier-scroll flex flex-col gap-4 p-4 sm:p-6 md:overflow-y-auto">
                    <header className="flex flex-col gap-1">
                      <p className="flex items-center justify-between gap-2 font-file text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                        <span>{page.kicker}</span>
                        <span className="tabular-nums md:hidden">{pageLabel}</span>
                      </p>
                      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                        <h2 id="dossier-page-title" className="font-file text-[clamp(28px,3.4vw,40px)] font-bold uppercase leading-[0.95] tracking-[0.03em] text-[var(--ink)]">
                          {page.title}
                        </h2>
                        {pageIndex === 0 && (
                          <span className="dossier-stamp rotate-[-8deg] rounded-sm px-2 py-0.5 font-file text-[15px] font-bold uppercase tracking-[0.22em]">{displayFile.clearance}</span>
                        )}
                      </div>
                      <span aria-hidden className="mt-1 h-[3px] w-full bg-[var(--ink)]" />
                      {page.lede && <p className="mt-1 text-pretty font-serif text-[15px] italic leading-snug text-[var(--ink-soft)]">{page.lede}</p>}
                    </header>
                    {page.left.map((block, i) => <DossierBlockView key={i} block={block} ctx={ctx} />)}
                  </div>

                  <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-6 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(60,40,18,0.35)_45%,rgba(30,20,8,0.55)_50%,rgba(60,40,18,0.35)_55%,transparent)] md:block" />

                  <div className="dossier-paper dossier-page-right dossier-scroll flex flex-col gap-4 p-4 pt-2 sm:p-6 md:overflow-y-auto md:pt-6">
                    <p className="hidden items-center justify-between font-file text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)] md:flex">
                      <span>{displayFile.code} · {displayFile.designation}</span>
                      <span className="rounded-sm border border-[var(--ink)]/40 px-1.5 py-0.5 tabular-nums">{pageLabel}</span>
                    </p>
                    {page.right.map((block, i) => <DossierBlockView key={i} block={block} ctx={ctx} />)}
                  </div>
                </div>
              </article>
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--hud)]/20 bg-[#06121d]/90 px-3 py-2 text-xs text-[#d5e5ee] md:hidden">
                <span>{progress.completedPage(page.id) ? (isArabic ? 'مكتملة' : 'Page complete') : (isArabic ? 'اجمع الأدلة المطلوبة لفتح الصفحة التالية' : 'Collect required evidence to unlock the next page')}</span>
              </div>
            </div>

            <aside aria-label="Investigation tracking" className="dossier-scroll hidden w-64 shrink-0 overflow-y-auto xl:block">
              {panel}
            </aside>
          </>
        )}
      </div>

      {opened && (
        <div className="mx-auto flex w-full max-w-[1240px] shrink-0 flex-wrap items-center justify-center gap-2 px-3 py-1 text-center text-[11px] text-[#b9d1db]">
          {progress.completedPage(page.id) ? <span className="text-[#8de2c9]">{isArabic ? 'اكتملت الصفحة — تم فتح التالية' : 'Page completed — next page unlocked'}</span> :
            hasRequired ? <span>{isArabic ? 'الأدلة المتبقية' : 'Remaining evidence'}: {missing.length} / {progress.requirementsFor(page.id).length}</span> :
            <button type="button" onClick={() => progress.review(page.id)} className="rounded-full border border-[var(--hud)]/50 px-3 py-1 text-[var(--hud)] hover:bg-[var(--hud)]/10">{isArabic ? 'تأكيد قراءة الصفحة' : 'Mark page reviewed'}</button>}
        </div>
      )}
      {opened && (
        <nav aria-label="Page navigation" className="flex shrink-0 items-center justify-between gap-3 px-3 pb-3 sm:px-5">
          <button
            type="button"
            onClick={() => goTo(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--hud)]/40 bg-[#040e18]/90 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-[var(--hud)] focus-visible:outline-2 focus-visible:outline-[var(--hud)] disabled:opacity-35"
          >
            <ArrowLeft aria-hidden className="size-4" /> <span className="max-sm:sr-only">{isArabic ? 'السابق' : 'Previous'}</span>
          </button>
          <div className="flex flex-col items-center gap-1">
            <p aria-live="polite" className="text-[12px] font-semibold uppercase tabular-nums tracking-[0.22em] text-[#b5cbd8]">{pageLabel}</p>
            <ol className="flex gap-1.5">
              {displayFile.pages.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={!progress.isUnlocked(i)}
                    aria-label={`Go to ${p.tab}`}
                    aria-current={i === pageIndex ? 'page' : undefined}
                    className={`block size-2 rounded-full transition-colors ${!progress.isUnlocked(i) ? 'opacity-30' : ''} ${i === pageIndex ? 'bg-[var(--hud)] shadow-[0_0_8px_var(--hud)]' : pageState(p.id) === 'unread' ? 'border border-[#8fb4c6]/60' : 'bg-[#8fb4c6]/70'}`}
                  />
                </li>
              ))}
            </ol>
          </div>
          <button
            type="button"
            onClick={() => goTo(pageIndex + 1)}
            disabled={pageIndex === file.pages.length - 1 || !progress.isUnlocked(pageIndex + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--hud)]/60 bg-[#040e18]/90 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--hud)] transition-colors hover:bg-[var(--hud)]/10 focus-visible:outline-2 focus-visible:outline-[var(--hud)] disabled:opacity-35"
          >
            <span className="max-sm:sr-only">{isArabic ? 'التالي' : 'Next'}</span> <ArrowRight aria-hidden className="size-4" />
          </button>
        </nav>
      )}

      {drawer && (
        <div id="dossier-drawer" role="dialog" aria-modal="true" aria-label="Investigation tracking" className="absolute inset-0 z-40 flex justify-end bg-black/55 backdrop-blur-sm xl:hidden" onClick={() => setDrawer(false)}>
          <div className="dossier-scroll h-full w-[min(300px,88vw)] overflow-y-auto border-l border-[var(--hud)]/25 bg-[#030a12] p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button type="button" autoFocus onClick={() => setDrawer(false)} aria-label="Close tracking panel" className="rounded-full border border-[var(--hud)]/35 p-1.5 hover:bg-[var(--hud)]/10 focus-visible:outline-2 focus-visible:outline-[var(--hud)]">
                <X aria-hidden className="size-4" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}

      {progress.missionComplete && !showCinematics && !analysis && (
        <button type="button" onClick={() => setShowCinematics(true)} className="absolute bottom-16 right-5 z-30 rounded-full border border-amber-300 bg-[#122638] px-5 py-3 text-sm font-bold text-amber-200 shadow-lg hover:bg-[#1c3850]">{isArabic ? 'اكتملت المهمة — شاهد الأفلام' : 'MISSION COMPLETE · WATCH CINEMATICS'}</button>
      )}
      {showCinematics && progress.missionComplete && <MissionCinematics arabic={isArabic} onBack={() => setShowCinematics(false)} onExit={onBack} />}
      {Analysis && <Analysis onClose={closeAnalysis} />}
    </section>
  )
}
