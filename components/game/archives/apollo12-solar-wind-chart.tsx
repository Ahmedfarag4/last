'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGameSettings } from '../settings-provider'

type Metric = 'speed' | 'density'
type Reading = { time: string; stamp: number; speed: number | null; density: number | null }
const TABLE = '/nasa-data/apollo-12/apollo12_sws_1hr_1969c9381.tab'
const METRICS = {
  speed: { label: 'Proton bulk speed', unit: 'km/s', key: 'VEL_1' },
  density: { label: 'Proton number density', unit: 'protons/cm³', key: 'DENSITY_1' },
} as const

/** Fixed column offsets and missing constants from the supplied PDS4 XML label.
 * The .tab has two header records, then 668 fixed-width 392-byte records.
 * Only set 1 is plotted; no missing values are interpolated.
 */
function parseTable(input: string): Reading[] {
  const records: Reading[] = []
  for (const line of input.split(/\r?\n/)) {
    const time = line.slice(0, 19)
    if (!/^1969-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(time)) continue
    const spectra = Number(line.slice(36, 39).trim())
    const density = Number(line.slice(41, 46).trim())
    const speed = Number(line.slice(55, 61).trim())
    const valid = spectra > 0 && spectra !== -99
    const stamp = Date.parse(time + 'Z')
    if (!Number.isFinite(stamp)) continue
    records.push({
      time,
      stamp,
      speed: valid && Number.isFinite(speed) && speed !== -999 && speed >= 0 ? speed : null,
      density: valid && Number.isFinite(density) && density !== -99.9 && density >= 0 ? density : null,
    })
  }
  return records
}

export function Apollo12SolarWindChart() {
  const { settings } = useGameSettings()
  const ar = settings.language === 'ar'
  const [readings, setReadings] = useState<Reading[]>([])
  const [metric, setMetric] = useState<Metric>('speed')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch(TABLE, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Dataset not available (HTTP ' + response.status + ')')
        return response.text()
      })
      .then(text => {
        const parsed = parseTable(text)
        if (parsed.length !== 668) throw new Error('Unexpected record count; expected 668, got ' + parsed.length)
        setReadings(parsed)
      })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message || 'Could not load measurement table') })
    return () => controller.abort()
  }, [])

  const valid = useMemo(() => readings.filter(r => r[metric] !== null), [readings, metric])
  const max = Math.max(1, ...valid.map(r => r[metric] ?? 0))
  const minStamp = readings[0]?.stamp ?? 0
  const range = Math.max(1, (readings[readings.length - 1]?.stamp ?? minStamp) - minStamp)
  const x = (stamp: number) => 58 + (stamp - minStamp) / range * 806
  const y = (value: number) => 224 - value / max * 182
  const paths: string[] = []
  let section: string[] = []
  for (const r of readings) {
    const value = r[metric]
    if (value === null) {
      if (section.length) paths.push(section.join(' '))
      section = []
    } else section.push((section.length ? 'L' : 'M') + x(r.stamp).toFixed(2) + ',' + y(value).toFixed(2))
  }
  if (section.length) paths.push(section.join(' '))
  const starting = readings[0]?.time.slice(0, 10) ?? '1969-11-19'
  const ending = readings[readings.length - 1]?.time.slice(0, 10) ?? '1969-12-31'
  return (
    <section aria-label={ar ? 'رسم قياسات مطياف الرياح الشمسية في أبولو 12' : 'Apollo 12 Solar Wind Spectrometer measurement chart'} className="rounded-2xl border border-hud/30 bg-[#061623] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-display text-lg tracking-wider text-ember">{ar ? 'الرياح الشمسية / مشاهدات ساعية' : 'SOLAR WIND / HOURLY OBSERVATIONS'}</h4>
          <p className="mt-1 text-xs text-frost/60">Apollo 12 ALSEP · Solar Wind Spectrometer · Set 1 · UTC</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label={ar ? 'اختيار قياسات الرياح الشمسية' : 'Solar wind measurement selector'}>
          {(['speed', 'density'] as const).map(key => (
            <button key={key} type="button" aria-pressed={metric === key} onClick={() => setMetric(key)}
              className={'rounded-full border px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-hud ' + (metric === key ? 'border-hud bg-hud/15 text-frost' : 'border-hud/30 text-frost/65 hover:border-hud/60')}>
              {ar ? (key === 'speed' ? 'سرعة البروتونات' : 'كثافة البروتونات') : METRICS[key].label}
            </button>
          ))}
        </div>
      </div>
      {error ? <p role="alert" className="mt-5 text-sm text-amber-200">{ar ? 'تعذر تحميل بيانات القياس. تحقق من الملف الأصلي.' : error}</p> : !readings.length ?
        <p role="status" className="mt-5 text-sm text-frost/65">{ar ? 'جاري تحميل قياسات ناسا…' : 'Loading NASA measurement records…'}</p> :
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <p className="rounded-lg border border-hud/20 p-3"><span className="block text-frost/55">{ar ? 'القراءات الصالحة' : 'Valid readings'}</span><strong className="mt-1 block font-mono text-base text-hud">{valid.length} / {readings.length}</strong></p>
            <p className="rounded-lg border border-hud/20 p-3"><span className="block text-frost/55">{ar ? 'القيمة العظمى' : 'Maximum'}</span><strong className="mt-1 block font-mono text-base text-hud">{max.toFixed(1)} {METRICS[metric].unit}</strong></p>
            <p className="col-span-2 rounded-lg border border-hud/20 p-3 sm:col-span-1"><span className="block text-frost/55">{ar ? 'فترة الرصد' : 'Observation interval'}</span><strong className="mt-1 block font-mono text-xs text-hud">{starting} — {ending}</strong></p>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-hud/20 bg-[#030e17] p-2">
            <svg viewBox="0 0 900 275" role="img" aria-label={(ar ? (metric === 'speed' ? 'سرعة البروتونات' : 'كثافة البروتونات') : METRICS[metric].label) + (ar ? ' عبر الزمن؛ تظهر الساعات المفقودة كفجوات.' : ' over time. Missing hourly observations are shown as gaps.')} className="w-full">
              {[0, .25, .5, .75, 1].map(n => (
                <g key={n}>
                  <line x1="58" x2="864" y1={y(max * n)} y2={y(max * n)} stroke="#477384" opacity=".35" strokeDasharray="3 5"/>
                  <text x="50" y={y(max * n) + 4} textAnchor="end" fill="#91b9c6" fontSize="12">{(max * n).toFixed(0)}</text>
                </g>
              ))}
              {paths.map((path,i) => <path key={i} d={path} fill="none" stroke="#54d9ed" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>)}
              <text x="58" y="255" fill="#a4bac7" fontSize="12">{starting}</text>
              <text x="864" y="255" fill="#a4bac7" fontSize="12" textAnchor="end">{ending}</text>
              <text x="461" y="272" fill="#a4bac7" fontSize="11" textAnchor="middle">{ar ? 'التاريخ بتوقيت UTC' : 'UTC DATE'}</text>
            </svg>
          </div>
          <p className="mt-3 text-xs leading-6 text-frost/60">
            {ar ? (metric === 'speed' ? 'سرعة البروتونات' : 'كثافة البروتونات') : METRICS[metric].label} ({METRICS[metric].unit}); {ar ? 'تمثل كل نقطة متوسطًا ساعيًا مذكورًا في المصدر. الفجوات قياسات غير متاحة وليست أصفارًا. تُعرض المجموعة الأولى فقط دون قيم تقديرية أو مصطنعة.' : 'each point is a source-reported hourly average. Gaps are unavailable measurements, not zero. Set 1 only; no estimated or synthetic values.'}
          </p>
        </>}
    </section>
  )
}
