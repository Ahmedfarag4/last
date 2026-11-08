'use client'

import { useState } from 'react'
import { Lock, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrbitalCapsuleButton } from './orbital-capsule-button'
import { useGameSettings } from './settings-provider'

const ARCHIVES = [
  {
    id: 'opportunity',
    title: 'Opportunity',
    site: 'Meridiani Planum · 2004–2018',
    status: 'Available in Mission 01',
    locked: false,
    summary:
      'Recovered transmission fragments from the rover’s final months. Records unlock as the investigation progresses.',
  },
  {
    id: 'spirit',
    title: 'Spirit',
    site: 'Gusev Crater · 2004–2010',
    status: 'Sealed',
    locked: true,
    summary: 'Twin-rover archive. Sealed until a future mission is completed.',
  },
  {
    id: 'sojourner',
    title: 'Sojourner',
    site: 'Ares Vallis · 1997',
    status: 'Sealed',
    locked: true,
    summary: 'The first wheels on Mars. Archive access requires an outpost upgrade.',
  },
  {
    id: 'outpost',
    title: 'Outpost M-07 Logs',
    site: 'Fictional station records',
    status: 'Corrupted',
    locked: true,
    summary: 'Internal station logs. Data integrity check failed — restoration pending.',
  },
] as const

export function ArchivesScreen({ onBack }: { onBack: () => void }) {
  const { play } = useGameSettings()
  const [selectedId, setSelectedId] = useState<string>(ARCHIVES[0].id)
  const selected = ARCHIVES.find((a) => a.id === selectedId) ?? ARCHIVES[0]

  return (
    <section
      aria-labelledby="archives-title"
      className="parallax-near relative z-10 flex w-full max-w-5xl flex-col px-6 sm:px-12"
    >
      <div className="intro-el rounded-[28px] border border-hud/30 bg-navy/70 p-6 shadow-[0_0_40px_rgba(73,215,255,0.1)] backdrop-blur-md sm:p-9">
        <p className="text-[11px] font-semibold tracking-[0.34em] text-hud">ARCHIVE ACCESS</p>
        <h2 id="archives-title" className="mt-3 font-display text-2xl tracking-[0.06em] text-frost sm:text-3xl">
          MISSION ARCHIVES
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
          <ul className="flex flex-col gap-2.5" aria-label="Archive records">
            {ARCHIVES.map((archive) => {
              const active = archive.id === selectedId
              return (
                <li key={archive.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && play('hover')}
                    onClick={() => {
                      setSelectedId(archive.id)
                      play(archive.locked ? 'back' : 'archives')
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-full border px-5 py-2.5 text-left transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud',
                      active
                        ? 'border-hud/80 bg-hud/10 shadow-[0_0_18px_rgba(73,215,255,0.2)]'
                        : 'border-hud/20 bg-midnight/40 hover:border-hud/50',
                    )}
                  >
                    {archive.locked ? (
                      <Lock aria-hidden className="size-4 shrink-0 text-hud/60" />
                    ) : (
                      <Radio aria-hidden className="size-4 shrink-0 text-ember" />
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold tracking-[0.08em] text-frost">
                        {archive.title}
                      </span>
                      <span className="truncate text-xs text-frost/60">{archive.site}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div
            aria-live="polite"
            className="flex flex-col rounded-3xl border border-hud/20 bg-midnight/50 p-5"
          >
            <p
              className={cn(
                'text-[10px] font-semibold tracking-[0.3em] uppercase',
                selected.locked ? 'text-hud/70' : 'text-ember',
              )}
            >
              {selected.status}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[0.06em] text-frost">{selected.title}</h3>
            <p className="mt-1 text-xs text-frost/60">{selected.site}</p>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-frost/80">{selected.summary}</p>
            <p className="mt-auto pt-5 text-xs text-frost/50">Archive viewer arrives in a future build.</p>
          </div>
        </div>

        <div className="mt-7">
          <OrbitalCapsuleButton
            label="Back to Main Menu"
            sound="back"
            width="min(78vw, 300px)"
            height="50px"
            phase={0.55}
            onActivate={onBack}
          />
        </div>
      </div>
    </section>
  )
}
