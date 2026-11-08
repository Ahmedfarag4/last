export type SoundName = 'hover' | 'click' | 'start' | 'archives' | 'settings' | 'back'

type FilterSpec = {
  type: BiquadFilterType
  freq: number
  freqEnd?: number
  q?: number
}

type ToneSpec = {
  type: OscillatorType
  freq: number
  freqEnd?: number
  at?: number
  dur: number
  gain: number
  attack?: number
  detune?: number
  filter?: FilterSpec
}

type NoiseSpec = {
  at?: number
  dur: number
  gain: number
  attack?: number
  filter: FilterSpec
}

const COOLDOWN_MS: Record<SoundName, number> = {
  hover: 70,
  click: 90,
  start: 600,
  archives: 300,
  settings: 300,
  back: 200,
}

const DURATION_S: Record<SoundName, number> = {
  hover: 0.08,
  click: 0.3,
  start: 1.8,
  archives: 0.7,
  settings: 0.75,
  back: 0.5,
}

const MAX_VOICES = 6

/**
 * Real-time synthesized spacecraft UI sounds (Web Audio API).
 * The AudioContext is only created after a user gesture to respect autoplay policies.
 */
class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private volume = 0.7
  private muted = false
  private lastPlayed = new Map<SoundName, number>()
  private voices = 0

  unlock() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      const ctx = new Ctor()
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -16
      compressor.knee.value = 12
      compressor.ratio.value = 4
      compressor.attack.value = 0.003
      compressor.release.value = 0.2
      const master = ctx.createGain()
      master.gain.value = this.targetGain()
      master.connect(compressor).connect(ctx.destination)

      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

      this.ctx = ctx
      this.master = master
      this.noise = buffer
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume))
    this.applyGain()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    this.applyGain()
  }

  play(name: SoundName) {
    const ctx = this.ctx
    if (!ctx || !this.master || this.muted || this.volume <= 0) return
    if (ctx.state === 'suspended') void ctx.resume()

    const nowMs = performance.now()
    const last = this.lastPlayed.get(name) ?? 0
    if (nowMs - last < COOLDOWN_MS[name]) return
    if (this.voices >= MAX_VOICES && name === 'hover') return
    this.lastPlayed.set(name, nowMs)

    this.voices++
    window.setTimeout(() => {
      this.voices = Math.max(0, this.voices - 1)
    }, DURATION_S[name] * 1000)

    const t = ctx.currentTime + 0.005
    switch (name) {
      case 'hover':
        return this.hover(t)
      case 'click':
        return this.click(t)
      case 'start':
        return this.start(t)
      case 'archives':
        return this.archives(t)
      case 'settings':
        return this.settings(t)
      case 'back':
        return this.back(t)
    }
  }

  private targetGain() {
    return this.muted ? 0 : this.volume * 0.85
  }

  private applyGain() {
    if (!this.ctx || !this.master) return
    this.master.gain.setTargetAtTime(this.targetGain(), this.ctx.currentTime, 0.03)
  }

  private envelope(gain: GainNode, t: number, peak: number, attack: number, dur: number) {
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(peak, t + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  }

  private makeFilter(spec: FilterSpec, t: number, dur: number) {
    const ctx = this.ctx!
    const filter = ctx.createBiquadFilter()
    filter.type = spec.type
    filter.Q.value = spec.q ?? 0.8
    filter.frequency.setValueAtTime(spec.freq, t)
    if (spec.freqEnd) filter.frequency.exponentialRampToValueAtTime(spec.freqEnd, t + dur)
    return filter
  }

  private tone(base: number, spec: ToneSpec) {
    const ctx = this.ctx!
    const t = base + (spec.at ?? 0)
    const osc = ctx.createOscillator()
    osc.type = spec.type
    osc.frequency.setValueAtTime(spec.freq, t)
    if (spec.freqEnd) osc.frequency.exponentialRampToValueAtTime(spec.freqEnd, t + spec.dur)
    if (spec.detune) osc.detune.value = spec.detune
    const gain = ctx.createGain()
    this.envelope(gain, t, spec.gain, spec.attack ?? 0.004, spec.dur)
    let node: AudioNode = osc
    if (spec.filter) {
      const filter = this.makeFilter(spec.filter, t, spec.dur)
      node.connect(filter)
      node = filter
    }
    node.connect(gain).connect(this.master!)
    osc.start(t)
    osc.stop(t + spec.dur + 0.05)
  }

  private burst(base: number, spec: NoiseSpec) {
    const ctx = this.ctx!
    const t = base + (spec.at ?? 0)
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = this.makeFilter(spec.filter, t, spec.dur)
    const gain = ctx.createGain()
    this.envelope(gain, t, spec.gain, spec.attack ?? 0.002, spec.dur)
    src.connect(filter).connect(gain).connect(this.master!)
    const offset = Math.random() * 0.5
    src.start(t, offset)
    src.stop(t + spec.dur + 0.05)
  }

  /** Quiet metallic-electronic detection tick. */
  private hover(t: number) {
    this.burst(t, { dur: 0.022, gain: 0.09, filter: { type: 'highpass', freq: 5200, q: 0.7 } })
    this.tone(t, { type: 'sine', freq: 3300, freqEnd: 2700, dur: 0.05, gain: 0.022 })
    this.tone(t, { type: 'triangle', freq: 1650, dur: 0.028, gain: 0.012, at: 0.004 })
  }

  /** Layered mechanical switch, low resonance, short digital confirmation. */
  private click(t: number, intensity = 1) {
    this.burst(t, { dur: 0.026, gain: 0.26 * intensity, filter: { type: 'bandpass', freq: 2600, q: 2.2 } })
    this.burst(t, { at: 0.014, dur: 0.04, gain: 0.12 * intensity, filter: { type: 'bandpass', freq: 950, q: 1.6 } })
    this.tone(t, { type: 'sine', freq: 118, freqEnd: 46, dur: 0.24, gain: 0.32 * intensity })
    this.tone(t, {
      type: 'triangle',
      freq: 1244,
      at: 0.05,
      dur: 0.07,
      gain: 0.045 * intensity,
      filter: { type: 'lowpass', freq: 4200 },
    })
    this.tone(t, {
      type: 'triangle',
      freq: 1864,
      at: 0.1,
      dur: 0.1,
      gain: 0.04 * intensity,
      filter: { type: 'lowpass', freq: 4200 },
    })
  }

  /** Deeper spacecraft system activation sequence. */
  private start(t: number) {
    this.click(t, 1)
    const filter: FilterSpec = { type: 'lowpass', freq: 160, freqEnd: 1500, q: 3 }
    this.tone(t, { type: 'sawtooth', freq: 55, dur: 1.55, gain: 0.1, attack: 0.35, filter })
    this.tone(t, { type: 'sawtooth', freq: 55, detune: 9, dur: 1.55, gain: 0.08, attack: 0.35, filter })
    this.tone(t, { type: 'sine', freq: 41, dur: 1.6, gain: 0.26, attack: 0.25 })
    this.tone(t, { type: 'sine', freq: 220, freqEnd: 880, at: 0.1, dur: 1.15, gain: 0.03, attack: 0.5 })
    this.burst(t, {
      at: 0.05,
      dur: 1.2,
      gain: 0.05,
      attack: 0.6,
      filter: { type: 'bandpass', freq: 380, freqEnd: 3200, q: 1.1 },
    })
    ;[659.25, 880, 1318.5].forEach((freq, i) => {
      this.tone(t, {
        type: 'triangle',
        freq,
        at: 1.02 + i * 0.075,
        dur: 0.32,
        gain: 0.035,
        filter: { type: 'lowpass', freq: 5000 },
      })
    })
  }

  /** Brief digital scanning + archive access. */
  private archives(t: number) {
    this.click(t, 0.8)
    for (let i = 0; i < 8; i++) {
      this.burst(t, {
        at: 0.06 + i * 0.042,
        dur: 0.018,
        gain: 0.07,
        filter: { type: 'bandpass', freq: 1500 + i * 420, q: 6 },
      })
      this.tone(t, {
        type: 'triangle',
        freq: 2000 + i * 140,
        at: 0.06 + i * 0.042,
        dur: 0.02,
        gain: 0.014,
      })
    }
    this.tone(t, {
      type: 'sine',
      freq: 600,
      freqEnd: 2400,
      at: 0.05,
      dur: 0.42,
      gain: 0.018,
      attack: 0.1,
    })
    this.tone(t, { type: 'triangle', freq: 1760, at: 0.46, dur: 0.16, gain: 0.04 })
    this.tone(t, { type: 'triangle', freq: 2349, at: 0.52, dur: 0.18, gain: 0.03 })
  }

  /** Subtle holographic panel opening. */
  private settings(t: number) {
    this.click(t, 0.6)
    this.burst(t, {
      at: 0.02,
      dur: 0.5,
      gain: 0.055,
      attack: 0.16,
      filter: { type: 'bandpass', freq: 600, freqEnd: 3400, q: 1.4 },
    })
    ;[523.25, 783.99, 1046.5].forEach((freq, i) => {
      this.tone(t, { type: 'sine', freq, at: 0.05, dur: 0.62, gain: 0.022, attack: 0.14, detune: (i - 1) * 7 })
      this.tone(t, { type: 'sine', freq, at: 0.05, dur: 0.62, gain: 0.014, attack: 0.18, detune: (1 - i) * 9 })
    })
  }

  /** Soft descending system deactivation. */
  private back(t: number) {
    this.burst(t, { dur: 0.024, gain: 0.12, filter: { type: 'bandpass', freq: 1700, q: 2 } })
    this.tone(t, {
      type: 'sine',
      freq: 880,
      freqEnd: 220,
      dur: 0.38,
      gain: 0.055,
      filter: { type: 'lowpass', freq: 3200, freqEnd: 500 },
    })
    this.tone(t, { type: 'triangle', freq: 660, freqEnd: 330, at: 0.05, dur: 0.3, gain: 0.026 })
    this.tone(t, { type: 'sine', freq: 96, freqEnd: 44, dur: 0.26, gain: 0.16 })
  }
}

export const audio = new AudioManager()
