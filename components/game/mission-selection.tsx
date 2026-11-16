'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, LockKeyhole, RadioTower } from 'lucide-react'
import { MISSIONS, type MissionId } from './archives/archive-data'
import { useGameSettings } from './settings-provider'
import { useDossierProgress, startNewInvestigation } from './dossier/progress'
import { OPPORTUNITY_FILE } from './dossier/missions/opportunity'

type MissionSelectionProps = {
  onBack: () => void
  onStartOpportunity: () => void
}

const MISSION_DESCRIPTIONS: Record<MissionId, string> = {
  opportunity: 'Reconstruct a rover\'s final days during the great Martian dust storm.',
  insight: 'Listen to the quakes and hidden structure of Mars.',
  apollo: 'Follow the first human footsteps on the Moon.',
}

const ORDER: MissionId[] = ['insight', 'opportunity', 'apollo']

export function MissionSelection({ onBack, onStartOpportunity }: MissionSelectionProps) {
  const { play, settings } = useGameSettings()
  const missions = ORDER.map((id) => MISSIONS.find((mission) => mission.id === id)!)
  const isArabic = settings.language === 'ar'
  const [confirming, setConfirming] = useState(false)
  const progress = useDossierProgress(OPPORTUNITY_FILE)
  const saved = progress.hydrated && (progress.save.visited.length > 0 || progress.save.collected.length > 0 || progress.totals.collected > 0)
  const startFresh = () => { startNewInvestigation(OPPORTUNITY_FILE); setConfirming(false); play('start'); onStartOpportunity() }

  return (
    <section
      aria-labelledby="mission-select-heading"
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#030914] text-[#eaf4ff]"
    >
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(25,77,103,0.42),transparent_65%),linear-gradient(125deg,#050b16,#0b1b2c_54%,#050b16)]" />
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-30 [background-image:linear-gradient(rgba(73,215,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(73,215,255,.045)_1px,transparent_1px)] [background-size:60px_60px]" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-9">
        <button
          type="button"
          onClick={() => { play('back'); onBack() }}
          className="inline-flex items-center gap-2 rounded-full border border-[#49d7ff]/40 bg-[#091e2e]/80 px-4 py-2 text-xs font-semibold tracking-[.12em] transition hover:border-[#49d7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#49d7ff]"
        >
          <ArrowLeft aria-hidden className="size-4" /> {isArabic ? 'القائمة الرئيسية' : 'MAIN MENU'}
        </button>
        <span className="text-right font-mono text-[10px] tracking-[.24em] text-[#71dfff]/70">
          OUTPOST M-07 <span className="hidden sm:inline">/ MISSION TERMINAL</span>
        </span>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-5 px-5 pb-8 sm:gap-7 sm:px-9">
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[.38em] text-[#f2b35d]">THE LAST SIGNAL · INVESTIGATIONS</p>
          <h1 id="mission-select-heading" className="mt-2 font-display text-[clamp(24px,3.3vw,44px)] tracking-[.12em]">
            {isArabic ? 'اختر المهمة' : 'SELECT YOUR MISSION'}
          </h1>
          <p className="mt-2 text-sm text-[#bed0df]/75">
            {isArabic ? 'ثلاث مهمات. آثار لا تنتهي.' : 'Three missions. Discoveries that endure.'}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.18fr)_minmax(0,1fr)] md:items-center md:gap-4">
          {missions.map((mission) => {
            const playable = mission.id === 'opportunity'
            return (
              <article
                key={mission.id}
                className={`group relative isolate flex min-h-[174px] flex-col overflow-hidden rounded-2xl border bg-[#071321]/90 shadow-[0_18px_55px_rgba(0,0,0,.28)] md:h-[min(50vh,415px)] ${playable ? 'border-[#f2b35d]/70 shadow-[0_0_40px_rgba(242,179,93,.12)]' : 'border-[#49d7ff]/25'}`}
              >
                <Image
                  src={mission.image}
                  alt={mission.imageAlt}
                  fill
                  priority={playable}
                  sizes="(min-width: 768px) 35vw, 90vw"
                  className={`object-cover transition-transform duration-700 motion-reduce:transition-none ${playable ? 'group-hover:scale-[1.04]' : 'opacity-60 saturate-75'}`}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#020712] via-[#03111d]/55 to-[#061521]/15" />
                <div className="relative flex h-full flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full border border-white/20 bg-[#041120]/75 px-3 py-1 font-mono text-[10px] tracking-[.15em]">{mission.index}</span>
                    <span className={`rounded-full border px-3 py-1 text-[9px] font-bold tracking-[.15em] ${playable ? 'border-[#f2b35d]/65 bg-[#f2b35d]/15 text-[#ffd399]' : 'border-white/25 bg-[#06101d]/75 text-[#bed0df]'}`}>
                      {playable ? 'AVAILABLE' : 'COMING SOON'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[.25em] text-[#86dfff]">{mission.site} · {mission.body}</p>
                    <h2 className="mt-1 font-display text-[clamp(19px,2.3vw,30px)] tracking-[.07em]">{mission.id === 'apollo' ? 'APOLLO 11' : mission.name.toUpperCase()}</h2>
                    <p className="mt-2 max-w-sm text-xs leading-5 text-[#d5e5f2]/85">{MISSION_DESCRIPTIONS[mission.id]}</p>
                    {playable ? (
                      <div className="mt-4 flex flex-col gap-2">
                        {saved && (
                          <button type="button" onClick={() => { play('start'); onStartOpportunity() }}
                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#f2b35d] bg-[#f2b35d]/20 px-4 py-2 text-xs font-bold tracking-[.16em] text-[#ffe1ae] transition hover:bg-[#f2b35d]/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b35d]">
                            <RadioTower aria-hidden className="size-4" />
                            {isArabic ? 'متابعة اللعبة' : 'CONTINUE GAME'}
                            <ArrowRight aria-hidden className="size-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => saved ? setConfirming(true) : startFresh()}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#49d7ff]/55 bg-[#061728]/90 px-4 py-2 text-xs font-bold tracking-[.16em] text-[#a4ebff] transition hover:border-[#49d7ff] hover:bg-[#49d7ff]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#49d7ff]">
                          {isArabic ? 'بدء لعبة جديدة' : 'START NEW GAME'}
                          <ArrowRight aria-hidden className="size-4" />
                        </button>
                        {confirming && (
                          <div role="alertdialog" aria-modal="true" aria-label={isArabic ? 'تأكيد بدء لعبة جديدة' : 'Confirm new game'} className="rounded-xl border border-[#f2b35d]/60 bg-[#06101b]/95 p-3 text-center">
                            <p className="text-xs leading-5 text-[#f8e7c8]">{isArabic ? 'سيتم حذف تقدم التحقيق والأدلة المحفوظة لهذه المهمة فقط. لن تتأثر الأرشيفات والمانجا والإعدادات.' : 'Restart Opportunity? This removes its investigation progress and puzzle evidence only. Archives, manga, and settings are preserved.'}</p>
                            <div className="mt-3 flex justify-center gap-2">
                              <button type="button" onClick={startFresh} className="rounded-full border border-[#f2b35d] px-3 py-1.5 text-xs text-[#ffe1ae]">{isArabic ? 'تأكيد' : 'CONFIRM'}</button>
                              <button type="button" onClick={() => setConfirming(false)} className="rounded-full border border-[#49d7ff]/50 px-3 py-1.5 text-xs text-[#c2eaf8]">{isArabic ? 'إلغاء' : 'CANCEL'}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-[#04101b]/70 px-4 py-2 text-xs font-semibold tracking-[.13em] text-[#b8cadb]/65" aria-label={`${mission.name} coming soon`}>
                        <LockKeyhole aria-hidden className="size-4" />
                        {isArabic ? 'قريبًا' : 'NOT YET PLAYABLE'}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <p className="text-center text-[10px] tracking-[.13em] text-[#a5bfd0]/65">
          {isArabic ? 'الأرشيف العلمي منفصل ومتاح من القائمة الرئيسية.' : 'Looking for source material? Mission Archives is available from the Main Menu.'}
        </p>
      </div>
    </section>
  )
}
