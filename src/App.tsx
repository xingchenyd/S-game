import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import GameShell from './components/GameShell'
import Toast, { type ToastMessage } from './components/Toast'
import EquipmentScreen from './screens/EquipmentScreen'
import ExchangeScreen from './screens/ExchangeScreen'
import HubScreen from './screens/HubScreen'
import MuseumScreen from './screens/MuseumScreen'
import ProfileScreen from './screens/ProfileScreen'
import StartScreen from './screens/StartScreen'
import TheaterScreen from './screens/TheaterScreen'
import TrainingScreen from './screens/TrainingScreen'
import SkillTreeScreen from './screens/SkillTreeScreen'
import { loadActiveProfile, logout, resetEventProfile, saveProfile } from './store/profile'
import { resumeAudio, setMasterVolume, startMusic, stopMusic, type MusicScene } from './store/audio'
import type { PlayerProfile, Screen } from './types'

const AdventureScreen = lazy(() => import('./screens/AdventureScreen'))

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadActiveProfile())
  const [screen, setScreen] = useState<Screen>('hub')
  const [immersive, setImmersive] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [eventCountdown, setEventCountdown] = useState<number | null>(null)
  const [transitionLabel, setTransitionLabel] = useState<string | null>(null)
  const transitionTimers = useRef<number[]>([])

  useEffect(() => {
    if (!profile) return
    document.documentElement.dataset.reduceMotion = String(profile.settings.reducedMotion)
    setMasterVolume(profile.settings.masterVolume)
    startMusic(screen as MusicScene, profile.settings.musicVolume * profile.settings.masterVolume)
    const unlock = () => resumeAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => { stopMusic(); window.removeEventListener('pointerdown', unlock) }
  }, [profile?.settings.masterVolume, profile?.settings.musicVolume, profile?.settings.reducedMotion, screen])

  useEffect(() => {
    if (!profile?.settings.eventMode) return
    let resetTimer = 0
    let warningTimer = 0
    let countdownTimer = 0
    const finish = () => {
      resetEventProfile(profile.username)
      logout()
      setProfile(null)
      setScreen('hub')
      setEventCountdown(null)
    }
    const schedule = () => {
      window.clearTimeout(resetTimer); window.clearTimeout(warningTimer); window.clearInterval(countdownTimer); setEventCountdown(null)
      warningTimer = window.setTimeout(() => {
        let remaining = 30; setEventCountdown(remaining)
        countdownTimer = window.setInterval(() => { remaining -= 1; setEventCountdown(remaining) }, 1000)
      }, 4.5 * 60 * 1000)
      resetTimer = window.setTimeout(finish, 5 * 60 * 1000)
    }
    schedule()
    const reset = () => schedule()
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    return () => { window.clearTimeout(resetTimer); window.clearTimeout(warningTimer); window.clearInterval(countdownTimer); window.removeEventListener('pointerdown', reset); window.removeEventListener('keydown', reset) }
  }, [profile?.settings.eventMode, profile?.username])

  const updateProfile = useCallback((next: PlayerProfile) => setProfile(saveProfile(next)), [])
  const notify = useCallback((text: string, tone: 'success' | 'warning' = 'success') => setToast({ id: Date.now(), text, tone }), [])
  const navigate = (next: Screen) => {
    if (next === screen) return
    const labels: Record<Screen, string> = { start: '启动', hub: '循环基地', adventure: '城市行动', museum: '价值展馆', theater: '循环剧场', training: '系统训练', profile: '行动档案', equipment: '装备工坊', skills: '循环能力', exchange: '现实兑换' }
    if (profile?.settings.reducedMotion) { setImmersive(false); setScreen(next); window.scrollTo({ top: 0 }); return }
    transitionTimers.current.forEach(window.clearTimeout)
    setTransitionLabel(labels[next])
    transitionTimers.current = [
      window.setTimeout(() => { setImmersive(false); setScreen(next); window.scrollTo({ top: 0 }) }, 210),
      window.setTimeout(() => { setTransitionLabel(null); transitionTimers.current = [] }, 720),
    ]
  }

  useEffect(() => () => transitionTimers.current.forEach(window.clearTimeout), [])

  if (!profile) return <><StartScreen onLogin={(value) => { setProfile(value); setScreen('hub') }} /><Toast message={toast} onDone={() => setToast(null)} /></>

  let content
  switch (screen) {
    case 'adventure': content = <Suspense fallback={<div className="loading-screen"><span /><b>正在装配行动场景…</b></div>}><AdventureScreen profile={profile} onChange={updateProfile} onImmersive={setImmersive} /></Suspense>; break
    case 'museum': content = <MuseumScreen profile={profile} />; break
    case 'theater': content = <TheaterScreen profile={profile} onChange={updateProfile} />; break
    case 'training': content = <TrainingScreen profile={profile} onChange={updateProfile} />; break
    case 'equipment': content = <EquipmentScreen profile={profile} onChange={updateProfile} notify={notify} />; break
    case 'skills': content = <SkillTreeScreen profile={profile} onChange={updateProfile} notify={notify} />; break
    case 'exchange': content = <ExchangeScreen profile={profile} onChange={updateProfile} notify={notify} />; break
    case 'profile': content = <ProfileScreen profile={profile} onChange={updateProfile} notify={notify} onLogout={() => { logout(); setProfile(null); setScreen('hub') }} onEventReset={() => { setProfile(resetEventProfile(profile.username)); setScreen('hub'); notify('展会存档已重置', 'success') }} />; break
    default: content = <HubScreen profile={profile} onNavigate={navigate} />
  }

  return <>
    <GameShell profile={profile} screen={screen} onNavigate={navigate} onSettingsChange={updateProfile} immersive={immersive}>{content}</GameShell>
    {transitionLabel && <div className="scene-transition" aria-hidden="true"><span /><div><small>ROUTE LINK</small><b>{transitionLabel}</b><i /></div></div>}
    {eventCountdown !== null && <button className="event-countdown" onClick={() => setEventCountdown(null)}><b>{eventCountdown}</b><span>秒后清空展会存档并返回开始页<br />点击或按键即可继续本局</span></button>}
    <Toast message={toast} onDone={() => setToast(null)} />
  </>
}
