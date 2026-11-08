'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  size: number
  speed: number
  alpha: number
  phase: number
  wobble: number
}

export function DustParticles({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 32
    const sctx = sprite.getContext('2d')!
    const gradient = sctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255,222,188,1)')
    gradient.addColorStop(0.35, 'rgba(255,176,118,0.5)')
    gradient.addColorStop(1, 'rgba(255,150,90,0)')
    sctx.fillStyle = gradient
    sctx.fillRect(0, 0, 32, 32)

    let width = 0
    let height = 0
    let particles: Particle[] = []

    const spawn = (anywhere: boolean): Particle => {
      const depth = Math.random()
      return {
        x: anywhere ? Math.random() * width : width + 20 + Math.random() * 60,
        y: height * (0.18 + Math.random() * 0.82),
        size: 1.4 + depth * depth * 7,
        speed: 7 + depth * 30,
        alpha: 0.1 + depth * 0.38,
        phase: Math.random() * Math.PI * 2,
        wobble: 0.4 + Math.random(),
      }
    }

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(80, Math.max(22, (width * height) / 28000)))
      particles = Array.from({ length: count }, () => spawn(true))
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        const flicker = 0.75 + 0.25 * Math.sin(time * 0.0012 * p.wobble + p.phase)
        ctx.globalAlpha = p.alpha * flicker
        ctx.drawImage(sprite, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)
      }
      ctx.globalAlpha = 1
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    if (reducedMotion) {
      draw(0)
      return () => observer.disconnect()
    }

    let raf = 0
    let last = performance.now()
    const tick = (time: number) => {
      const dt = Math.min(0.05, (time - last) / 1000)
      last = time
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x -= p.speed * dt
        p.y += Math.sin(time * 0.0007 * p.wobble + p.phase) * 6 * dt
        if (p.x < -20) particles[i] = spawn(false)
      }
      draw(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
    />
  )
}
