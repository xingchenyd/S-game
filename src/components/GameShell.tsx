import { useEffect, useState, type ReactNode } from 'react'
import type { PlayerProfile, Screen } from '../types'
import PixelIcon from './PixelIcon'
import GameIcon from './GameIcon'

interface Props {
  children: ReactNode
  profile: PlayerProfile
  screen: Screen
  onNavigate: (screen: Screen) => void
  onSettingsChange: (profile: PlayerProfile) => void
  immersive?: boolean
}

const nav: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'hub', label: '基地', icon: 'home' },
  { screen: 'adventure', label: '行动', icon: 'map' },
  { screen: 'training', label: '训练', icon: 'shield-check' },
  { screen: 'museum', label: '展馆', icon: 'archive-box' },
  { screen: 'theater', label: '剧场', icon: 'book' },
  { screen: 'skills', label: '能力', icon: 'sparkles' },
  { screen: 'profile', label: '档案', icon: 'user-avatar' },
]

export default function GameShell({ children, profile, screen, onNavigate, onSettingsChange, immersive }: Props) {
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement))
  const [volumeOpen, setVolumeOpen] = useState(false)

  useEffect(() => {
    const handle = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handle)
    return () => document.removeEventListener('fullscreenchange', handle)
  }, [])

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  }

  const setVolume = (value: number) => {
    onSettingsChange({ ...profile, settings: { ...profile.settings, masterVolume: value } })
  }

  return (
    <div className={`game-shell screen-${screen} ${immersive ? 'is-immersive' : ''} ${screen === 'hub' ? 'is-world' : ''} ${profile.settings.highContrast ? 'high-contrast' : ''}`}>
      {!immersive && (
        <header className="top-rail">
          <button className="brand-chip" onClick={() => onNavigate('hub')} aria-label="返回基地">
            <span className="brand-mark">S</span><span>废料环线</span>
          </button>
          <div className="player-chip">
            <span className="level-badge">LV.{profile.level}</span>
            <strong>{profile.username}</strong>
            <span className="currency">◈ {profile.points}</span>
          </div>
        </header>
      )}

      <main className="game-content">{children}</main>

      {!immersive && (
        <nav className="dock" aria-label="主要功能">
          {nav.map((item) => (
            <button key={item.screen} className={screen === item.screen ? 'active' : ''} onClick={() => onNavigate(item.screen)}>
              <PixelIcon name={item.icon} size={28} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="system-rail" aria-label="系统控制">
        <div className={`volume-popover ${volumeOpen ? 'open' : ''}`}>
          <label htmlFor="master-volume">总音量 {Math.round(profile.settings.masterVolume * 100)}%</label>
          <input id="master-volume" type="range" min="0" max="1" step="0.05" value={profile.settings.masterVolume} onChange={(event) => setVolume(Number(event.target.value))} />
        </div>
        <button onClick={() => setVolumeOpen((value) => !value)} aria-label="调节音量" aria-expanded={volumeOpen}>
          <GameIcon name="volume" size={30} />
          <span>音量</span>
        </button>
        <button onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '进入全屏'}>
          <GameIcon name="fullscreen" size={30} /><span>{fullscreen ? '退出全屏' : '全屏'}</span>
        </button>
      </div>
    </div>
  )
}
