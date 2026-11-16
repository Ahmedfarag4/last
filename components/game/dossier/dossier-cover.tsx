'use client'

import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import type { MissionFile } from './types'
import { useGameSettings } from '../settings-provider'

export function DossierCover({ file, resumePage, onOpen }: { file: MissionFile; resumePage: number; onOpen: () => void }) {
  const { settings } = useGameSettings()
  const ar = settings.language === 'ar'
  return (
    <article
      aria-labelledby="dossier-cover-title"
      className="dossier-leather dossier-open relative flex h-full max-h-[620px] w-full max-w-[440px] flex-col items-center overflow-hidden rounded-r-xl rounded-l-sm px-6 py-5 text-center sm:px-8"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-3 rounded-lg border border-dashed border-[#e9d2a6]/20" />
      <p className="dossier-emboss font-file text-[12px] font-semibold uppercase tracking-[0.34em]">{file.agency}</p>
      <p className="dossier-emboss mt-3 font-file text-[15px] font-semibold uppercase tracking-[0.3em] opacity-80">{ar ? 'ملف المهمة' : 'Mission file'}</p>
      <h2 id="dossier-cover-title" className="dossier-emboss font-file text-[clamp(34px,6vh,52px)] font-bold uppercase leading-none tracking-[0.06em]">
        {file.name}
      </h2>
      <p className="dossier-emboss mt-1 font-file text-[16px] font-semibold uppercase tracking-[0.4em] opacity-80">{file.code}</p>

      <div className="dossier-photo relative mt-4 min-h-0 w-[82%] flex-1 rotate-[-2deg] p-2 pb-6">
        <div className="relative h-full min-h-[90px] overflow-hidden bg-[#1a120b]">
          <Image src={file.cover.src} alt={file.cover.alt} fill sizes="360px" priority className="object-cover sepia-[0.25]" />
        </div>
        <p className="absolute bottom-1 left-2 font-serif text-[11px] italic text-[#5c4b37]">{file.cover.caption}</p>
        <span className="dossier-stamp absolute -bottom-3 -right-4 rotate-[-10deg] rounded-sm bg-transparent px-3 py-1 font-file text-[22px] font-bold uppercase tracking-[0.22em] !text-[#c0463b]">
          {file.clearance}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e9d2a6]/50 bg-black/25 px-5 py-2.5 font-file text-[14px] font-bold uppercase tracking-[0.22em] text-[#f1dcb3] transition-colors hover:border-[var(--hud)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hud)]"
      >
        <BookOpen aria-hidden className="size-4" />
        {resumePage > 0 ? (ar ? `متابعة · صفحة ${String(resumePage + 1).padStart(2, '0')}` : `Resume · Page ${String(resumePage + 1).padStart(2, '0')}`) : (ar ? 'فتح الملف' : 'Open file')}
      </button>
    </article>
  )
}
