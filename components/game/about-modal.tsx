'use client'

import { CREDITS } from '@/lib/credits'
import { HoloDialog } from './holo-dialog'

export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <HoloDialog open={open} onClose={onClose} eyebrow="ABOUT / CREDITS" title="THE LAST SIGNAL">
      <p className="text-pretty leading-relaxed text-frost/85">
        <span className="italic text-hud">Echoes of Exploration.</span> A cinematic investigation game set at a
        remote Mars outpost. Piece together fading transmissions, recover mission records, and uncover the
        story behind the last signal.
      </p>

      <dl className="mt-6 flex flex-col gap-4">
        {CREDITS.map((section) => (
          <div key={section.role} className="border-l border-hud/40 pl-4">
            <dt className="text-[10px] font-semibold tracking-[0.3em] text-hud uppercase">{section.role}</dt>
            {section.entries.map((entry) => (
              <dd key={entry} className="mt-1 text-sm text-frost/85">
                {entry}
              </dd>
            ))}
          </div>
        ))}
      </dl>

      <p className="mt-6 text-xs leading-relaxed text-frost/50">
        Fan-made prototype. Not affiliated with or endorsed by NASA or JPL. All in-game telemetry is simulated.
      </p>
    </HoloDialog>
  )
}
