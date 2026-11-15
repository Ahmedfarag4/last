'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from 'react'
import type { SoundName } from '@/lib/audio'
import { cn } from '@/lib/utils'
import { useGameSettings } from './settings-provider'

type Tone = 'amber' | 'cyan'

const PALETTE: Record<
  Tone,
  { stroke: string; glow: string; core: string; glass: string; glassHot: string; text: string }
> = {
  amber: {
    stroke: '#F2B35D',
    glow: '#FF9A3D',
    core: '#FFF3DE',
    glass:
      'radial-gradient(120% 160% at 50% 0%, rgba(255,154,61,0.30) 0%, rgba(58,30,14,0.55) 45%, rgba(8,17,27,0.72) 100%)',
    glassHot:
      'radial-gradient(120% 160% at 50% 0%, rgba(255,170,80,0.42) 0%, rgba(70,36,14,0.55) 45%, rgba(8,17,27,0.7) 100%)',
    text: '#FFF4E4',
  },
  cyan: {
    stroke: '#49D7FF',
    glow: '#49D7FF',
    core: '#EAFBFF',
    glass:
      'radial-gradient(120% 160% at 50% 0%, rgba(73,215,255,0.14) 0%, rgba(16,28,42,0.55) 50%, rgba(8,17,27,0.68) 100%)',
    glassHot:
      'radial-gradient(120% 160% at 50% 0%, rgba(73,215,255,0.26) 0%, rgba(16,32,48,0.58) 50%, rgba(8,17,27,0.66) 100%)',
    text: '#EAF4FF',
  },
}

const TRAILS = [
  { len: 96, width: 1.6, opacity: 0.12 },
  { len: 56, width: 1.9, opacity: 0.26 },
  { len: 26, width: 2.4, opacity: 0.55 },
] as const

const HEAD_DASH = 0.01

/** Stadium path starting at top-center, running clockwise. Returns the exact perimeter length. */
function capsuleGeometry(width: number, height: number, inset: number) {
  const x0 = inset
  const y0 = inset
  const x1 = width - inset
  const y1 = height - inset
  const r = Math.max(0, (y1 - y0) / 2)
  const straight = Math.max(0, x1 - x0 - 2 * r)
  const cx = width / 2
  const d = [
    `M ${cx} ${y0}`,
    `H ${x1 - r}`,
    `A ${r} ${r} 0 0 1 ${x1 - r} ${y1}`,
    `H ${x0 + r}`,
    `A ${r} ${r} 0 0 1 ${x0 + r} ${y0}`,
    'Z',
  ].join(' ')
  return { d, length: 2 * straight + 2 * Math.PI * r }
}

type OrbitalCapsuleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  label: string
  tone?: Tone
  emphasis?: 'primary' | 'secondary'
  /** Starting position of the particle along the perimeter, 0–1. */
  phase?: number
  /** Seconds per full perimeter loop. */
  loopSeconds?: number
  particlesActive?: boolean
  sound?: SoundName
  width: string
  height: string
  onActivate: () => void
}

export function OrbitalCapsuleButton({
  label,
  tone = 'cyan',
  emphasis = 'secondary',
  phase = 0,
  loopSeconds = 6.5,
  particlesActive = true,
  sound = 'click',
  width,
  height,
  onActivate,
  className,
  style,
  ...rest
}: OrbitalCapsuleButtonProps) {
  const { settings, play } = useGameSettings()
  const reducedMotion = settings.reducedMotion
  const palette = PALETTE[tone]
  const uid = useId().replace(/:/g, '')

  const buttonRef = useRef<HTMLButtonElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [hot, setHot] = useState(false)

  const headRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const pulseRef = useRef<SVGPathElement>(null)
  const flashRef = useRef<SVGPathElement>(null)
  const trailRefs = useRef<(SVGPathElement | null)[]>([])

  const motion = useRef({ pos: phase, mult: 1, boost: 0, pulse: 1, hot: false })

  useLayoutEffect(() => {
    const el = buttonRef.current
    if (!el) return
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const outer = useMemo(() => capsuleGeometry(box.w, box.h, 1.5), [box])
  const inner = useMemo(() => capsuleGeometry(box.w, box.h, 6), [box])

  useEffect(() => {
    motion.current.hot = hot
  }, [hot])

  useEffect(() => {
    const L = outer.length
    if (!L) return
    const m = motion.current
    const pulseLen = L * 0.28
    let raf = 0
    let last = performance.now()

    const render = () => {
      const head = (m.pos % 1) * L
      trailRefs.current.forEach((el, i) => {
        el?.setAttribute('stroke-dashoffset', String(TRAILS[i].len - head))
      })
      const headOffset = String(HEAD_DASH - head)
      headRef.current?.setAttribute('stroke-dashoffset', headOffset)
      glowRef.current?.setAttribute('stroke-dashoffset', headOffset)

      const pulse = pulseRef.current
      const flash = flashRef.current
      if (m.pulse < 1) {
        const p = m.pulse
        const eased = 1 - Math.pow(1 - p, 2)
        pulse?.setAttribute('stroke-dashoffset', String(pulseLen - (head + eased * L)))
        pulse?.setAttribute('opacity', String((1 - p) * 0.95))
        flash?.setAttribute('opacity', String((1 - p) * 0.7))
      } else {
        pulse?.setAttribute('opacity', '0')
        flash?.setAttribute('opacity', '0')
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      m.mult += ((m.hot ? 1.3 : 1) - m.mult) * Math.min(1, dt * 5)
      m.boost *= Math.exp(-dt * 2.4)
      if (!reducedMotion && particlesActive) {
        m.pos = (m.pos + (dt / loopSeconds) * (m.mult + m.boost)) % 1
      }
      if (m.pulse < 1) m.pulse = Math.min(1, m.pulse + dt / (reducedMotion ? 0.45 : 0.75))
      render()
      raf = requestAnimationFrame(tick)
    }

    render()
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [outer.length, reducedMotion, particlesActive, loopSeconds])

  const handleClick = () => {
    const m = motion.current
    m.boost = 3.2
    m.pulse = 0
    play(sound)
    onActivate()
  }

  const L = outer.length
  const primary = emphasis === 'primary'

  return (
    <button
      {...rest}
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onPointerEnter={(e) => {
        setHot(true)
        if (e.pointerType === 'mouse') play('hover')
      }}
      onPointerLeave={() => setHot(false)}
      onFocus={(e) => {
        if (e.currentTarget.matches(':focus-visible')) {
          setHot(true)
          play('hover')
        }
      }}
      onBlur={() => setHot(false)}
      data-hot={hot}
      className={cn(
        'group relative isolate flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none',
        'transition-transform duration-200 ease-out active:scale-[0.985]',
        'focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-hud/70',
        className,
      )}
      style={{ width, height, ...style } as CSSProperties}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full backdrop-blur-[3px] transition-opacity duration-300"
        style={{ background: palette.glass }}
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-data-[hot=true]:opacity-100"
        style={{
          background: palette.glassHot,
          boxShadow: `inset 0 0 22px ${palette.glow}38, 0 0 26px ${palette.glow}26`,
        }}
      />

      {L > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={box.w}
          height={box.h}
          viewBox={`0 0 ${box.w} ${box.h}`}
          fill="none"
        >
          <defs>
            <filter id={`glow-${uid}`} x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
            <filter id={`halo-${uid}`} x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <path
            d={outer.d}
            stroke={palette.glow}
            strokeWidth={primary ? 5 : 4}
            filter={`url(#halo-${uid})`}
            className="transition-opacity duration-300"
            opacity={hot ? (primary ? 0.75 : 0.55) : primary ? 0.5 : 0.24}
          />
          <path
            d={outer.d}
            stroke={palette.stroke}
            strokeWidth={primary ? 1.6 : 1.2}
            className="transition-opacity duration-300"
            opacity={hot ? 1 : primary ? 0.92 : 0.72}
          />
          <path
            d={inner.d}
            stroke={palette.stroke}
            strokeWidth={0.7}
            className="transition-opacity duration-300"
            opacity={hot ? 0.5 : 0.22}
          />
          <path ref={flashRef} d={outer.d} stroke={palette.core} strokeWidth={2} opacity={0} />

          <g
            style={{
              opacity: particlesActive ? 1 : 0,
              transition: 'opacity 900ms ease-out',
            }}
          >
            {TRAILS.map((trail, i) => (
              <path
                key={trail.len}
                ref={(el) => {
                  trailRefs.current[i] = el
                }}
                d={outer.d}
                stroke={palette.stroke}
                strokeWidth={trail.width}
                strokeLinecap="round"
                strokeDasharray={`${Math.min(trail.len, L)} ${Math.max(0, L - trail.len)}`}
                opacity={hot ? Math.min(1, trail.opacity * 1.5) : trail.opacity}
              />
            ))}
            <path
              ref={pulseRef}
              d={outer.d}
              stroke={palette.core}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeDasharray={`${L * 0.28} ${L * 0.72}`}
              filter={`url(#glow-${uid})`}
              opacity={0}
            />
            <path
              ref={glowRef}
              d={outer.d}
              stroke={palette.glow}
              strokeWidth={hot ? 13 : 9}
              strokeLinecap="round"
              strokeDasharray={`${HEAD_DASH} ${L - HEAD_DASH}`}
              filter={`url(#glow-${uid})`}
              opacity={hot ? 1 : 0.8}
              className="transition-[stroke-width,opacity] duration-300"
            />
            <path
              ref={headRef}
              d={outer.d}
              stroke={palette.core}
              strokeWidth={hot ? 5 : 4}
              strokeLinecap="round"
              strokeDasharray={`${HEAD_DASH} ${L - HEAD_DASH}`}
              className="transition-[stroke-width] duration-300"
            />
          </g>
        </svg>
      )}

      <span
        className={cn(
          'relative select-none whitespace-nowrap font-sans transition-[color,text-shadow] duration-300',
          primary
            ? 'text-[clamp(17px,2.5vh,26px)] font-semibold tracking-[0.12em]'
            : 'text-[clamp(14px,2vh,20px)] font-medium tracking-[0.14em]',
        )}
        style={{
          color: palette.text,
          textShadow: hot
            ? `0 0 14px ${palette.glow}AA, 0 0 2px ${palette.core}`
            : `0 0 10px ${palette.glow}55, 0 1px 2px rgba(0,0,0,0.6)`,
        }}
      >
        {label}
      </span>
    </button>
  )
}
