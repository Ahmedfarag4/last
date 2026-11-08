'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useGameSettings } from './settings-provider'

type SignalWaveformProps = {
  bars?: number
  color?: string
  envelope?: 'center' | 'flat'
  className?: string
  strokeWidth?: number
}

const HEIGHT = 32
const STEP = 4

export function SignalWaveform({
  bars = 44,
  color = '#F2B35D',
  envelope = 'center',
  className,
  strokeWidth = 1.4,
}: SignalWaveformProps) {
  const groupRef = useRef<SVGGElement>(null)
  const { settings } = useGameSettings()

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const lines = Array.from(group.children) as SVGLineElement[]
    const seeds = lines.map((_, i) => Math.sin(i * 12.9898) * 43758.5453 - Math.floor(Math.sin(i * 12.9898) * 43758.5453))

    const draw = (time: number) => {
      lines.forEach((line, i) => {
        const x = i / (lines.length - 1)
        const env =
          envelope === 'center'
            ? Math.exp(-((x - 0.5) ** 2) / 0.018) * 0.9 + 0.08
            : 0.3 + 0.55 * Math.abs(Math.sin(x * 7.5 + 0.6))
        const jitter =
          0.5 +
          0.5 * Math.sin(time * 0.0042 + seeds[i] * 20) * Math.sin(time * 0.0017 + i * 0.71)
        const spike = envelope === 'center' && Math.abs(x - 0.5) < 0.04 ? 0.25 : 0
        const amp = Math.max(0.07, Math.min(1, env * (0.35 + jitter * 0.75) + spike))
        const half = (amp * HEIGHT) / 2
        line.setAttribute('y1', String(HEIGHT / 2 - half))
        line.setAttribute('y2', String(HEIGHT / 2 + half))
      })
    }

    if (settings.reducedMotion) {
      draw(1600)
      return
    }
    let raf = 0
    let last = 0
    const tick = (time: number) => {
      if (time - last > 45) {
        draw(time)
        last = time
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [envelope, settings.reducedMotion])

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${bars * STEP} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn('overflow-visible', className)}
      style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
    >
      <g ref={groupRef} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
        {Array.from({ length: bars }, (_, i) => (
          <line key={i} x1={i * STEP + STEP / 2} x2={i * STEP + STEP / 2} y1={HEIGHT / 2} y2={HEIGHT / 2} />
        ))}
      </g>
    </svg>
  )
}
