import Image from 'next/image'
import type { CSSProperties } from 'react'

const MOTES = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  return {
    left: `${r(1) * 100}%`,
    top: `${35 + r(2) * 60}%`,
    size: 1 + r(3) * 2.2,
    t: `${12 + r(4) * 14}s`,
    delay: `${-r(5) * 20}s`,
    dx: `${(r(6) - 0.5) * 80}px`,
    o: 0.25 + r(7) * 0.5,
  }
})

export function ArchiveEnvironment({ calm }: { calm: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="arc-layer" style={{ '--depth': 1.2 } as CSSProperties}>
        <Image
          src="/images/archives/chamber.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_40%]"
        />
      </div>

      <div className="arc-layer arc-ceiling" style={{ '--depth': 1.6 } as CSSProperties}>
        <div
          className="arc-breathe absolute left-1/2 top-[-18%] h-[52%] w-[70%] -translate-x-1/2 rounded-[50%] mix-blend-screen"
          style={{ background: 'radial-gradient(closest-side, rgba(255,154,61,0.42), rgba(255,120,40,0.12) 55%, transparent 75%)' }}
        />
        <div
          className="absolute right-[4%] top-[30%] h-[40%] w-[30%] rounded-full mix-blend-screen"
          style={{ background: 'radial-gradient(closest-side, rgba(255,170,90,0.32), transparent 70%)' }}
        />
      </div>

      <div className="arc-layer" style={{ '--depth': 0.6 } as CSSProperties}>
        <div
          className="arc-haze absolute inset-x-[-10%] top-[30%] h-[45%] opacity-60"
          style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(255,160,100,0.14), transparent 70%)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[48%]"
          style={{ background: 'radial-gradient(60% 60% at 50% 100%, rgba(73,215,255,0.1), transparent 70%)' }}
        />
      </div>

      {!calm && (
        <div className="absolute inset-0">
          {MOTES.map((m, i) => (
            <span
              key={i}
              className="arc-dust-mote absolute rounded-full bg-[#ffd9b0]"
              style={
                {
                  left: m.left,
                  top: m.top,
                  width: m.size,
                  height: m.size,
                  '--t': m.t,
                  '--delay': m.delay,
                  '--dx': m.dx,
                  '--o': m.o,
                  boxShadow: '0 0 6px rgba(255,200,150,0.6)',
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(4,8,14,0.75) 100%), linear-gradient(180deg, rgba(4,8,14,0.55), transparent 22%, transparent 70%, rgba(4,8,14,0.8))',
        }}
      />
    </div>
  )
}
