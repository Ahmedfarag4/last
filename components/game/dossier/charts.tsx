import { OPPORTUNITY_TAU_FINAL } from '../archives/opportunity-tau-data'

function OpportunityTauChart() {
  const start = 5060
  const end = 5112
  const data = OPPORTUNITY_TAU_FINAL.filter((p) => p.sol >= start)
  const last = data[data.length - 1]
  const plot = { x: 40, y: 14, w: 300, h: 150 }
  const maxTau = 2.6
  const x = (sol: number) => plot.x + ((sol - start) / (end - start)) * plot.w
  const y = (tau: number) => plot.y + plot.h - (tau / maxTau) * plot.h
  const path = data.map((p, i) => `${i ? 'L' : 'M'}${x(p.sol).toFixed(1)} ${y(p.tau).toFixed(1)}`).join(' ')

  return (
    <svg
      viewBox="0 0 360 200"
      className="w-full font-file"
      role="img"
      aria-label={`Atmospheric opacity from Sol ${start} to the last direct reading at Sol ${last.sol.toFixed(2)}, Tau ${last.tau.toFixed(2)}. Last contact at Sol 5111 has no direct reading.`}
    >
      {[0, 0.5, 1, 1.5, 2, 2.5].map((t) => (
        <g key={t}>
          <line x1={plot.x} x2={plot.x + plot.w} y1={y(t)} y2={y(t)} stroke="#8a7658" strokeOpacity="0.35" strokeDasharray="2 3" />
          <text x={plot.x - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#5c4b37">{t.toFixed(1)}</text>
        </g>
      ))}
      {[5060, 5080, 5100, 5111].map((s) => (
        <text key={s} x={x(s)} y={plot.y + plot.h + 15} textAnchor="middle" fontSize="10" fill="#5c4b37">{s}</text>
      ))}
      <text x={plot.x + plot.w / 2} y={plot.y + plot.h + 30} textAnchor="middle" fontSize="9" letterSpacing="1.5" fill="#8a7658">SOL</text>
      <line x1={x(5111)} x2={x(5111)} y1={plot.y} y2={plot.y + plot.h} stroke="#a3342b" strokeDasharray="4 3" />
      <text x={x(5111) - 4} y={plot.y + plot.h - 4} textAnchor="end" fontSize="9" fill="#a3342b" letterSpacing="0.8">LAST CONTACT</text>
      <path d={path} fill="none" stroke="#2a2119" strokeWidth="1.6" strokeLinejoin="round" />
      {data.map((p) => (
        <circle key={p.sol} cx={x(p.sol)} cy={y(p.tau)} r="1.9" fill="#2a2119" />
      ))}
      <circle cx={x(last.sol)} cy={y(last.tau)} r="4.5" fill="none" stroke="#a3342b" strokeWidth="1.6" />
      <g transform={`translate(${x(last.sol) - 112} ${y(last.tau) - 6})`}>
        <rect width="98" height="30" rx="2" fill="#2a2119" />
        <text x="8" y="12" fontSize="8.5" fill="#d9c7a0" letterSpacing="0.8">LAST DIRECT READING</text>
        <text x="8" y="24" fontSize="10" fontWeight="600" fill="#ebdfc3">{`τ ${last.tau.toFixed(2)} · Sol ${last.sol.toFixed(1)}`}</text>
      </g>
    </svg>
  )
}

const CHARTS: Record<string, () => React.ReactElement> = {
  'opportunity-tau': OpportunityTauChart,
}

export function DossierChart({ chartId }: { chartId: string }) {
  const Chart = CHARTS[chartId]
  return Chart ? <Chart /> : null
}
