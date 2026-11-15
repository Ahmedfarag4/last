'use client'

import { BookOpen, ImageOff, LibraryBig } from 'lucide-react'
import { OrbitalCapsuleButton } from '../orbital-capsule-button'
import { BackChip } from './archive-ui'

type PendingMission = 'apollo' | 'insight'

export function PendingMangaOverview({ missionId, onBack }: { missionId: PendingMission; onBack: () => void }) {
  const title = missionId === 'apollo' ? 'Apollo' : 'InSight'
  return (
    <section aria-label={title + ' Manga Library'} className="arc-panel-in arc-glass relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden" style={{ '--tone': '#49d7ff' } as React.CSSProperties}>
      <header className="flex items-center justify-between gap-3 border-b border-hud/20 px-5 py-3 sm:px-7">
        <BackChip label="Mission dossier" onClick={onBack} />
        <p className="text-[10px] tracking-[.3em] text-hud">MANGA ARCHIVE</p>
      </header>
      <div className="arc-scroll grid min-h-0 flex-1 items-center gap-7 overflow-y-auto p-5 sm:p-8 md:grid-cols-2">
        <div className="flex aspect-[3/4] max-h-[540px] w-full items-center justify-center rounded-2xl border border-dashed border-hud/30 bg-midnight/60">
          <div className="flex flex-col items-center gap-3 text-center text-hud/60">
            <ImageOff size={44} strokeWidth={1.2} />
            <span className="font-mono text-xs tracking-[.2em]">COVER AWAITING IMPORT</span>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-ember"><LibraryBig size={19}/><span className="text-[10px] tracking-[.25em]">MISSION STORY LIBRARY</span></div>
          <h2 className="font-display text-[clamp(24px,4vw,42px)] uppercase tracking-[.08em] text-frost">{title} Manga</h2>
          <p className="max-w-xl text-sm leading-7 text-frost/70">The manga cover, chapters and pages for this mission have not been imported yet. This library is separate from Opportunity's existing manga collection.</p>
          <div className="flex items-center gap-3 rounded-xl border border-hud/20 bg-midnight/50 p-5">
            <BookOpen className="shrink-0 text-hud" size={24}/>
            <div><p className="text-sm text-frost">MANGA AWAITING IMPORT</p><p className="mt-1 text-xs text-frost/50">Chapter selection and reader will be enabled when verified page assets are available.</p></div>
          </div>
          <OrbitalCapsuleButton label="Back to Mission Dossier" sound="back" width="min(100%, 360px)" height="50px" onActivate={onBack}/>
        </div>
      </div>
    </section>
  )
}
