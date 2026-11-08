import type { CSSProperties } from 'react'

const C = 200

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)] as const
}

function arc(r: number, from: number, to: number) {
  const [x1, y1] = polar(r, from)
  const [x2, y2] = polar(r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

const draw = (delay: string, dur = '1.6s') =>
  ({
    '--intro-anim': 'intro-draw',
    '--intro-delay': delay,
    '--intro-dur': dur,
    '--draw-from': 100,
  }) as CSSProperties

export function OrbitalRing({ className }: { className?: string }) {
  const ticks = Array.from({ length: 9 }, (_, i) => 250 + i * 5)

  return (
    <svg aria-hidden viewBox="0 0 400 400" className={className} fill="none">
      <defs>
        <linearGradient id="ring-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#49D7FF" stopOpacity="0" />
          <stop offset="0.25" stopColor="#49D7FF" stopOpacity="0.7" />
          <stop offset="0.75" stopColor="#49D7FF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#49D7FF" stopOpacity="0" />
        </linearGradient>
        <filter id="ring-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <path
        className="intro-el"
        style={draw('2.1s')}
        d={arc(196, 198, 342)}
        stroke="url(#ring-fade)"
        strokeWidth={0.9}
        pathLength={100}
        strokeDasharray="100"
      />
      <path
        className="intro-el"
        style={draw('2.5s', '1.2s')}
        d={arc(196, 286, 318)}
        stroke="#F2B35D"
        strokeWidth={1.4}
        pathLength={100}
        strokeDasharray="100"
        filter="url(#ring-glow)"
      />
      <path
        className="intro-el"
        style={draw('2.5s', '1.2s')}
        d={arc(196, 286, 318)}
        stroke="#FFD9A0"
        strokeWidth={0.7}
        pathLength={100}
        strokeDasharray="100"
      />
      <path
        className="intro-el"
        style={draw('2.3s')}
        d={arc(190, 352, 52)}
        stroke="#49D7FF"
        strokeOpacity={0.45}
        strokeWidth={0.7}
        pathLength={100}
        strokeDasharray="100"
      />
      <path
        className="intro-el"
        style={draw('2.3s')}
        d={arc(190, 128, 188)}
        stroke="#49D7FF"
        strokeOpacity={0.45}
        strokeWidth={0.7}
        pathLength={100}
        strokeDasharray="100"
      />

      <g
        className="intro-el"
        style={{ '--intro-anim': 'intro-fade', '--intro-delay': '2.6s', '--intro-dur': '1.2s' } as CSSProperties}
      >
        {ticks.map((deg) => {
          const [x1, y1] = polar(199, deg)
          const [x2, y2] = polar(deg === 270 ? 206 : 203, deg)
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#49D7FF"
              strokeOpacity={deg === 270 ? 0.9 : 0.45}
              strokeWidth={deg === 270 ? 1.2 : 0.6}
            />
          )
        })}
        <g className="slow-rotate" style={{ transformOrigin: '200px 200px' }}>
          <circle r={183} cx={C} cy={C} stroke="#49D7FF" strokeOpacity={0.22} strokeWidth={0.8} strokeDasharray="0.6 5" />
        </g>
        <g className="slow-rotate-rev" style={{ transformOrigin: '200px 200px' }}>
          <path d={arc(176, 20, 70)} stroke="#49D7FF" strokeOpacity={0.3} strokeWidth={0.5} strokeDasharray="6 3" />
          <path d={arc(176, 200, 250)} stroke="#49D7FF" strokeOpacity={0.3} strokeWidth={0.5} strokeDasharray="6 3" />
        </g>
      </g>
    </svg>
  )
}
