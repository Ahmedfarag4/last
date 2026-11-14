'use client'

import type { Dictionary } from '@/lib/i18n'
import { CREDITS } from '@/lib/credits'
import { HoloDialog } from './holo-dialog'
import { useGameSettings } from './settings-provider'

const ROLE_KEYS: Record<string, keyof Dictionary> = {
  'Game Direction': 'creditDirection',
  'Design & Development': 'creditDesign',
  Narrative: 'creditNarrative',
  Audio: 'creditAudio',
  Inspiration: 'creditInspiration',
}

const ENTRY_KEYS: Record<string, keyof Dictionary> = {
  'Interface sounds synthesized in real time with the Web Audio API': 'creditAudioEntry',
  'The real-world Mars Exploration Rover missions and the people who operated them': 'creditInspirationEntry',
}

export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useGameSettings()
  const translate = (value: string, keys: Record<string, keyof Dictionary>) =>
    keys[value] ? t[keys[value]] : value

  return (
    <HoloDialog open={open} onClose={onClose} eyebrow={t.aboutEyebrow} title="THE LAST SIGNAL">
      <p className="text-pretty leading-relaxed text-frost/85">
        <span className="italic text-hud">{t.tagline}</span> {t.aboutIntro}
      </p>

      <dl className="mt-6 flex flex-col gap-4">
        {CREDITS.map((section) => (
          <div key={section.role} className="border-s border-hud/40 ps-4">
            <dt className="text-[10px] font-semibold tracking-[0.3em] text-hud uppercase">
              {translate(section.role, ROLE_KEYS)}
            </dt>
            {section.entries.map((entry) => (
              <dd key={entry} className="mt-1 text-sm text-frost/85">
                {translate(entry, ENTRY_KEYS)}
              </dd>
            ))}
          </div>
        ))}
      </dl>

      <p className="mt-6 text-xs leading-relaxed text-frost/50">{t.aboutDisclaimer}</p>
    </HoloDialog>
  )
}
