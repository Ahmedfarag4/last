'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { BookOpen, ChevronDown, ImageOff } from 'lucide-react'
import { OrbitalCapsuleButton } from '../orbital-capsule-button'
import { BackChip } from './archive-ui'
import { OPPORTUNITY_MANGA, pageCount } from './manga-data'

type MangaOverviewProps = {
  onBack: () => void
  onRead: (page: number) => void
}

export function MangaOverview({ onBack, onRead }: MangaOverviewProps) {
  const manga = OPPORTUNITY_MANGA
  const ready = manga.pagesAvailable
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])

  return (
    <section
      aria-labelledby="manga-title"
      className="arc-panel-in arc-glass relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden"
      style={{ '--tone': '#49d7ff' } as React.CSSProperties}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hud/20 px-5 py-3 sm:px-7">
        <BackChip label="Dossier" onClick={onBack} />
        <p className="text-[10px] font-semibold tracking-[0.32em] text-hud">MRV-B · ILLUSTRATED ARCHIVE</p>
      </header>

      <div className="arc-scroll grid min-h-0 flex-1 content-start gap-6 overflow-y-auto p-5 sm:p-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <CoverArt />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-ember">READ MANGA</p>
            <h2
              id="manga-title"
              ref={headingRef}
              tabIndex={-1}
              className="mt-2 font-display text-[clamp(24px,4vw,40px)] uppercase leading-none tracking-[0.08em] text-frost outline-none"
            >
              {manga.title}
            </h2>
            <p className="mt-2 text-sm italic tracking-[0.18em] text-hud">{manga.subtitle}</p>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-frost/85">{manga.intro}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3 sm:flex-row">
              <OrbitalCapsuleButton
                label="Start Reading"
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
                label="Back to Dossier"
                sound="back"
                width="100%"
                height="50px"
                phase={0.6}
                onActivate={onBack}
              />
            </div>
            {!ready && (
              <p id="manga-status" className="text-center text-[10px] tracking-[0.24em] text-ember/90 uppercase">
                Manga pages not uploaded yet
              </p>
            )}
          </div>

          <section aria-labelledby="chapters-heading" className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h3 id="chapters-heading" className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ember">
                Chapters
              </h3>
              <span aria-hidden className="h-px flex-1 bg-ember/20" />
              <span className="text-[10px] tracking-[0.2em] text-frost/60">
                {manga.chapters.reduce((n, c) => n + pageCount(c), 0)} PAGES
              </span>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {manga.chapters.map((c, i) => (
                <li key={c.number} className="arc-swap" style={{ animationDelay: `${0.08 * i}s` }}>
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => onRead(c.firstPage)}
                    aria-label={`Read Chapter ${c.number}, pages ${c.firstPage} to ${c.lastPage}`}
                    className="flex w-full items-center gap-4 rounded-xl border border-hud/20 bg-midnight/50 p-4 text-left transition-colors hover:enabled:border-hud/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud disabled:cursor-not-allowed"
                  >
                  <span className="font-display text-3xl leading-none text-hud/80">{String(c.number).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tracking-[0.12em] text-frost uppercase">Chapter {c.number}</p>
                    <p className="mt-0.5 text-xs text-frost/65">
                      Pages {c.firstPage}–{c.lastPage} · {pageCount(c)} pages
                    </p>
                  </div>
                  <span
                    className={
                      ready
                        ? 'rounded-full border border-hud/40 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-hud uppercase'
                        : 'rounded-full border border-ember/40 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-ember uppercase'
                    }
                  >
                    {ready ? 'Ready' : 'Not uploaded'}
                  </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <details className="group rounded-2xl border border-hud/20 bg-midnight/40 md:col-span-2">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-hud/60 [&::-webkit-details-marker]:hidden">
            <BookOpen aria-hidden className="size-4 text-hud" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ember">Story Summary</span>
            <span aria-hidden className="h-px flex-1 bg-ember/20" />
            <ChevronDown aria-hidden className="size-4 text-frost/60 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5">
            <SummaryImage ready={manga.summaryUploaded} />
          </div>
        </details>
      </div>
    </section>
  )
}

function CoverArt() {
  const { coverImage, coverWidth, coverHeight, title, subtitle } = OPPORTUNITY_MANGA
  return (
    <figure className="mx-auto w-full max-w-sm md:max-w-none">
      <div className="relative overflow-hidden rounded-2xl border border-hud/30 bg-midnight/70 p-2 shadow-[0_0_40px_-12px_rgba(73,215,255,0.45)]">
        <Image
          src={coverImage}
          alt={`Cover artwork for ${title}: ${subtitle} — the Opportunity rover on Mars beneath Earth, a rocket launch, and an approaching dust storm`}
          width={coverWidth}
          height={coverHeight}
          priority
          sizes="(min-width: 1152px) 440px, (min-width: 768px) 40vw, 384px"
          className="h-auto w-full rounded-xl object-contain"
        />
      </div>
      <figcaption className="mt-2 text-center text-[9px] tracking-[0.28em] text-frost/55 uppercase">
        Official Cover
      </figcaption>
    </figure>
  )
}

function SummaryImage({ ready }: { ready: boolean }) {
  return (
    <div className="relative mx-auto aspect-[4/3] max-w-2xl overflow-hidden rounded-2xl border border-hud/30 bg-midnight/60">
      {ready ? (
        <Image
          src={OPPORTUNITY_MANGA.summaryImage}
          alt="Story summary of Opportunity — The Journey Beyond 90 Days"
          fill
          sizes="(min-width: 768px) 440px, 90vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 border border-dashed border-hud/25 p-6 text-center">
          <ImageOff aria-hidden className="size-8 text-hud/60" />
          <p className="text-[11px] font-semibold tracking-[0.3em] text-frost/80 uppercase">Story summary</p>
          <p className="text-[10px] tracking-[0.24em] text-ember uppercase">Not uploaded yet</p>
        </div>
      )}
      <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-navy/80 px-2.5 py-1 text-[9px] tracking-[0.2em] text-frost/70">
        <BookOpen aria-hidden className="size-3" />
        STORY SUMMARY
      </span>
    </div>
  )
}
