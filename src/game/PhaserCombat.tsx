import Phaser from 'phaser'
import { useEffect, useRef } from 'react'
import type { AdventureDefinition, Difficulty, RunMetrics } from '../types'
import { playUiSound } from '../store/audio'

export interface BattleResult { purified: number; damageTaken: number; value: number }

interface Props {
  adventure: AdventureDefinition
  difficulty: Difficulty
  boss?: boolean
  builds: string[]
  initialPollution: number
  initialValue: number
  onHud: (hud: Partial<RunMetrics>) => void
  onComplete: (result: BattleResult) => void
  onDefeat: () => void
}

const legacy = '/art/legacy'

class ActionScene extends Phaser.Scene {
  private hero!: Phaser.Physics.Arcade.Sprite
  private enemies!: Phaser.Physics.Arcade.Group
  private projectiles!: Phaser.Physics.Arcade.Group
  private enemyProjectiles!: Phaser.Physics.Arcade.Group
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: Record<string, Phaser.Input.Keyboard.Key>
  private held = { left: false, right: false, up: false, down: false }
  private maxHp = 100
  private hp = 100
  private kills = 0
  private targetKills = 12
  private value = 0
  private attackAt = 0
  private spawnAt = 0
  private startedAt = 0
  private ended = false
  private invulnerableUntil = 0
  private dashUntil = 0
  private dashReadyAt = 0
  private pulseReadyAt = 0
  private damageTaken = 0
  private hudAt = 0
  private pollutionAt = 0
  private pollution = 68
  private controlHandler = (event: Event) => this.handleControl((event as CustomEvent<{ action: string; active?: boolean }>).detail)

  constructor(private props: Props) { super('action') }

  preload() {
    const type = this.props.adventure.wasteType
    this.load.image('background', this.props.adventure.background)
    this.load.image('hero-front', `${legacy}/sprites/hero_idle_front.png`)
    this.load.image('hero-right', `${legacy}/sprites/hero_idle_right.png`)
    this.load.image('hero-back', `${legacy}/sprites/hero_idle_back.png`)
    this.load.image('hero-walk-1', `${legacy}/sprites/hero_walk_right_1.png`)
    this.load.image('hero-walk-2', `${legacy}/sprites/hero_walk_right_2.png`)
    for (let i = 0; i < 8; i += 1) this.load.image(`enemy-${i}`, `${legacy}/themes/${type}_monster_${i}.png`)
    this.load.image('spark', `${legacy}/sprites/item_spark.png`)
    this.load.image('shield', `${legacy}/sprites/item_shield.png`)
    this.load.image('core', `${legacy}/sprites/item_print.png`)
  }

  create() {
    this.startedAt = this.time.now
    this.pollution = this.props.initialPollution
    this.value = this.props.initialValue
    this.targetKills = this.props.boss ? 1 : this.props.difficulty === 'experience' ? 5 : this.props.difficulty === 'challenge' ? 12 : 8
    this.maxHp = this.props.builds.includes('barrier') ? 115 : 100
    this.hp = this.maxHp
    const bg = this.add.image(480, 270, 'background').setDisplaySize(960, 540).setTint(0x7fa1a6)
    bg.setAlpha(.68)
    const grid = this.add.grid(480, 270, 960, 540, 48, 48, 0x071b20, .12, 0x58dce4, .08)
    grid.setDepth(1)
    const frame = this.add.rectangle(480, 270, 928, 508).setStrokeStyle(4, 0x061116).setDepth(10)
    frame.setFillStyle(0x000000, 0)

    this.physics.world.setBounds(22, 22, 916, 496)
    this.hero = this.physics.add.sprite(480, 330, 'hero-front').setDepth(5).setScale(.78)
    this.hero.setCollideWorldBounds(true).setBodySize(this.hero.width * .38, this.hero.height * .28).setOffset(this.hero.width * .31, this.hero.height * .64)
    this.enemies = this.physics.add.group()
    this.projectiles = this.physics.add.group()
    this.enemyProjectiles = this.physics.add.group()
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => this.hitEnemy(projectile as Phaser.Physics.Arcade.Image, enemy as Phaser.Physics.Arcade.Sprite))
    this.physics.add.overlap(this.hero, this.enemies, (_, enemy) => this.hitHero((enemy as Phaser.Physics.Arcade.Sprite).x, (enemy as Phaser.Physics.Arcade.Sprite).y, 9))
    this.physics.add.overlap(this.hero, this.enemyProjectiles, (_, projectile) => {
      const shot = projectile as Phaser.Physics.Arcade.Image
      this.hitHero(shot.x, shot.y, 7)
      shot.destroy()
    })

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,Q,SPACE') as Record<string, Phaser.Input.Keyboard.Key>
    this.keys.Q.on('down', () => this.pulse())
    this.keys.SPACE.on('down', () => this.dash())
    window.addEventListener('sgame-control', this.controlHandler)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('sgame-control', this.controlHandler))
    if (this.props.boss) this.spawnEnemy(true)
    else for (let i = 0; i < 4; i += 1) this.spawnEnemy(false)
  }

  private handleControl(detail: { action: string; active?: boolean }) {
    if (detail.action in this.held) this.held[detail.action as keyof typeof this.held] = detail.active ?? false
    if (detail.action === 'dash' && detail.active !== false) this.dash()
    if (detail.action === 'pulse' && detail.active !== false) this.pulse()
  }

  private spawnEnemy(boss: boolean) {
    if (this.ended) return
    const edge = Phaser.Math.Between(0, 3)
    const x = edge === 0 ? 45 : edge === 1 ? 915 : Phaser.Math.Between(60, 900)
    const y = edge === 2 ? 45 : edge === 3 ? 495 : Phaser.Math.Between(60, 480)
    const variant = boss ? 7 : Phaser.Math.Between(0, 6)
    const enemy = this.enemies.create(x, y, `enemy-${variant}`) as Phaser.Physics.Arcade.Sprite
    enemy.setDepth(4).setScale(boss ? 1.32 : .58).setData({ hp: boss ? 520 : 42, boss, shootAt: this.time.now + Phaser.Math.Between(900, 1900), slowedUntil: 0 })
    enemy.setBodySize(enemy.width * .52, enemy.height * .38).setOffset(enemy.width * .24, enemy.height * .56)
    if (boss) {
      const ring = this.add.circle(x, y, 82).setStrokeStyle(5, 0xff765e, .8).setDepth(3)
      this.tweens.add({ targets: ring, scale: 1.15, alpha: .35, duration: 900, yoyo: true, repeat: -1 })
      enemy.setData('ring', ring)
    }
  }

  private attack(now: number) {
    if (now < this.attackAt) return
    const living = this.enemies.getChildren().filter((item) => (item as Phaser.Physics.Arcade.Sprite).active) as Phaser.Physics.Arcade.Sprite[]
    if (!living.length) return
    const nearest = living.sort((a, b) => Phaser.Math.Distance.Between(this.hero.x, this.hero.y, a.x, a.y) - Phaser.Math.Distance.Between(this.hero.x, this.hero.y, b.x, b.y))[0]
    const projectile = this.projectiles.create(this.hero.x, this.hero.y - 8, 'spark') as Phaser.Physics.Arcade.Image
    projectile.setScale(.22).setDepth(6).setTint(0x63efff).setData('damage', this.props.builds.includes('cascade') ? 20 : 16).setData('target', nearest)
    this.physics.moveToObject(projectile, nearest, 560)
    this.time.delayedCall(1100, () => projectile.active && projectile.destroy())
    this.attackAt = now + (this.props.builds.includes('pulse') ? 330 : 410)
    const flash = this.add.circle(this.hero.x, this.hero.y - 8, 8, 0xb9fbff, .9).setDepth(6)
    this.tweens.add({ targets: flash, scale: 2.8, alpha: 0, duration: 130, onComplete: () => flash.destroy() })
  }

  private hitEnemy(projectile: Phaser.Physics.Arcade.Image, enemy: Phaser.Physics.Arcade.Sprite) {
    const damage = projectile.getData('damage') as number
    projectile.destroy()
    playUiSound('click', .22)
    const hp = (enemy.getData('hp') as number) - damage
    enemy.setData('hp', hp).setTint(0xffffff)
    this.time.delayedCall(55, () => enemy.active && enemy.clearTint())
    this.cameras.main.shake(this.profileShake ? 28 : 0, .002)
    for (let i = 0; i < 4; i += 1) {
      const bit = this.add.rectangle(enemy.x, enemy.y, 4, 4, this.props.adventure.wasteType === 'textile' ? 0xff78ad : 0x41e7ff).setDepth(7)
      this.tweens.add({ targets: bit, x: enemy.x + Phaser.Math.Between(-28, 28), y: enemy.y + Phaser.Math.Between(-28, 28), alpha: 0, duration: 220, onComplete: () => bit.destroy() })
    }
    if (this.props.builds.includes('pulse') && Math.random() < .18) enemy.setData('slowedUntil', this.time.now + 700)
    if (hp <= 0) this.purify(enemy)
  }

  private get profileShake() { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches }

  private purify(enemy: Phaser.Physics.Arcade.Sprite) {
    const isBoss = enemy.getData('boss') as boolean
    const ring = enemy.getData('ring') as Phaser.GameObjects.Arc | undefined
    ring?.destroy()
    const burst = this.add.circle(enemy.x, enemy.y, isBoss ? 24 : 12, 0x70f0a8, .75).setDepth(8)
    this.tweens.add({ targets: burst, scale: isBoss ? 8 : 4, alpha: 0, duration: 440, onComplete: () => burst.destroy() })
    enemy.destroy()
    playUiSound(isBoss ? 'success' : 'hover', isBoss ? .8 : .28)
    this.kills += 1
    this.value += isBoss ? 100 : 8
    this.pollution = Math.max(0, this.pollution - (isBoss ? 30 : 2.5))
    if (this.props.builds.includes('magnet')) this.hp = Math.min(this.maxHp, this.hp + 2)
    if (this.kills >= this.targetKills) {
      this.ended = true
      this.time.delayedCall(500, () => this.props.onComplete({ purified: this.kills, damageTaken: this.damageTaken, value: this.value }))
    } else if (!this.props.boss) this.spawnEnemy(false)
  }

  private hitHero(sourceX: number, sourceY: number, damage: number) {
    if (this.time.now < this.invulnerableUntil || this.ended) return
    this.invulnerableUntil = this.time.now + 550
    this.hp -= damage
    this.damageTaken += damage
    playUiSound('danger', .35)
    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.hero.x, this.hero.y)
    this.hero.setVelocity(Math.cos(angle) * 360, Math.sin(angle) * 360).setTint(0xff766e)
    this.time.delayedCall(120, () => this.hero.active && this.hero.clearTint())
    this.cameras.main.shake(this.profileShake ? 120 : 0, .008)
    if (this.hp <= 0) {
      this.ended = true
      this.hero.setTint(0x51666b).setVelocity(0)
      this.time.delayedCall(650, this.props.onDefeat)
    }
  }

  private pulse() {
    if (this.time.now < this.pulseReadyAt || this.ended) return
    this.pulseReadyAt = this.time.now + 6500
    playUiSound('success', .45)
    const wave = this.add.circle(this.hero.x, this.hero.y, 22, 0x41e7ff, .15).setStrokeStyle(6, 0x9ff7ff, .9).setDepth(7)
    this.tweens.add({ targets: wave, scale: 7, alpha: 0, duration: 480, onComplete: () => wave.destroy() })
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.x, enemy.y) < 180) {
        enemy.setData('hp', (enemy.getData('hp') as number) - 24)
        enemy.setData('slowedUntil', this.time.now + 900)
        if ((enemy.getData('hp') as number) <= 0) this.purify(enemy)
      }
    })
  }

  private dash() {
    if (this.time.now < this.dashReadyAt || this.ended) return
    this.dashReadyAt = this.time.now + 1800
    playUiSound('hover', .25)
    this.dashUntil = this.time.now + 190
    this.invulnerableUntil = this.time.now + (this.props.builds.includes('barrier') ? 650 : 260)
    const ghost = this.add.image(this.hero.x, this.hero.y, this.hero.texture.key).setScale(.78).setAlpha(.55).setTint(0x41e7ff).setDepth(3)
    this.tweens.add({ targets: ghost, alpha: 0, duration: 220, onComplete: () => ghost.destroy() })
  }

  update(now: number) {
    if (this.ended) return
    const left = this.cursors.left.isDown || this.keys.A.isDown || this.held.left
    const right = this.cursors.right.isDown || this.keys.D.isDown || this.held.right
    const up = this.cursors.up.isDown || this.keys.W.isDown || this.held.up
    const down = this.cursors.down.isDown || this.keys.S.isDown || this.held.down
    const direction = new Phaser.Math.Vector2(Number(right) - Number(left), Number(down) - Number(up)).normalize()
    const speed = now < this.dashUntil ? 520 : 210
    this.hero.setVelocity(direction.x * speed, direction.y * speed)
    if (direction.x !== 0) this.hero.setFlipX(direction.x < 0).setTexture('hero-right')
    else if (direction.y < 0) this.hero.setTexture('hero-back')
    else if (direction.y > 0) this.hero.setTexture('hero-front')
    if (direction.lengthSq() > 0 && Math.floor(now / 150) % 2 === 0) this.hero.setTexture('hero-walk-1')

    this.attack(now)
    this.projectiles.getChildren().forEach((item) => {
      const projectile = item as Phaser.Physics.Arcade.Image
      const target = projectile.getData('target') as Phaser.Physics.Arcade.Sprite | undefined
      if (target?.active) this.physics.moveToObject(projectile, target, 590)
    })
    if (!this.props.boss && now > this.spawnAt && this.enemies.countActive() < 6) {
      this.spawnEnemy(false)
      this.spawnAt = now + 1500
    }
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      if (!enemy.active) return
      const isBoss = enemy.getData('boss') as boolean
      const slowed = now < (enemy.getData('slowedUntil') as number)
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.hero.x, this.hero.y)
      const speedEnemy = (isBoss ? 66 : 48 + Number(enemy.texture.key.slice(-1)) * 3) * (slowed ? .25 : 1)
      if (distance > (isBoss ? 108 : 56)) this.physics.moveToObject(enemy, this.hero, speedEnemy)
      else enemy.setVelocity(0)
      const ring = enemy.getData('ring') as Phaser.GameObjects.Arc | undefined
      ring?.setPosition(enemy.x, enemy.y)
      if (Number(enemy.texture.key.slice(-1)) % 3 === 0 && now > (enemy.getData('shootAt') as number)) {
        const shot = this.enemyProjectiles.create(enemy.x, enemy.y, 'spark') as Phaser.Physics.Arcade.Image
        shot.setScale(.16).setTint(0xff6f68).setDepth(6)
        this.physics.moveToObject(shot, this.hero, isBoss ? 260 : 190)
        enemy.setData('shootAt', now + (isBoss ? 780 : 1700))
        this.time.delayedCall(2300, () => shot.active && shot.destroy())
      }
    })
    if (now >= this.hudAt) {
      this.hudAt = now + 100
      this.props.onHud({ hp: Math.max(0, this.hp), maxHp: this.maxHp, pollution: Math.round(this.pollution), value: this.value, combo: this.kills })
    }
    if (now >= this.pollutionAt) {
      this.pollutionAt = now + 1000
      const pressure = this.enemies.countActive() * (this.props.boss ? .28 : .16)
      this.pollution = Math.min(100, this.pollution + pressure)
      if (this.pollution >= 100) {
        this.ended = true
        this.props.onDefeat()
      }
    }
  }
}

export default function PhaserCombat(props: Props) {
  const host = useRef<HTMLDivElement>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  useEffect(() => {
    if (!host.current) return
    const scene = new ActionScene({ ...propsRef.current, onHud: (value) => propsRef.current.onHud(value), onComplete: (value) => propsRef.current.onComplete(value), onDefeat: () => propsRef.current.onDefeat() })
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      width: 960,
      height: 540,
      pixelArt: true,
      transparent: true,
      physics: { default: 'arcade', arcade: { debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene,
      audio: { noAudio: true },
      render: { antialias: false, roundPixels: true },
    })
    return () => game.destroy(true)
  }, [props.adventure.id, props.boss, props.difficulty])

  const control = (action: string, active = true) => window.dispatchEvent(new CustomEvent('sgame-control', { detail: { action, active } }))
  const holdProps = (action: string) => ({
    onPointerDown: (event: React.PointerEvent) => { event.currentTarget.setPointerCapture(event.pointerId); control(action, true) },
    onPointerUp: () => control(action, false), onPointerCancel: () => control(action, false), onPointerLeave: () => control(action, false),
  })

  return <div className="combat-stage">
    <div ref={host} className="phaser-host" />
    <div className="touch-controls" aria-label="触屏控制">
      <div className="dpad"><button {...holdProps('up')} className="up">▲</button><button {...holdProps('left')} className="left">◀</button><button {...holdProps('down')} className="down">▼</button><button {...holdProps('right')} className="right">▶</button></div>
      <div className="action-pad"><button onPointerDown={() => control('pulse')} className="pulse">脉冲<small>Q</small></button><button onPointerDown={() => control('dash')} className="dash">冲刺<small>SPACE</small></button></div>
    </div>
  </div>
}
