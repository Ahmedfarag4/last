'use client'

import type { CSSProperties, KeyboardEvent } from 'react'
import type { SoundName } from '@/lib/audio'
import { languageAttrs, type Dictionary } from '@/lib/i18n'
import { GameTitle } from './game-title'
import { OrbitalCapsuleButton } from './orbital-capsule-button'
import { OrbitalRing } from './orbital-ring'
import { useGameSettings } from './settings-provider'

export type MenuAction = 'start' | 'archives' | 'settings' | 'about'

const ITEMS: {
  id: MenuAction
  labelKey: keyof Dictionary
  tone: 'amber' | 'cyan'
  emphasis: 'primary' | 'secondary'
  sound: SoundName
  width: string
  height: string
  phase: number
  loopSeconds: number
}[] = [
  {
    id: 'start',
    labelKey: 'menuStart',
    tone: 'amber',
    emphasis: 'primary',
    sound: 'start',
    width: 'min(86vw, 470px)',
    height: 'clamp(54px, 7.4vh, 74px)',
    phase: 0.12,
    loopSeconds: 7.5,
  },
  {
    id: 'archives',
    labelKey: 'menuArchives',
    tone: 'cyan',
    emphasis: 'secondary',
    sound: 'archives',
    width: 'min(78vw, 372px)',
    height: 'clamp(46px, 5.8vh, 58px)',
    phase: 0.31,
    loopSeconds: 6.4,
  },
  {
    id: 'settings',
    labelKey: 'menuSettings',
    tone: 'cyan',
    emphasis: 'secondary',
    sound: 'settings',
    width: 'min(72vw, 330px)',
    height: 'clamp(46px, 5.8vh, 58px)',
    phase: 0.58,
    loopSeconds: 6.9,
  },
  {
    id: 'about',
    labelKey: 'menuAbout',
    tone: 'cyan',
    emphasis: 'secondary',
    sound: 'click',
    width: 'min(72vw, 330px)',
    height: 'clamp(46px, 5.8vh, 58px)',
    phase: 0.84,
    loopSeconds: 6.1,
  },
]

type MainMenuProps = {
  particlesActive: boolean
  onSelect: (action: MenuAction) => void
}

export function MainMenu({ particlesActive, onSelect }: MainMenuProps) {
  const { settings, t } = useGameSettings()
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-menu-item]'),
    )
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const delta = event.key === 'ArrowDown' ? 1 : -1
    const next = buttons[(index + delta + buttons.length) % buttons.length] ?? buttons[0]
    event.preventDefault()
    next?.focus()
  }

  return (
    <div {...languageAttrs(settings.language)} className="parallax-near relative flex flex-col items-center">
      <OrbitalRing className="pointer-events-none absolute left-1/2 top-[47%] aspect-square w-[min(80vh,96vw)] -translate-x-1/2 -translate-y-1/2" />

      <GameTitle />

      <nav aria-label={t.menuNav} onKeyDown={handleKeyDown} className="mt-[4.4vh]">
        <ul className="flex flex-col items-center gap-[clamp(12px,2.6vh,26px)]">
          {ITEMS.map((item, i) => (
            <li
              key={item.id}
              className="intro-el"
              style={
                {
                  '--intro-delay': `${2.75 + i * 0.2}s`,
                  '--intro-dur': '0.85s',
                } as CSSProperties
              }
            >
              <OrbitalCapsuleButton
                data-menu-item
                label={t[item.labelKey]}
                tone={item.tone}
                emphasis={item.emphasis}
                sound={item.sound}
                width={item.width}
                height={item.height}
                phase={item.phase}
                loopSeconds={item.loopSeconds}
                particlesActive={particlesActive}
                aria-haspopup={item.id === 'settings' || item.id === 'about' ? 'dialog' : undefined}
                onActivate={() => onSelect(item.id)}
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
