import { useEffect, useState } from 'react'
import GameIcon from '../components/GameIcon'
import type { PlayerProfile } from '../types'
import { listUsers, loginOrCreate } from '../store/profile'
import { playUiSound } from '../store/audio'
import { assetUrl } from '../utils/assets'

const covers = [
  { src: assetUrl('art/covers/core-worlds.png'), eyebrow: '四大材料世界', line: '战胜污染外壳，找回材料价值' },
  { src: assetUrl('art/covers/pollution-shell.png'), eyebrow: '上海首发行动', line: '从陆家嘴出发，夺回稳定原型' },
  { src: assetUrl('art/covers/public-action.png'), eyebrow: '游戏连接现实', line: '收集原型凭证，解锁公益行动纪念' },
]

export default function StartScreen({ onLogin }: { onLogin: (profile: PlayerProfile) => void }) {
  const [slide, setSlide] = useState(0)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const users = listUsers().slice(0, 3)

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % covers.length), 3000)
    return () => window.clearInterval(timer)
  }, [])

  const enter = (name = username) => {
    try {
      playUiSound('success')
      onLogin(loginOrCreate(name))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '无法创建存档')
    }
  }

  return (
    <div className="start-screen">
      <div className="cover-stack" aria-live="polite">
        {covers.map((cover, index) => <img key={cover.src} className={index === slide ? 'active' : ''} src={cover.src} alt={cover.line} />)}
      </div>
      <div className="cover-vignette" />
      <button className="carousel-arrow prev" onClick={() => setSlide((slide + covers.length - 1) % covers.length)} aria-label="上一张封面"><span className="control-arrow" /></button>
      <button className="carousel-arrow next" onClick={() => setSlide((slide + 1) % covers.length)} aria-label="下一张封面"><span className="control-arrow" /></button>

      <section className="login-panel">
        <div className="title-lockup">
          <span className="title-kicker">S-GAME / 废料环线</span>
          <h1>守住价值<br /><em>不是垃圾。</em></h1>
          <p><strong>{covers[slide].eyebrow}</strong> · {covers[slide].line}</p>
        </div>
        <div className="login-card">
          <label htmlFor="username">用户名存档</label>
          <div className="name-field"><GameIcon name="user" size={38} /><input id="username" maxLength={12} value={username} onChange={(event) => { setUsername(event.target.value); setError('') }} onKeyDown={(event) => event.key === 'Enter' && enter()} placeholder="输入 1–12 个字符" autoComplete="nickname" /></div>
          {error && <span className="field-error">{error}</span>}
          <button className="primary-button start-button" onClick={() => enter()}><GameIcon name="prototype" size={38} /> 开始游戏</button>
          {users.length > 0 && <div className="recent-users"><span>继续最近存档</span>{users.map((user) => <button key={user.username} onClick={() => enter(user.username)}><b>LV.{user.level}</b>{user.username}</button>)}</div>}
          <small>无需密码。存档仅保存在当前设备浏览器中。</small>
        </div>
      </section>

      <div className="carousel-dots" aria-label="封面位置">
        {covers.map((_, index) => <button key={index} className={slide === index ? 'active' : ''} onClick={() => setSlide(index)} aria-label={`第 ${index + 1} 张封面`} />)}
      </div>
    </div>
  )
}
