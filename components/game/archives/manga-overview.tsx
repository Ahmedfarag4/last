'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { BookOpen, ImageOff } from 'lucide-react'
import { OrbitalCapsuleButton } from '../orbital-capsule-button'
import { BackChip } from './archive-ui'
import { OPPORTUNITY_MANGA, pageCount } from './manga-data'

type MangaOverviewProps = {
  onBack: () => void
}

export function MangaOverview({ onBack }: MangaOverviewProps) {
  const manga = OPPORTUNITY_MANGA
  const ready = manga.assetsUploaded
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

      <div className="arc-scroll grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 sm:p-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-4">
          <SummaryImage ready={ready} />
          <div className="flex flex-col gap-3 pt-1">
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
              onActivate={() => {}}
            />
            <OrbitalCapsuleButton
              label="Back to Dossier"
              sound="back"
              width="100%"
              height="50px"
              phase={0.6}
              onActivate={onBack}
            />
            {!ready && (
              <p id="manga-status" className="text-center text-[10px] tracking-[0.24em] text-ember/90 uppercase">
                Manga pages not uploaded yet
              </p>
            )}
          </div>
        </div>

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
                <li
                  key={c.number}
                  className="arc-swap flex items-center gap-4 rounded-xl border border-hud/20 bg-midnight/50 p-4 transition-colors hover:border-hud/50"
                  style={{ animationDelay: `${0.08 * i}s` }}
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
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </section>
  )
}

function SummaryImage({ ready }: { ready: boolean }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-hud/30 bg-midnight/60">
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
