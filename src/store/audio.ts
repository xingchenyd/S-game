export type MusicScene = 'start' | 'hub' | 'adventure' | 'museum' | 'theater' | 'training' | 'equipment' | 'skills' | 'exchange' | 'profile' | 'boss' | 'result'
interface Score { name: string; tempo: number; root: number; scale: number[]; bass: number[]; lead: number[]; wave: OscillatorType; color: number }

const scores: Record<MusicScene, Score> = {
  start: { name: '三枚原型', tempo: 82, root: 55, scale: [0, 3, 5, 7, 10], bass: [0, 0, 3, 5], lead: [0, 2, 4, 2, 3, 1, 4, 3], wave: 'triangle', color: .75 },
  hub: { name: '循环基地·晨', tempo: 94, root: 65.41, scale: [0, 2, 4, 7, 9], bass: [0, 4, 3, 4], lead: [0, 2, 4, 3, 2, 1, 3, 4], wave: 'triangle', color: .6 },
  adventure: { name: '城市行动线', tempo: 118, root: 55, scale: [0, 2, 3, 7, 9], bass: [0, 3, 4, 2], lead: [0, 2, 3, 4, 2, 1, 3, 2], wave: 'sawtooth', color: .72 },
  museum: { name: '材料的第二次呼吸', tempo: 72, root: 73.42, scale: [0, 2, 5, 7, 9], bass: [0, 2, 1, 3], lead: [0, 3, 2, 4, 3, 1, 2, 0], wave: 'sine', color: .5 },
  theater: { name: '物品开口以前', tempo: 68, root: 65.41, scale: [0, 3, 5, 8, 10], bass: [0, 3, 2, 1], lead: [0, 1, 3, 2, 4, 3, 1, 2], wave: 'triangle', color: .45 },
  training: { name: '系统实验室', tempo: 106, root: 61.74, scale: [0, 2, 5, 7, 10], bass: [0, 2, 4, 3], lead: [0, 3, 2, 4, 1, 3, 4, 2], wave: 'square', color: .48 },
  equipment: { name: '扳手与模块', tempo: 100, root: 55, scale: [0, 3, 5, 7, 10], bass: [0, 1, 3, 2], lead: [0, 2, 1, 3, 2, 4, 3, 1], wave: 'square', color: .4 },
  skills: { name: '城市经验树', tempo: 92, root: 61.74, scale: [0, 2, 5, 7, 9], bass: [0, 3, 1, 4], lead: [0, 1, 3, 2, 4, 2, 3, 1], wave: 'triangle', color: .58 },
  exchange: { name: '把原型带回现实', tempo: 88, root: 73.42, scale: [0, 2, 4, 7, 11], bass: [0, 3, 4, 2], lead: [0, 2, 4, 3, 1, 3, 4, 2], wave: 'triangle', color: .62 },
  profile: { name: '行动记录', tempo: 76, root: 65.41, scale: [0, 2, 4, 7, 9], bass: [0, 3, 1, 2], lead: [0, 1, 2, 4, 3, 2, 1, 0], wave: 'sine', color: .42 },
  boss: { name: '污染外壳', tempo: 136, root: 46.25, scale: [0, 1, 5, 6, 10], bass: [0, 2, 1, 4], lead: [0, 4, 1, 3, 2, 4, 1, 2], wave: 'sawtooth', color: .88 },
  result: { name: '稳定原型', tempo: 84, root: 82.41, scale: [0, 2, 4, 7, 9], bass: [0, 3, 4, 2], lead: [0, 2, 4, 3, 4, 2, 1, 0], wave: 'triangle', color: .62 },
}

let context: AudioContext | null = null
let master: GainNode | null = null
let musicBus: GainNode | null = null
let musicTimer: number | null = null
let musicStep = 0
let activeScene: MusicScene = 'hub'
let activeMusicVolume = .35

const ensure = () => {
  if (context) return context
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  context = new AudioContextClass(); master = context.createGain(); musicBus = context.createGain()
  musicBus.connect(master); master.connect(context.destination)
  return context
}
const midiRatio = (semitones: number) => 2 ** (semitones / 12)
const note = (frequency: number, duration: number, volume: number, wave: OscillatorType) => {
  const ctx = ensure()
  if (!musicBus || ctx.state === 'suspended') return
  const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filter = ctx.createBiquadFilter(); const now = ctx.currentTime
  osc.type = wave; osc.frequency.value = frequency; filter.type = 'lowpass'; filter.frequency.value = 1150
  gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), now + .025); gain.gain.exponentialRampToValueAtTime(.0001, now + duration)
  osc.connect(filter); filter.connect(gain); gain.connect(musicBus); osc.start(now); osc.stop(now + duration + .04)
}
const tick = () => {
  const score = scores[activeScene]; const beat = 60 / score.tempo
  const leadDegree = score.scale[score.lead[musicStep % score.lead.length] % score.scale.length]
  note(score.root * 2 * midiRatio(leadDegree), beat * .72, activeMusicVolume * .032 * score.color, score.wave)
  if (musicStep % 2 === 0) {
    const bassDegree = score.scale[score.bass[Math.floor(musicStep / 2) % score.bass.length] % score.scale.length]
    note(score.root * midiRatio(bassDegree), beat * 1.7, activeMusicVolume * .034, 'triangle')
  }
  if (musicStep % 4 === 2) note(score.root * 4, .035, activeMusicVolume * .012, 'square')
  musicStep += 1
}

export const setMasterVolume = (value: number) => { ensure(); if (master) master.gain.value = Math.max(0, Math.min(1, value)) }
export const playUiSound = (kind: 'hover' | 'click' | 'success' | 'danger', volume = .6) => {
  const ctx = ensure(); if (ctx.state === 'suspended') void ctx.resume(); if (!master) return
  const osc = ctx.createOscillator(); const gain = ctx.createGain(); const now = ctx.currentTime; const frequencies = { hover: 420, click: 260, success: 680, danger: 130 }
  osc.type = kind === 'danger' ? 'sawtooth' : 'square'; osc.frequency.setValueAtTime(frequencies[kind], now)
  if (kind === 'success') osc.frequency.exponentialRampToValueAtTime(1080, now + .11)
  gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume * .06), now + .01); gain.gain.exponentialRampToValueAtTime(.0001, now + (kind === 'success' ? .18 : .08))
  osc.connect(gain); gain.connect(master); osc.start(now); osc.stop(now + .2)
}
export const startMusic = (scene: MusicScene, volume = .35) => {
  const ctx = ensure(); activeScene = scene; activeMusicVolume = volume; musicStep = 0
  if (ctx.state === 'suspended') return
  if (musicTimer !== null) window.clearInterval(musicTimer)
  tick(); musicTimer = window.setInterval(tick, 60 / scores[scene].tempo * 1000)
}
export const resumeAudio = () => { const ctx = ensure(); if (ctx.state === 'suspended') void ctx.resume().then(() => startMusic(activeScene, activeMusicVolume)) }
export const stopMusic = () => { if (musicTimer !== null) window.clearInterval(musicTimer); musicTimer = null }
export const getScoreName = (scene: MusicScene) => scores[scene].name
export const speakChinese = (text: string, volume = .85, onEnd?: () => void) => {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'zh-CN'; utterance.rate = .96; utterance.pitch = 1; utterance.volume = volume
  const voices = window.speechSynthesis.getVoices(); utterance.voice = voices.find((voice) => /zh-CN|Chinese.*China/i.test(`${voice.lang} ${voice.name}`)) ?? voices.find((voice) => voice.lang.startsWith('zh')) ?? null
  utterance.onend = () => onEnd?.(); utterance.onerror = () => onEnd?.(); window.speechSynthesis.speak(utterance); return true
}
export const stopSpeech = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }
