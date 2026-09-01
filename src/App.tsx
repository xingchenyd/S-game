import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import GameShell from './components/GameShell'
import Toast, { type ToastMessage } from './components/Toast'
import EquipmentScreen from './screens/EquipmentScreen'
import ExchangeScreen from './screens/ExchangeScreen'
import HubScreen from './screens/HubScreen'
import MuseumScreen from './screens/MuseumScreen'
import ProfileScreen from './screens/ProfileScreen'
import StartScreen from './screens/StartScreen'
import TheaterScreen from './screens/TheaterScreen'
import { loadActiveProfile, logout, resetEventProfile, saveProfile } from './store/profile'
import { setMasterVolume, startAmbient, stopAmbient } from './store/audio'
import type { PlayerProfile, Screen } from './types'

const AdventureScreen = lazy(() => import('./screens/AdventureScreen'))

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadActiveProfile())
  const [screen, setScreen] = useState<Screen>('hub')
  const [immersive, setImmersive] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  useEffect(() => {
    if (!profile) return
    document.documentElement.dataset.reduceMotion = String(profile.settings.reducedMotion)
    setMasterVolume(profile.settings.masterVolume)
    startAmbient(profile.settings.musicVolume * profile.settings.masterVolume)
    return stopAmbient
  }, [profile?.settings.masterVolume, profile?.settings.musicVolume, profile?.settings.reducedMotion])

  useEffect(() => {
    if (!profile?.settings.eventMode) return
    let timer = window.setTimeout(() => {
      resetEventProfile(profile.username)
      logout()
      setProfile(null)
      setScreen('hub')
    }, 5 * 60 * 1000)
    const reset = () => { window.clearTimeout(timer); timer = window.setTimeout(() => { resetEventProfile(profile.username); logout(); setProfile(null); setScreen('hub') }, 5 * 60 * 1000) }
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    return () => { window.clearTimeout(timer); window.removeEventListener('pointerdown', reset); window.removeEventListener('keydown', reset) }
  }, [profile?.settings.eventMode, profile?.username])

  const updateProfile = useCallback((next: PlayerProfile) => setProfile(saveProfile(next)), [])
  const notify = useCallback((text: string, tone: 'success' | 'warning' = 'success') => setToast({ id: Date.now(), text, tone }), [])
  const navigate = (next: Screen) => { setImmersive(false); setScreen(next); window.scrollTo({ top: 0, behavior: profile?.settings.reducedMotion ? 'auto' : 'smooth' }) }

  if (!profile) return <><StartScreen onLogin={(value) => { setProfile(value); setScreen('hub') }} /><Toast message={toast} onDone={() => setToast(null)} /></>

  let content
  switch (screen) {
    case 'adventure': content = <Suspense fallback={<div className="loading-screen"><span /><b>正在装配行动场景…</b></div>}><AdventureScreen profile={profile} onChange={updateProfile} onImmersive={setImmersive} /></Suspense>; break
    case 'museum': content = <MuseumScreen profile={profile} />; break
    case 'theater': content = <TheaterScreen profile={profile} onChange={updateProfile} />; break
    case 'equipment': content = <EquipmentScreen profile={profile} onChange={updateProfile} notify={notify} />; break
    case 'exchange': content = <ExchangeScreen profile={profile} onChange={updateProfile} notify={notify} />; break
    case 'profile': content = <ProfileScreen profile={profile} onChange={updateProfile} notify={notify} onLogout={() => { logout(); setProfile(null); setScreen('hub') }} onEventReset={() => { setProfile(resetEventProfile(profile.username)); setScreen('hub'); notify('展会存档已重置', 'success') }} />; break
    default: content = <HubScreen profile={profile} onNavigate={navigate} />
  }

  return <>
    <GameShell profile={profile} screen={screen} onNavigate={navigate} onSettingsChange={updateProfile} immersive={immersive}>{content}</GameShell>
    <Toast message={toast} onDone={() => setToast(null)} />
  </>
}
