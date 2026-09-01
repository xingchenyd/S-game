let context: AudioContext | null = null
let master: GainNode | null = null
let ambientTimer: number | null = null

const ensure = () => {
  if (context) return context
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  context = new AudioContextClass()
  master = context.createGain()
  master.connect(context.destination)
  return context
}

export const setMasterVolume = (value: number) => {
  if (!master) return
  master.gain.value = Math.max(0, Math.min(1, value))
}

export const playUiSound = (kind: 'hover' | 'click' | 'success' | 'danger', volume = 0.6) => {
  const ctx = ensure()
  if (ctx.state === 'suspended') void ctx.resume()
  if (!master) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  const frequencies = { hover: 420, click: 260, success: 680, danger: 130 }
  osc.type = kind === 'danger' ? 'sawtooth' : 'square'
  osc.frequency.setValueAtTime(frequencies[kind], now)
  if (kind === 'success') osc.frequency.exponentialRampToValueAtTime(1080, now + 0.11)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.06), now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'success' ? 0.18 : 0.08))
  osc.connect(gain)
  gain.connect(master)
  osc.start(now)
  osc.stop(now + 0.2)
}

export const startAmbient = (volume = 0.35) => {
  stopAmbient()
  const notes = [110, 146.83, 164.81, 130.81]
  let index = 0
  const play = () => {
    const ctx = ensure()
    if (!master || ctx.state === 'suspended') return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const now = ctx.currentTime
    osc.type = 'triangle'
    osc.frequency.value = notes[index++ % notes.length]
    gain.gain.setValueAtTime(.0001, now)
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume * .012), now + .18)
    gain.gain.exponentialRampToValueAtTime(.0001, now + 1.8)
    osc.connect(gain); gain.connect(master); osc.start(now); osc.stop(now + 1.9)
  }
  play()
  ambientTimer = window.setInterval(play, 2400)
}

export const stopAmbient = () => {
  if (ambientTimer !== null) window.clearInterval(ambientTimer)
  ambientTimer = null
}
