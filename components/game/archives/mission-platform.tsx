'use client'

import Image from 'next/image'
import { useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { OrbitalCapsuleButton } from '../orbital-capsule-button'
import { useGameSettings } from '../settings-provider'
import { MISSION_BLURBS, type Mission } from './archive-data'

type MissionPlatformProps = {
  mission: Mission
  featured: boolean
  selected: boolean
  delay: number
  baseRotate?: number
  calm: boolean
  className?: string
  onBegin?: () => void
}

export function MissionPlatform({ mission, featured, selected, delay, baseRotate = 0, calm, className, onBegin }: MissionPlatformProps) {
  const { play } = useGameSettings()
  const cardRef = useRef<HTMLDivElement>(null)
  const [hot, setHot] = useState(false)
  const active = hot || selected
  const tone = active ? '#ff9a3d' : '#49d7ff'

  const onMove = (e: React.PointerEvent) => {
    if (calm || e.pointerType !== 'mouse') return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--tx', (((e.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3))
    el.style.setProperty('--ty', (((e.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3))
  }
  const reset = () => {
    setHot(false)
    cardRef.current?.style.setProperty('--tx', '0')
    cardRef.current?.style.setProperty('--ty', '0')
  }

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <div
        className="arc-display relative w-full"
        style={{ '--d': `${delay}s` } as CSSProperties}
      >
        <div
          ref={cardRef}
          data-hot={hot}
          data-active={active}
          data-selected={selected}
          onPointerEnter={(e) => {
            setHot(true)
            if (e.pointerType === 'mouse') play('hover')
          }}
          onPointerMove={onMove}
          onPointerLeave={reset}
          onFocusCapture={() => setHot(true)}
          onBlurCapture={reset}
          className="arc-card"
          style={{ '--tone': tone, '--base-ry': `${baseRotate}deg` } as CSSProperties}
        >
          <article
            aria-labelledby={`mission-${mission.id}`}
            className={cn(
              'arc-glass relative flex flex-col overflow-hidden',
              featured
                ? 'h-[min(58vh,560px)] p-[clamp(14px,2.4vh,24px)]'
                : 'h-[min(46vh,440px)] p-[clamp(12px,2vh,20px)]',
            )}
          >
            <p
              className={cn(
                'text-[clamp(9px,1.3vh,12px)] font-semibold tracking-[0.3em] transition-colors duration-500',
                active ? 'text-ember' : 'text-hud/80',
              )}
            >
              {mission.index}
            </p>
            <h3
              id={`mission-${mission.id}`}
              className={cn(
                'mt-1 font-display uppercase leading-none text-frost transition-[text-shadow] duration-500',
                featured ? 'text-[clamp(22px,4.6vh,42px)] tracking-[0.08em]' : 'text-[clamp(16px,3vh,26px)] tracking-[0.1em]',
                active ? '[text-shadow:0_0_24px_rgba(255,154,61,0.35)]' : '[text-shadow:0_0_20px_rgba(73,215,255,0.25)]',
              )}
            >
              {mission.name}
            </h3>
            <p
              className={cn(
                'mt-1.5 text-[clamp(10px,1.5vh,14px)] italic tracking-[0.18em] text-hud',
              )}
            >
              {mission.site} · {mission.body}
            </p>

            <div className="relative mt-[clamp(8px,1.6vh,16px)] min-h-0 flex-1 overflow-hidden rounded-xl">
              <Image
                src={mission.image}
                alt={mission.imageAlt}
                fill
                sizes={featured ? '(min-width: 768px) 440px, 86vw' : '320px'}
                className={cn(
                  'object-cover transition-[transform,filter] duration-[1200ms] ease-out',
                  active ? 'scale-[1.04]' : 'saturate-[0.8]',
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060c14] via-transparent to-transparent" />
            </div>

            {featured && (
              <p className="mt-[clamp(8px,1.6vh,14px)] line-clamp-3 text-pretty text-[clamp(11px,1.65vh,14px)] leading-relaxed text-frost/85 [@media(max-height:640px)]:line-clamp-2">
                {MISSION_BLURBS[mission.id]}
              </p>
            )}
            <div className={cn('flex justify-center', featured ? 'mt-[clamp(10px,1.8vh,18px)]' : 'mt-[clamp(10px,2vh,18px)]')}>
              <OrbitalCapsuleButton
                label="Begin Mission"
                tone={active ? 'amber' : 'cyan'}
                emphasis={featured ? 'primary' : undefined}
                sound="start"
                width={featured ? 'min(100%, 340px)' : 'min(100%, 260px)'}
                height={featured ? 'clamp(40px, 6.4vh, 54px)' : 'clamp(36px, 5.4vh, 46px)'}
                phase={featured ? 0.1 : 0.35}
                onActivate={() => onBegin?.()}
              />
            </div>
          </article>
          <span aria-hidden className="arc-frame" />
          <span aria-hidden className="arc-frame-sweep" />
        </div>
      </div>

      <div aria-hidden className="arc-pad relative -mt-2 h-0 w-[118%]" style={{ '--d': `${delay - 0.5}s` } as CSSProperties}>
        <span
          className="arc-pad-ring aspect-square w-full"
          style={{
            background: `radial-gradient(closest-side, ${active ? 'rgba(255,154,61,0.28)' : 'rgba(73,215,255,0.16)'}, transparent 70%)`,
            border: `2px solid ${active ? 'rgba(255,170,80,0.75)' : 'rgba(73,215,255,0.5)'}`,
            boxShadow: `0 0 ${active ? 60 : 34}px ${active ? 'rgba(255,154,61,0.7)' : 'rgba(73,215,255,0.45)'}, inset 0 0 40px ${active ? 'rgba(255,154,61,0.4)' : 'rgba(73,215,255,0.25)'}`,
            transition: 'box-shadow 0.6s ease, border-color 0.6s ease, background 0.6s ease',
          }}
        />
        <span
          className="arc-pad-ring aspect-square w-[78%]"
          style={{ border: `1px solid ${active ? 'rgba(255,200,140,0.5)' : 'rgba(73,215,255,0.35)'}` }}
        />
      </div>
    </div>
  )
}
