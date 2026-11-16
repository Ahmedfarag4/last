'use client'

import { useState } from 'react'
import { ArrowLeft, Film, Play } from 'lucide-react'

type Cinematic = {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  src: string
  poster?: string
}

// Add only real, uploaded AI-generated team videos here. No placeholder files.
export const OPPORTUNITY_CINEMATICS: Cinematic[] = []

export function MissionCinematics({ onBack, onExit, arabic }: { onBack: () => void; onExit: () => void; arabic: boolean }) {
  const [active, setActive] = useState<string | null>(null)
  const current = OPPORTUNITY_CINEMATICS.find(video => video.id === active)
  return (
    <section className="fixed inset-0 z-40 overflow-y-auto bg-[#020813] p-5 text-[#ecf4fc] sm:p-9" dir={arabic ? 'rtl' : 'ltr'} lang={arabic ? 'ar' : 'en'}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-400/25 pb-5">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 px-4 py-2 text-sm hover:bg-cyan-400/10"><ArrowLeft size={15}/>{arabic ? 'العودة للتحقيق' : 'Back to investigation'}</button>
          <span className="font-mono text-xs tracking-widest text-cyan-300">THE LAST SIGNAL · OPPORTUNITY</span>
        </header>
        <div className="rounded-2xl border border-amber-400/30 bg-[#0a1826] p-6 sm:p-9">
          <p className="font-mono text-xs uppercase tracking-[.25em] text-amber-300">{arabic ? 'التحقيق مكتمل' : 'INVESTIGATION COMPLETE'}</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-5xl">{arabic ? 'الإشارة الأخيرة' : 'THE LAST SIGNAL'}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{arabic ? 'أكملت ملف Opportunity وجمعت الأدلة العلمية الأساسية. يمكنك العودة للتحقيق في أي وقت.' : 'You completed the Opportunity investigation and collected the scientific evidence. Your progress remains saved.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Film className="text-cyan-300" size={24}/>
          <h2 className="font-display text-xl">{arabic ? 'أفلام مراحل المهمة' : 'MISSION CINEMATICS'}</h2>
        </div>
        <p className="text-sm text-slate-400">{arabic ? 'هذه المشاهد تفسيرات سينمائية منشأة بالذكاء الاصطناعي وليست لقطات أصلية لناسا.' : 'These are AI-generated cinematic interpretations, not original NASA mission footage.'}</p>
        {current ? (
          <article className="rounded-2xl border border-cyan-400/30 bg-[#061523] p-4">
            <button type="button" onClick={() => setActive(null)} className="mb-3 text-sm text-cyan-300">{arabic ? 'العودة لكل الفيديوهات' : 'Back to all videos'}</button>
            <video key={current.id} controls playsInline preload="metadata" poster={current.poster} src={current.src} className="aspect-video w-full rounded-xl bg-black" />
            <h3 className="mt-3 text-lg">{arabic ? current.titleAr : current.title}</h3>
          </article>
        ) : OPPORTUNITY_CINEMATICS.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OPPORTUNITY_CINEMATICS.map((video, i) => (
              <button key={video.id} type="button" onClick={() => setActive(video.id)} className="rounded-2xl border border-cyan-400/25 bg-[#0b1c2a] p-5 text-start hover:border-cyan-400/70">
                <div className="flex aspect-video items-center justify-center rounded-lg bg-black/50"><Play size={32} className="text-cyan-300"/></div>
                <span className="mt-4 block font-mono text-xs text-amber-300">{String(i+1).padStart(2,'0')}</span>
                <h3 className="mt-1 text-base font-semibold">{arabic ? video.titleAr : video.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">{arabic ? video.descriptionAr : video.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-cyan-400/25 bg-[#061420]/70 p-8 text-center text-sm text-slate-300">
            {arabic ? 'ستظهر هنا فيديوهات مراحل المهمة بعد إضافة ملفات الفريق. لم تُضف أي فيديوهات غير موجودة.' : 'Team-produced mission videos will appear here when their files are added. No unavailable videos are displayed.'}
          </div>
        )}
        <button type="button" onClick={onExit} className="self-start rounded-full border border-cyan-400/50 px-5 py-2 text-sm text-cyan-200 hover:bg-cyan-400/10">{arabic ? 'العودة للقائمة' : 'Return to menu'}</button>
      </div>
    </section>
  )
}
