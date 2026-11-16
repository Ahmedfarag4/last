'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, FileCheck2, RadioTower, RotateCcw, X } from 'lucide-react'
import { SIGNAL_LOGS } from './archives/archive-data'
import { useGameSettings } from './settings-provider'
import { translateOpportunityText } from './dossier/localize-opportunity'

const SAVE_KEY = 'last-signal.opportunity.evidence-02.v1'
const EVENT_IDS = ['end', 'last', 'recovery-september', 'storm-onset', 'last-command'] as const
const CORRECT = ['storm-onset', 'last', 'recovery-september', 'last-command', 'end'] as const
const EVENTS = EVENT_IDS.map(id => {
  const entry = SIGNAL_LOGS.find(record => record.id === id && record.kind === 'history')
  if (!entry) throw new Error('Missing documented NASA signal record ' + id)
  return entry
})

type Phase = 'identify' | 'sort' | 'confirm'

export function LastTransmissionPuzzle({ onClose }: { onClose: () => void }) {
  const { settings } = useGameSettings()
  const ar = settings.language === 'ar'
  const tr = (value: string) => ar ? translateOpportunityText(value) : value
  const [phase, setPhase] = useState<Phase>('identify')
  const [lastContact, setLastContact] = useState<string | null>(null)
  const [answer, setAnswer] = useState<'continued' | 'recovery' | null>(null)
  const [sequence, setSequence] = useState<string[]>([...EVENT_IDS])
  const [feedback, setFeedback] = useState('')
  const [collected, setCollected] = useState(false)
  const [selectedLog, setSelectedLog] = useState<string>('last')

  useEffect(() => {
    try { setCollected(window.localStorage.getItem(SAVE_KEY) === 'collected') } catch { /* private storage */ }
  }, [])

  const move = (index: number, step: -1 | 1) => {
    const target = index + step
    if (target < 0 || target >= sequence.length) return
    const reordered = [...sequence]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setSequence(reordered)
    setFeedback('')
  }

  const verify = () => {
    if (!sequence.every((id, i) => id === CORRECT[i])) {
      setFeedback('The records are not in chronological order. Check the printed dates and separate recovery attempts from received signals.')
      return
    }
    setPhase('confirm')
    setFeedback('')
  }

  const file = () => {
    try { window.localStorage.setItem(SAVE_KEY, 'collected') } catch { /* completion still permitted */ }
    setCollected(true)
    setFeedback('EVIDENCE 02 SECURED')
  }

  const current = EVENTS.find(entry => entry.id === selectedLog) ?? EVENTS[0]

  return (
    <section id="station-dialog" className="absolute inset-0 z-50 overflow-y-auto bg-[#020a15]/95 p-4 text-[#eaf4ff] backdrop-blur-xl sm:p-7" role="dialog" aria-modal="true" aria-label={tr("The Last Transmission investigation")}
      dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"}>
      <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-5">
        <header className="flex items-start justify-between gap-3 border-b border-cyan-300/25 pb-5">
          <div>
            <p className="font-mono text-[10px] tracking-[.28em] text-cyan-300">{tr("MER-B / SIGNAL RECOVERY / HISTORICAL ARCHIVE")}</p>
            <h2 className="mt-2 font-display text-2xl tracking-wider sm:text-4xl">{tr("THE LAST TRANSMISSION")}</h2>
            <p className="mt-2 text-sm text-slate-300">{tr("Restore the historical sequence. A command sent from Earth is not proof that Opportunity responded.")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={tr('Close signal investigation')} className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-300/40 px-3 py-2 text-xs hover:bg-cyan-300/10"><X size={16}/><span className="hidden sm:inline">{tr("RETURN TO FILE")}</span></button>
        </header>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px] tracking-wider">
          {([['identify','01 / IDENTIFY'],['sort','02 / RECONSTRUCT'],['confirm','03 / FILE']] as const).map(([id,label])=><span key={id} className={'rounded-lg border px-2 py-3 ' + (id === phase ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-slate-500')}>{tr(label)}</span>)}
        </div>
        {phase === 'identify' && (
          <div className="grid flex-1 gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-2xl border border-cyan-300/30 bg-[#071c2b] p-5 sm:p-7">
              <p className="font-mono text-xs tracking-[.2em] text-amber-300">{tr("SIGNAL CLASSIFICATION")}</p>
              <h3 className="mt-3 text-xl">{tr("Which record marks the rover's last received communication?")}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{tr("NASA continued transmitting commands for months afterward. Select a documented record from the archive.")}</p>
              <div className="mt-5 grid gap-3">
                {EVENTS.filter(event => ['last','last-command','end'].includes(event.id)).map(entry => (
                  <button key={entry.id} type="button" aria-pressed={lastContact === entry.id} onClick={() => {setLastContact(entry.id);setFeedback('')}}
                    className={'rounded-xl border p-4 text-start transition-colors ' + (lastContact === entry.id ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/15 hover:border-cyan-300/40')}>
                    <span className="block font-mono text-xs text-amber-200">{entry.stamp}</span>
                    <span className="mt-1 block text-sm font-semibold">{tr(entry.title)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-5 rounded-2xl border border-cyan-300/20 bg-[#07131f] p-5 sm:p-7">
              <div>
                <RadioTower size={32} className="text-cyan-300"/>
                <h3 className="mt-4 text-lg">{tr("The difference matters")}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{tr("After the last signal, NASA sent additional commands and listened for replies. How should these later attempts be classified?")}</p>
                <div className="mt-5 grid gap-3">
                  <button type="button" aria-pressed={answer === 'continued'} onClick={() => {setAnswer('continued');setFeedback('')}} className={'rounded-xl border p-4 text-start text-sm ' + (answer === 'continued' ? 'border-amber-300' : 'border-white/20')}>{tr("They prove the rover transmitted new data during recovery.")}</button>
                  <button type="button" aria-pressed={answer === 'recovery'} onClick={() => {setAnswer('recovery');setFeedback('')}} className={'rounded-xl border p-4 text-start text-sm ' + (answer === 'recovery' ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/20')}>{tr("They document recovery efforts, not a restored rover signal.")}</button>
                </div>
              </div>
              <div>
                {feedback && <p role="status" className="mb-3 text-sm text-amber-200">{tr(feedback)}</p>}
                <button type="button" disabled={!lastContact || !answer} onClick={() => {
                  if (lastContact === 'last' && answer === 'recovery') {setFeedback('');setPhase('sort')}
                  else setFeedback('Check which event records an actual received transmission versus a command sent from Earth.')
                }} className="w-full rounded-full bg-cyan-300 px-6 py-3 text-xs font-bold tracking-widest text-slate-950 disabled:opacity-40">{tr("CONFIRM SIGNAL IDENTITY")}</button>
              </div>
            </div>
          </div>
        )}
        {phase === 'sort' && (
          <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_.9fr]">
            <div className="rounded-2xl border border-cyan-300/25 bg-[#061625] p-5 sm:p-6">
              <h3 className="text-xl">{tr("Reconstruct the NASA record sequence")}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-300">{tr("Move five authentic historical records into chronological order. Select a record to inspect its official citation.")}</p>
              <ol className="mt-5 grid gap-2">
                {sequence.map((id,i) => {
                  const entry = EVENTS.find(item => item.id === id)!
                  return <li key={id} className={'flex items-center gap-2 rounded-xl border p-3 ' + (selectedLog === id ? 'border-cyan-300/80 bg-cyan-300/10' : 'border-cyan-300/20')}>
                    <span className="w-6 shrink-0 font-mono text-amber-200">{i+1}</span>
                    <button type="button" onClick={() => setSelectedLog(id)} className="min-w-0 flex-1 text-start focus-visible:outline-2 focus-visible:outline-cyan-300">
                      <span className="block font-mono text-[10px] text-cyan-200">{entry.stamp}</span>
                      <span className="block text-xs font-semibold sm:text-sm">{entry.title}</span>
                    </button>
                    <button type="button" disabled={i===0} onClick={()=>move(i,-1)} aria-label={(ar ? 'تحريك ' : 'Move ') + tr(entry.title) + (ar ? ' إلى الأعلى' : ' earlier')} className="rounded-lg border border-white/20 p-2 disabled:opacity-25"><ArrowUp size={16}/></button>
                    <button type="button" disabled={i===sequence.length-1} onClick={()=>move(i,1)} aria-label={(ar ? 'تحريك ' : 'Move ') + tr(entry.title) + (ar ? ' إلى الأسفل' : ' later')} className="rounded-lg border border-white/20 p-2 disabled:opacity-25"><ArrowDown size={16}/></button>
                  </li>
                })}
              </ol>
              {feedback && <p role="status" className="mt-3 text-xs text-amber-200">{feedback}</p>}
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={()=>setPhase('identify')} className="rounded-full border border-white/30 px-4 py-3 text-xs"><ArrowLeft size={13} className="mr-2 inline"/>{tr("REVIEW")}</button>
                <button type="button" onClick={verify} className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-bold tracking-wider text-slate-950">{tr("VERIFY CHRONOLOGY")}</button>
                <button type="button" onClick={()=>{setSequence([...EVENT_IDS]);setFeedback('')}} className="rounded-full border border-white/30 px-4 py-3 text-xs"><RotateCcw size={13} className="mr-2 inline"/>{tr("RESET")}</button>
              </div>
            </div>
            <article className="rounded-2xl border border-amber-300/25 bg-[#0d1927] p-5 sm:p-6" aria-live="polite">
              <p className="font-mono text-[10px] tracking-wider text-amber-200">{tr("NASA SOURCE INSPECTOR")}</p>
              <p className="mt-4 font-mono text-xs text-cyan-200">{current.stamp}</p>
              <h3 className="mt-2 text-lg text-white">{tr(current.title)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{tr(current.body)}</p>
              <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-xs text-cyan-300 underline underline-offset-4">{tr('View NASA/JPL source:')} {current.sourceLabel}</a>
              <p className="mt-6 text-xs text-amber-100/70">{tr("Real event chronology. The graphical interface is a reconstruction, not an original recording of a received signal.")}</p>
            </article>
          </div>
        )}
        {phase === 'confirm' && (
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center rounded-2xl border border-cyan-300/30 bg-[radial-gradient(ellipse_at_top,#16374c_0%,#061525_64%)] p-6 text-center sm:p-10">
            <CheckCircle2 size={56} className="text-emerald-300"/>
            <p className="mt-5 font-mono text-xs tracking-[.3em] text-amber-200">{tr("DOCUMENTED HISTORY RECONSTRUCTED")}</p>
            <h3 className="mt-3 font-display text-2xl tracking-wider">{tr("EVIDENCE 02")}</h3>
            <h4 className="mt-2 text-xl text-cyan-200">{tr("THE LAST TRANSMISSION")}</h4>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">{tr("Opportunity last communicated on June 10, 2018. NASA continued recovery commands and listening attempts, but no subsequent rover reply was received. Mission end was announced February 13, 2019.")}</p>
            <p className="mt-3 text-xs text-amber-100/70">{tr("This evidence is a documented communication chronology, not proof of the rover's physical condition after contact was lost.")}</p>
            {collected ? (
              <div className="mt-6 flex flex-col items-center gap-3">
                <span role="status" className="text-xs font-mono tracking-widest text-emerald-300">{tr("EVIDENCE 02 SAVED TO CASE FILE")}</span>
                <button type="button" onClick={onClose} className="rounded-full bg-cyan-300 px-6 py-3 text-xs font-bold text-slate-950">{tr("RETURN TO MISSION FILE")}</button>
              </div>
            ) : (
              <button type="button" onClick={file} className="mt-6 flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-xs font-bold tracking-wider text-slate-950"><FileCheck2 size={18}/> CAPTURE EVIDENCE 02</button>
            )}
          </div>
        )}
        <footer className="mt-auto border-t border-cyan-300/15 pt-4 text-[10px] text-slate-500">{tr("NASA DOCUMENTED HISTORY · THE LAST SIGNAL / OPPORTUNITY")}</footer>
      </div>
    </section>
  )
}
