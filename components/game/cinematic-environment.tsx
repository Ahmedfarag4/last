'use client'

import Image from 'next/image'
import { DustParticles } from './dust-particles'
import { SignalWaveform } from './signal-waveform'

/** Background image aspect ratio (1376 × 768). Overlays are positioned in % of this stage. */
const STAGE_RATIO = 1376 / 768

export function CinematicEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: `max(100vw, calc(100dvh * ${STAGE_RATIO}))`,
          height: `max(100dvh, calc(100vw / ${STAGE_RATIO}))`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="parallax-far absolute inset-0">
          <div className="camera-drift absolute inset-0">
            <div className="intro-scene absolute inset-0">
              <Image
                src="/images/mars-outpost-bg.png"
                alt="A futuristic Mars outpost on a cliff edge overlooking a vast canyon at sunset, with a distant rover and a monitoring console in the foreground."
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

              <div
                aria-hidden
                className="sun-breathe pointer-events-none absolute left-[85%] top-[39%] h-[70%] w-[42%] mix-blend-screen"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(255,196,120,0.55), rgba(255,140,60,0.18) 45%, transparent 75%)',
                }}
              />
              <div
                aria-hidden
                className="warm-shift pointer-events-none absolute inset-0 mix-blend-soft-light"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 60% at 85% 40%, rgba(255,140,50,0.9), transparent 70%)',
                }}
              />

              <span
                aria-hidden
                className="beacon absolute left-[12.45%] top-[1.9%] size-[0.5%] min-h-1 min-w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hud shadow-[0_0_10px_3px_rgba(73,215,255,0.8)]"
              />
              <span
                aria-hidden
                className="beacon absolute left-[84.4%] top-[56.4%] size-[0.35%] min-h-1 min-w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_8px_2px_rgba(242,179,93,0.8)]"
                style={{ animationDelay: '1.3s' }}
              />

              {[0, 1.2, 2.4].map((delay) => (
                <span
                  key={delay}
                  aria-hidden
                  className="dish-ring absolute left-[21.6%] top-[28%] aspect-square w-[9%] rounded-full border border-hud/50"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}

              <div
                aria-hidden
                className="pointer-events-none absolute left-[62.4%] top-[77.6%] h-[17%] w-[37.6%] overflow-hidden mix-blend-screen"
              >
                <div
                  className="console-sweep absolute inset-y-0 left-0 w-[16%]"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(200,240,255,0.22), rgba(255,255,255,0.32), rgba(200,240,255,0.22), transparent)',
                  }}
                />
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute left-[64%] top-[82%] h-[8%] w-[9.6%] opacity-60 mix-blend-screen"
              >
                <SignalWaveform bars={30} color="#49D7FF" strokeWidth={1.2} className="h-full w-full" />
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute left-[76.3%] top-[79.6%] h-[11.4%] w-[11.3%] overflow-hidden mix-blend-screen"
              >
                <div
                  className="radar-spin absolute left-1/2 top-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
                  style={{
                    background:
                      'conic-gradient(from 0deg, rgba(73,215,255,0.55), rgba(73,215,255,0) 22%, transparent 100%)',
                  }}
                />
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute left-[62.4%] top-[78%] h-[16%] w-[37.6%] overflow-hidden opacity-40 mix-blend-screen"
              >
                <div className="scanline h-1/4 w-full bg-gradient-to-b from-transparent via-hud/25 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="haze-drift absolute bottom-[18%] left-0 h-[45%] w-[200%] opacity-70 mix-blend-screen blur-2xl"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,160,100,0.16), transparent 70%)',
            backgroundSize: '25% 100%',
            backgroundRepeat: 'repeat-x',
          }}
        />
        <div
          className="haze-drift-slow absolute bottom-[4%] left-0 h-[35%] w-[200%] opacity-60 mix-blend-screen blur-3xl"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,140,80,0.14), transparent 70%)',
            backgroundSize: '33.333% 100%',
            backgroundRepeat: 'repeat-x',
          }}
        />
      </div>

      <DustParticles reducedMotion={reducedMotion} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 34% 44% at 50% 42%, rgba(8,17,27,0.5), transparent 72%)',
            'linear-gradient(to bottom, rgba(8,17,27,0.55), transparent 32%)',
            'linear-gradient(to top, rgba(8,17,27,0.45), transparent 28%)',
            'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 60%, rgba(4,9,15,0.55) 100%)',
          ].join(','),
        }}
      />

      <div aria-hidden className="intro-blackout pointer-events-none absolute inset-0 bg-black" />
    </div>
  )
}
