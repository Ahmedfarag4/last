'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { BookOpen, ChevronDown, ImageOff } from 'lucide-react'
import { languageAttrs } from '@/lib/i18n'
import { OrbitalCapsuleButton } from '../orbital-capsule-button'
import { useGameSettings } from '../settings-provider'
import { BackChip } from './archive-ui'
import { OPPORTUNITY_MANGA, pageCount, totalPages, type MangaConfig } from './manga-data'
import { useMangaProgress } from './manga-progress'

type MangaOverviewProps = {
  onBack: () => void
  onRead: (page: number) => void
  onReadArabic?: (page: number) => void
  manga?: MangaConfig
}

export function MangaOverview({ onBack, onRead, onReadArabic, manga = OPPORTUNITY_MANGA }: MangaOverviewProps) {
  const { settings, t } = useGameSettings()
  const progress = useMangaProgress(manga)
  const copy = manga.copy
  const language = copy?.language ?? settings.language
  const ready = manga.pagesAvailable
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])

  return (
    <section
      aria-labelledby="manga-title"
      {...languageAttrs(language)}
      className="arc-panel-in arc-glass relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden"
      style={{ '--tone': '#49d7ff' } as React.CSSProperties}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hud/20 px-5 py-3 sm:px-7">
        <BackChip label={t.mangaBackDossier} onClick={onBack} />
        <p className="text-[10px] font-semibold tracking-[0.32em] text-hud">{copy?.archiveTag ?? t.mangaArchiveTag}</p>
      </header>

      <div className="arc-scroll grid min-h-0 flex-1 content-start gap-6 overflow-y-auto p-5 sm:p-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <CoverArt manga={manga} alt={copy?.coverAlt ?? t.mangaCoverAlt} caption={copy?.coverCaption ?? t.mangaOfficialCover} />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-ember">{t.mangaEyebrow}</p>
            <h2
              id="manga-title"
              ref={headingRef}
              tabIndex={-1}
              className="mt-2 font-display text-[clamp(24px,4vw,40px)] uppercase leading-none tracking-[0.08em] text-frost outline-none"
            >
              {manga.title}
            </h2>
            <p className="mt-2 text-sm italic tracking-[0.18em] text-hud">{copy ? manga.subtitle : t.mangaSubtitle}</p>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-frost/85">{copy ? manga.intro : t.mangaIntro}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3 sm:flex-row">
              <OrbitalCapsuleButton
                label={t.mangaStart}
                tone="amber"
                emphasis="primary"
                sound="start"
                width="100%"
                height="50px"
                phase={0.15}
                disabled={!ready}
                aria-describedby={ready ? undefined : 'manga-status'}
                onActivate={() => onRead(1)}
              />
              <OrbitalCapsuleButton
                label={t.mangaBackToDossier}
                sound="back"
                width="100%"
                height="50px"
                phase={0.6}
                onActivate={onBack}
              />
            </div>
            {ready && progress && (
              <>
                <OrbitalCapsuleButton
                  label={t.mangaContinue}
                  tone="amber"
                  emphasis="primary"
                  sound="start"
                  width="100%"
                  height="50px"
                  phase={0.4}
                  aria-describedby="manga-progress"
                  onActivate={() => onRead(progress.page)}
                />
                <p id="manga-progress" className="text-center text-[10px] tracking-[0.24em] text-hud/90 uppercase">
                  {progress.finished ? `${t.mangaFinished} · ` : ''}
                  {t.mangaSavedAt} {t.readerChapter} {progress.chapter} ·{' '}
                  <span dir="ltr">
                    {t.readerPage} {progress.page} / {totalPages(manga)}
                  </span>
                </p>
              </>
            )}
            {!ready && (
              <p id="manga-status" className="text-center text-[10px] tracking-[0.24em] text-ember/90 uppercase">
                {t.mangaNotUploaded}
              </p>
            )}
          </div>

          <details className="group rounded-2xl border border-hud/20 bg-midnight/40">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-hud/60 [&::-webkit-details-marker]:hidden">
              <BookOpen aria-hidden className="size-4 text-hud" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ember">{t.mangaSummary}</span>
              <span aria-hidden className="h-px flex-1 bg-ember/20" />
              <ChevronDown aria-hidden className="size-4 text-frost/60 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5">
              <SummaryImage manga={manga} ready={manga.summaryUploaded} alt={copy?.summaryAlt ?? t.mangaSummaryAlt} title={t.mangaSummary} missing={t.mangaSummaryMissing} />
            </div>
          </details>

          <section aria-labelledby="chapters-heading" className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h3 id="chapters-heading" className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ember">
                {t.mangaChapters}
              </h3>
              <span aria-hidden className="h-px flex-1 bg-ember/20" />
              <span className="text-[10px] tracking-[0.2em] text-frost/60">
                {manga.chapters.reduce((n, c) => n + pageCount(c), 0)} {t.mangaPages.toUpperCase()}
              </span>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {manga.chapters.map((c, i) => {
                const done = progress?.completedChapters.includes(c.number) ?? false
                return (
                <li key={c.number} className="arc-swap" style={{ animationDelay: `${0.08 * i}s` }}>
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => onRead(c.firstPage)}
                    aria-label={`${t.mangaReadChapter} ${c.number}, ${t.mangaPagesRange} ${c.firstPage} ${t.mangaTo} ${c.lastPage}${done ? ` · ${t.mangaCompleted}` : ''}`}
                    className="flex w-full items-center gap-4 rounded-xl border border-hud/20 bg-midnight/50 p-4 text-start transition-colors hover:enabled:border-hud/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud disabled:cursor-not-allowed"
                  >
                  <span className="font-display text-3xl leading-none text-hud/80">{String(c.number).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tracking-[0.12em] text-frost uppercase">{t.readerChapter} {c.number}</p>
                    <p className="mt-0.5 text-xs text-frost/65">
                      {t.mangaPagesRange} <span dir="ltr">{c.firstPage}–{c.lastPage}</span> · {pageCount(c)} {t.mangaPagesLower}
                    </p>
                  </div>
                  <span
                    className={
                      ready
                        ? 'rounded-full border border-hud/40 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-hud uppercase'
                        : 'rounded-full border border-ember/40 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-ember uppercase'
                    }
                  >
                    {ready ? (done ? t.mangaCompleted : t.mangaReady) : t.mangaNotUploadedShort}
                  </span>
                  </button>
                </li>
                )
              })}
            </ol>
          </section>
          {manga.id === 'opportunity' && onReadArabic && (
            <section aria-labelledby="arabic-chapters-heading" dir="rtl" lang="ar" className="flex flex-col gap-3 rounded-2xl border border-hud/25 bg-midnight/40 p-4">
              <div className="flex items-center gap-3">
                <h3 id="arabic-chapters-heading" className="text-sm font-semibold tracking-wide text-hud">اقرأ المانجا بالعربية</h3>
                <span aria-hidden="true" className="h-px flex-1 bg-hud/20" />
              </div>
              <p className="text-xs leading-6 text-frost/65">النسخة العربية الكاملة أسفل الفصول الإنجليزية. اختر الفصل لفتحه بنفس قارئ المانجا والتكبير والتنقل.</p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {manga.chapters.map((chapter) => (
                  <li key={chapter.number}>
                    <button type="button" onClick={() => onReadArabic(chapter.firstPage)}
                      className="flex w-full items-center justify-between rounded-xl border border-hud/30 px-4 py-3 text-right text-sm text-frost transition-colors hover:border-hud/70 hover:bg-hud/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud">
                      <span>الفصل {chapter.number}</span>
                      <span dir="ltr" className="font-mono text-xs text-hud">{pageCount(chapter)} صفحات</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="text-[11px] leading-5 text-frost/55">جميع الفصول العربية الأربعة متاحة للقراءة. النسخة الإنجليزية محفوظة كما هي، مع تقدم قراءة مستقل لكل لغة.</p>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}

function CoverArt({ manga, alt, caption }: { manga: MangaConfig; alt: string; caption: string }) {
  const { coverImage, coverWidth, coverHeight } = manga
  return (
    <figure className="mx-auto w-full max-w-sm md:max-w-none">
      <div className="relative overflow-hidden rounded-2xl border border-hud/30 bg-midnight/70 p-2 shadow-[0_0_40px_-12px_rgba(73,215,255,0.45)]">
        <Image
          src={coverImage}
          alt={alt}
          width={coverWidth}
          height={coverHeight}
          priority
          sizes="(min-width: 1152px) 440px, (min-width: 768px) 40vw, 384px"
          className="h-auto w-full rounded-xl object-contain"
        />
      </div>
      <figcaption className="mt-2 text-center text-[9px] tracking-[0.28em] text-frost/55 uppercase">
        {caption}
      </figcaption>
    </figure>
  )
}

function SummaryImage({
  manga,
  ready,
  alt,
  title,
  missing,
}: {
  manga: MangaConfig
  ready: boolean
  alt: string
  title: string
  missing: string
}) {
  if (ready) {
    return (
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-hud/30 bg-midnight/60">
        <Image
          src={manga.summaryImage}
          alt={alt}
          width={manga.summaryWidth}
          height={manga.summaryHeight}
          quality={95}
          sizes="(min-width: 1152px) 620px, (min-width: 768px) 55vw, 90vw"
          className="h-auto w-full object-contain"
        />
      </div>
    )
  }
  return (
    <div className="relative mx-auto aspect-[4/3] max-w-2xl overflow-hidden rounded-2xl border border-hud/30 bg-midnight/60">
      <div className="flex h-full flex-col items-center justify-center gap-3 border border-dashed border-hud/25 p-6 text-center">
        <ImageOff aria-hidden className="size-8 text-hud/60" />
        <p className="text-[11px] font-semibold tracking-[0.3em] text-frost/80 uppercase">{title}</p>
        <p className="text-[10px] tracking-[0.24em] text-ember uppercase">{missing}</p>
      </div>
      <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-navy/80 px-2.5 py-1 text-[9px] tracking-[0.2em] text-frost/70">
        <BookOpen aria-hidden className="size-3" />
        {title.toUpperCase()}
      </span>
    </div>
  )
}
