import Phaser from 'phaser'
import { useEffect, useRef } from 'react'
import type { AdventureDefinition, CombatStats, Difficulty, RunMetrics } from '../types'
import { playUiSound } from '../store/audio'
import { bosses, elitesFor, enemiesFor, type EnemyDefinition } from '../data/enemies'
import { difficultyTuning } from '../data/balance'

export interface BattleResult { purified: number; damageTaken: number; value: number }

interface Props {
  adventure: AdventureDefinition
  difficulty: Difficulty
  boss?: boolean
  builds: string[]
  combatStats: CombatStats
  screenShake: boolean
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
  private lastDirection = new Phaser.Math.Vector2(1, 0)
  private chargeStartedAt = 0
  private finisherCharge = 0
  private hitCombo = 0
  private comboExpiresAt = 0
  private lastAnimAt = 0
  private animFrame = false
  private obstacles!: Phaser.Physics.Arcade.StaticGroup
  private hazardPools!: Phaser.GameObjects.Group
  private controlHandler = (event: Event) => this.handleControl((event as CustomEvent<{ action: string; active?: boolean }>).detail)

  constructor(private props: Props) { super('action') }

  private get tuning() { return difficultyTuning[this.props.difficulty] }

  preload() {
    const type = this.props.adventure.wasteType
    this.load.image('background', this.props.adventure.background)
    this.load.image('hero-front', `${legacy}/sprites/hero_idle_front.png`)
    this.load.image('hero-right', `${legacy}/sprites/hero_idle_right.png`)
    this.load.image('hero-back', `${legacy}/sprites/hero_idle_back.png`)
    this.load.image('hero-walk-1', `${legacy}/sprites/hero_walk_right_1.png`)
    this.load.image('hero-walk-2', `${legacy}/sprites/hero_walk_right_2.png`)
    for (let i = 0; i < 8; i += 1) this.load.image(`enemy-${i}`, `${legacy}/themes/${type}_monster_${i}.png`)
    this.load.image('enemy-refined', `/art/enemies-v2/${type}-shell.png`)
    this.load.image('spark', `${legacy}/sprites/item_spark.png`)
    this.load.image('shield', `${legacy}/sprites/item_shield.png`)
    this.load.image('core', `${legacy}/sprites/item_print.png`)
  }

  create() {
    this.startedAt = this.time.now
    this.pollution = this.props.initialPollution
    this.value = this.props.initialValue
    this.targetKills = this.props.boss ? 1 : this.props.difficulty === 'experience' ? 5 : this.props.difficulty === 'challenge' ? 12 : 8
    this.maxHp = this.props.combatStats.maxHp + (this.props.builds.includes('barrier') ? 15 : 0)
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
    this.obstacles = this.physics.add.staticGroup()
    this.hazardPools = this.add.group()
    ;[[185, 150, 150, 38], [775, 390, 150, 38], [185, 410, 86, 86], [775, 140, 86, 86]].forEach(([x, y, width, height], index) => {
      const obstacle = this.add.rectangle(x, y, width, height, index % 2 ? 0x123c45 : 0x1a4650, .82).setStrokeStyle(3, 0x061116).setDepth(3)
      this.physics.add.existing(obstacle, true); this.obstacles.add(obstacle)
      this.add.rectangle(x, y - height / 2 + 6, width - 12, 5, index % 2 ? 0xffd65a : 0x41e7ff, .65).setDepth(4)
    })
    this.physics.add.collider(this.hero, this.obstacles)
    this.physics.add.collider(this.enemies, this.obstacles)
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => this.hitEnemy(projectile as Phaser.Physics.Arcade.Image, enemy as Phaser.Physics.Arcade.Sprite))
    this.physics.add.overlap(this.hero, this.enemies, (_, hit) => { const enemy = hit as Phaser.Physics.Arcade.Sprite; const definition = enemy.getData('definition') as EnemyDefinition; this.hitHero(enemy.x, enemy.y, (definition?.contactDamage ?? 9) * this.tuning.enemyDamage) })
    this.physics.add.overlap(this.hero, this.enemyProjectiles, (_, projectile) => {
      const shot = projectile as Phaser.Physics.Arcade.Image
      this.hitHero(shot.x, shot.y, 7 * this.tuning.enemyDamage)
      shot.destroy()
    })

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,Q,E,R,SPACE') as Record<string, Phaser.Input.Keyboard.Key>
    this.keys.Q.on('down', () => this.pulse())
    this.keys.E.on('down', () => { this.chargeStartedAt = this.time.now })
    this.keys.E.on('up', () => this.releaseCharge())
    this.keys.R.on('down', () => this.finisher())
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
    if (detail.action === 'charge') {
      if (detail.active !== false) this.chargeStartedAt = this.time.now
      else this.releaseCharge()
    }
    if (detail.action === 'finisher' && detail.active !== false) this.finisher()
  }

  private spawnEnemy(boss: boolean) {
    if (this.ended) return
    const edge = Phaser.Math.Between(0, 3)
    const x = edge === 0 ? 45 : edge === 1 ? 915 : Phaser.Math.Between(60, 900)
    const y = edge === 2 ? 45 : edge === 3 ? 495 : Phaser.Math.Between(60, 480)
    const pool = enemiesFor(this.props.adventure.wasteType)
    const elitePool = elitesFor(this.props.adventure.wasteType)
    const bossDefinition = bosses.find((item) => item.name === this.props.adventure.boss) ?? bosses.find((item) => item.type === this.props.adventure.wasteType)
    const canElite = !boss && this.time.now - this.startedAt > 8500 && elitePool.length > 0 && Math.random() < .2
    const definition = (boss ? bossDefinition : canElite ? Phaser.Utils.Array.GetRandom(elitePool) : Phaser.Utils.Array.GetRandom(pool)) as EnemyDefinition
    const variant = boss ? 7 : definition.sprite
    const useRefined = boss || definition.tier === 'elite' || definition.sprite % 3 === 0
    const enemy = this.enemies.create(x, y, useRefined ? 'enemy-refined' : `enemy-${variant}`) as Phaser.Physics.Arcade.Sprite
    const hp = Math.round(definition.hp * this.tuning.enemyHp)
    enemy.setDepth(4)
    if (useRefined) enemy.setDisplaySize(boss ? 194 : definition.tier === 'elite' ? 118 : 86, boss ? 174 : definition.tier === 'elite' ? 106 : 78)
    else enemy.setScale(boss ? 1.34 : definition.tier === 'elite' ? .82 : .58)
    enemy.setTint(definition.tier === 'elite' ? 0xffe287 : 0xffffff).setData({ hp, maxHp: hp, boss, definition, shootAt: this.time.now + Phaser.Math.Between(900, 1900), abilityAt: this.time.now + Phaser.Math.Between(1200, 2200), slowedUntil: 0, phase: 0 })
    enemy.setBodySize(enemy.width * .52, enemy.height * .38).setOffset(enemy.width * .24, enemy.height * .56)
    if (useRefined) {
      const baseScaleX = enemy.scaleX; const baseScaleY = enemy.scaleY
      this.tweens.add({ targets: enemy, scaleX: baseScaleX * 1.035, scaleY: baseScaleY * .97, duration: boss ? 920 : 720 + definition.sprite * 45, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 })
    }
    if (boss) {
      const ring = this.add.circle(x, y, 82).setStrokeStyle(5, 0xff765e, .8).setDepth(3)
      this.tweens.add({ targets: ring, scale: 1.15, alpha: .35, duration: 900, yoyo: true, repeat: -1 })
      enemy.setData('ring', ring)
      const title = this.add.text(480, 82, definition.name, { fontFamily: 'monospace', fontSize: '20px', color: '#fff3e5', backgroundColor: '#4b1820', padding: { x: 14, y: 7 } }).setOrigin(.5).setDepth(12)
      this.time.delayedCall(1500, () => this.tweens.add({ targets: title, alpha: 0, duration: 300, onComplete: () => title.destroy() }))
    }
  }

  private attack(now: number) {
    if (now < this.attackAt) return
    const living = this.enemies.getChildren().filter((item) => (item as Phaser.Physics.Arcade.Sprite).active) as Phaser.Physics.Arcade.Sprite[]
    if (!living.length) return
    const nearest = living.sort((a, b) => Phaser.Math.Distance.Between(this.hero.x, this.hero.y, a.x, a.y) - Phaser.Math.Distance.Between(this.hero.x, this.hero.y, b.x, b.y))[0]
    const projectile = this.projectiles.create(this.hero.x, this.hero.y - 8, 'spark') as Phaser.Physics.Arcade.Image
    const crit = Math.random() < this.props.combatStats.critChance
    const baseDamage = this.props.combatStats.attack + (this.props.builds.includes('cascade') ? 4 : 0)
    projectile.setScale(crit ? .28 : .22).setDepth(6).setTint(crit ? 0xffd65a : 0x63efff).setData('damage', Math.round(baseDamage * (crit ? 1.6 : 1))).setData('target', nearest)
    this.physics.moveToObject(projectile, nearest, 560)
    this.time.delayedCall(1100, () => projectile.active && projectile.destroy())
    this.attackAt = now + (this.props.builds.includes('pulse') ? 330 : 410) / this.props.combatStats.attackSpeed
    const flash = this.add.circle(this.hero.x, this.hero.y - 8, 8, 0xb9fbff, .9).setDepth(6)
    this.tweens.add({ targets: flash, scale: 2.8, alpha: 0, duration: 130, onComplete: () => flash.destroy() })
  }

  private hitEnemy(projectile: Phaser.Physics.Arcade.Image, enemy: Phaser.Physics.Arcade.Sprite) {
    const damage = projectile.getData('damage') as number
    projectile.destroy()
    playUiSound('click', .22)
    const hp = (enemy.getData('hp') as number) - damage
    enemy.setData('hp', hp).setTint(0xffffff)
    this.hitCombo = this.time.now < this.comboExpiresAt ? this.hitCombo + 1 : 1
    this.comboExpiresAt = this.time.now + 1600
    this.finisherCharge = Math.min(100, this.finisherCharge + (enemy.getData('boss') ? 5 : 8))
    this.time.delayedCall(55, () => enemy.active && enemy.clearTint())
    this.cameras.main.shake(this.profileShake ? 28 : 0, .002)
    for (let i = 0; i < 4; i += 1) {
      const bit = this.add.rectangle(enemy.x, enemy.y, 4, 4, this.props.adventure.wasteType === 'textile' ? 0xff78ad : 0x41e7ff).setDepth(7)
      this.tweens.add({ targets: bit, x: enemy.x + Phaser.Math.Between(-28, 28), y: enemy.y + Phaser.Math.Between(-28, 28), alpha: 0, duration: 220, onComplete: () => bit.destroy() })
    }
    if (this.props.builds.includes('pulse') && Math.random() < .18) enemy.setData('slowedUntil', this.time.now + 700)
    this.checkBossPhase(enemy, hp)
    if (hp <= 0) this.purify(enemy)
  }

  private checkBossPhase(enemy: Phaser.Physics.Arcade.Sprite, hp: number) {
    if (!enemy.getData('boss')) return
    const definition = enemy.getData('definition') as EnemyDefinition
    const ratio = hp / (enemy.getData('maxHp') as number)
    const phase = enemy.getData('phase') as number
    const next = definition.phases?.[phase]
    if (!next || ratio > next.at) return
    enemy.setData('phase', phase + 1).setTint(0xff8b7f)
    const banner = this.add.text(480, 112, `${next.name} · ${next.change}`, { fontFamily: 'monospace', fontSize: '14px', color: '#071419', backgroundColor: '#ffd65a', padding: { x: 12, y: 6 } }).setOrigin(.5).setDepth(12)
    this.cameras.main.flash(180, 255, 111, 104)
    this.time.delayedCall(1200, () => this.tweens.add({ targets: banner, alpha: 0, duration: 260, onComplete: () => banner.destroy() }))
    for (let i = 0; i < phase + 2; i += 1) this.spawnRadialShot(enemy, (Math.PI * 2 / (phase + 2)) * i, 240 + phase * 40)
  }

  private get profileShake() { return this.props.screenShake && !window.matchMedia('(prefers-reduced-motion: reduce)').matches }

  private purify(enemy: Phaser.Physics.Arcade.Sprite) {
    const isBoss = enemy.getData('boss') as boolean
    const definition = enemy.getData('definition') as EnemyDefinition
    const splitOrigin = { x: enemy.x, y: enemy.y, texture: enemy.texture.key }
    const shouldSplit = !isBoss && definition.role === 'splitter' && !enemy.getData('splitChild')
    const ring = enemy.getData('ring') as Phaser.GameObjects.Arc | undefined
    ring?.destroy()
    const burst = this.add.circle(enemy.x, enemy.y, isBoss ? 24 : 12, 0x70f0a8, .75).setDepth(8)
    this.tweens.add({ targets: burst, scale: isBoss ? 8 : 4, alpha: 0, duration: 440, onComplete: () => burst.destroy() })
    enemy.destroy()
    if (shouldSplit) {
      for (const offset of [-22, 22]) {
        const fragment = this.enemies.create(splitOrigin.x + offset, splitOrigin.y, splitOrigin.texture) as Phaser.Physics.Arcade.Sprite
        fragment.setDepth(4).setScale(.34).setTint(definition.color).setData({ hp: 12, maxHp: 12, boss: false, definition, splitChild: true, shootAt: this.time.now + 1800, abilityAt: this.time.now + 3200, slowedUntil: 0, phase: 0 })
        fragment.setBodySize(fragment.width * .5, fragment.height * .36).setOffset(fragment.width * .25, fragment.height * .58)
      }
    }
    playUiSound(isBoss ? 'success' : 'hover', isBoss ? .8 : .28)
    this.kills += 1
    this.value += Math.round((isBoss ? 100 : 8) * this.props.combatStats.valueGain)
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
    const protectedDamage = damage * (1 - this.props.combatStats.pollutionGuard)
    this.hp -= protectedDamage
    this.damageTaken += protectedDamage
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

  private spawnRadialShot(enemy: Phaser.Physics.Arcade.Sprite, angle: number, speed: number) {
    const shot = this.enemyProjectiles.create(enemy.x, enemy.y, 'spark') as Phaser.Physics.Arcade.Image
    shot.setScale(.17).setTint(0xff786f).setDepth(6).setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
    this.time.delayedCall(2200, () => shot.active && shot.destroy())
  }

  private releaseCharge() {
    if (!this.chargeStartedAt || this.ended) return
    const held = Math.min(1400, this.time.now - this.chargeStartedAt)
    this.chargeStartedAt = 0
    const ratio = Phaser.Math.Clamp(held / 900, .25, 1)
    const reach = 100 + ratio * 130
    const damage = Math.round((22 + ratio * 55) * (this.props.combatStats.attack / 16))
    const angle = this.lastDirection.angle()
    playUiSound(ratio > .85 ? 'success' : 'click', .45)
    const arc = this.add.arc(this.hero.x, this.hero.y, reach, Phaser.Math.RadToDeg(angle - .5), Phaser.Math.RadToDeg(angle + .5), false, ratio > .85 ? 0xffd65a : 0x70f0ff, .45).setDepth(7)
    this.tweens.add({ targets: arc, alpha: 0, scale: 1.15, duration: 220, onComplete: () => arc.destroy() })
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      if (!enemy.active) return
      const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.x, enemy.y)
      const toEnemy = new Phaser.Math.Vector2(enemy.x - this.hero.x, enemy.y - this.hero.y).normalize()
      if (distance <= reach && this.lastDirection.dot(toEnemy) > .55) {
        enemy.setData('hp', (enemy.getData('hp') as number) - damage)
        this.hitCombo += 2; this.comboExpiresAt = this.time.now + 1800; this.finisherCharge = Math.min(100, this.finisherCharge + 16)
        this.checkBossPhase(enemy, enemy.getData('hp'))
        if ((enemy.getData('hp') as number) <= 0) this.purify(enemy)
      }
    })
  }

  private finisher() {
    if (this.finisherCharge < 100 || this.ended) return
    this.finisherCharge = 0
    playUiSound('success', .85)
    this.cameras.main.flash(260, 112, 240, 168)
    const seal = this.add.circle(this.hero.x, this.hero.y, 36, 0xffd65a, .32).setStrokeStyle(8, 0xffffff, .9).setDepth(9)
    this.tweens.add({ targets: seal, scale: 12, alpha: 0, duration: 580, onComplete: () => seal.destroy() })
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      if (!enemy.active) return
      const damage = enemy.getData('boss') ? 125 : 999
      enemy.setData('hp', (enemy.getData('hp') as number) - damage)
      this.checkBossPhase(enemy, enemy.getData('hp'))
      if ((enemy.getData('hp') as number) <= 0) this.purify(enemy)
    })
  }

  private pulse() {
    if (this.time.now < this.pulseReadyAt || this.ended) return
    this.pulseReadyAt = this.time.now + 6500 / this.props.combatStats.cooldownRate
    playUiSound('success', .45)
    const wave = this.add.circle(this.hero.x, this.hero.y, 22, 0x41e7ff, .15).setStrokeStyle(6, 0x9ff7ff, .9).setDepth(7)
    this.tweens.add({ targets: wave, scale: 7, alpha: 0, duration: 480, onComplete: () => wave.destroy() })
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      const toEnemy = new Phaser.Math.Vector2(enemy.x - this.hero.x, enemy.y - this.hero.y).normalize()
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.x, enemy.y) < 220 && this.lastDirection.dot(toEnemy) > .15) {
        enemy.setData('hp', (enemy.getData('hp') as number) - 24)
        enemy.setData('slowedUntil', this.time.now + 900)
        if ((enemy.getData('hp') as number) <= 0) this.purify(enemy)
      }
    })
  }

  private dash() {
    if (this.time.now < this.dashReadyAt || this.ended) return
    this.dashReadyAt = this.time.now + 1800 / this.props.combatStats.cooldownRate
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
    if (direction.lengthSq() > 0) this.lastDirection.copy(direction)
    const speed = now < this.dashUntil ? 520 + (this.props.combatStats.moveSpeed - 210) : this.props.combatStats.moveSpeed
    this.hero.setVelocity(direction.x * speed, direction.y * speed)
    if (direction.lengthSq() > 0 && now - this.lastAnimAt > 145) { this.lastAnimAt = now; this.animFrame = !this.animFrame }
    if (direction.x !== 0) this.hero.setFlipX(direction.x < 0).setTexture(this.animFrame ? 'hero-walk-1' : 'hero-walk-2')
    else if (direction.y < 0) this.hero.setFlipX(false).setTexture('hero-back')
    else if (direction.y > 0) this.hero.setFlipX(false).setTexture('hero-front')

    this.attack(now)
    this.projectiles.getChildren().forEach((item) => {
      const projectile = item as Phaser.Physics.Arcade.Image
      const target = projectile.getData('target') as Phaser.Physics.Arcade.Sprite | undefined
      if (target?.active) this.physics.moveToObject(projectile, target, 590)
    })
    if (!this.props.boss && now > this.spawnAt && this.enemies.countActive() < 6) {
      this.spawnEnemy(false)
      this.spawnAt = now + 1500 / this.tuning.spawnRate
    }
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      if (!enemy.active) return
      const isBoss = enemy.getData('boss') as boolean
      const definition = enemy.getData('definition') as EnemyDefinition
      const slowed = now < (enemy.getData('slowedUntil') as number)
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.hero.x, this.hero.y)
      const speedEnemy = definition.speed * (isBoss ? 1 : 1) * (slowed ? .25 : 1)
      const keepDistance = definition.role === 'ranged' || definition.role === 'support'
      if (keepDistance && distance < 155) this.physics.velocityFromRotation(Phaser.Math.Angle.Between(this.hero.x, this.hero.y, enemy.x, enemy.y), speedEnemy, (enemy.body as Phaser.Physics.Arcade.Body).velocity)
      else if (distance > (keepDistance ? 235 : isBoss ? 108 : 56)) this.physics.moveToObject(enemy, this.hero, speedEnemy)
      else enemy.setVelocity(0)
      const ring = enemy.getData('ring') as Phaser.GameObjects.Arc | undefined
      ring?.setPosition(enemy.x, enemy.y)
      if ((definition.role === 'ranged' || isBoss) && now > (enemy.getData('shootAt') as number)) {
        const shot = this.enemyProjectiles.create(enemy.x, enemy.y, 'spark') as Phaser.Physics.Arcade.Image
        shot.setScale(.16).setTint(0xff6f68).setDepth(6)
        this.physics.moveToObject(shot, this.hero, isBoss ? 260 : 190)
        enemy.setData('shootAt', now + (isBoss ? 780 : 1700) * this.tuning.telegraphTime)
        this.time.delayedCall(2300, () => shot.active && shot.destroy())
      }
      if (now > (enemy.getData('abilityAt') as number)) {
        enemy.setData('abilityAt', now + (isBoss ? 1450 : 2700) * this.tuning.telegraphTime)
        if (definition.role === 'charger') {
          const telegraph = this.add.line(0, 0, enemy.x, enemy.y, this.hero.x, this.hero.y, 0xffd65a, .65).setOrigin(0).setLineWidth(5).setDepth(3)
          this.time.delayedCall(360 * this.tuning.telegraphTime, () => { telegraph.destroy(); enemy.active && this.physics.moveToObject(enemy, this.hero, speedEnemy * 4.3) })
        } else if (definition.role === 'hazard') {
          const pool = this.add.circle(enemy.x, enemy.y, 42, definition.color, .22).setStrokeStyle(3, definition.color, .6).setDepth(2)
          pool.setData('damageAt', now + 450); this.hazardPools.add(pool)
          this.time.delayedCall(3200, () => pool.destroy())
        } else if (definition.role === 'support') {
          const ally = this.enemies.getChildren().find((candidate) => candidate !== enemy && (candidate as Phaser.Physics.Arcade.Sprite).active) as Phaser.Physics.Arcade.Sprite | undefined
          if (ally) { ally.setData('hp', Math.min(ally.getData('maxHp'), ally.getData('hp') + 18)); const link = this.add.line(0, 0, enemy.x, enemy.y, ally.x, ally.y, definition.color, .7).setOrigin(0).setLineWidth(3).setDepth(3); this.time.delayedCall(260, () => link.destroy()) }
        }
      }
    })
    this.hazardPools.getChildren().forEach((item) => {
      const pool = item as Phaser.GameObjects.Arc
      if (!pool.active || now < (pool.getData('damageAt') as number)) return
      if (Phaser.Math.Distance.Between(pool.x, pool.y, this.hero.x, this.hero.y) <= 46) {
        pool.setData('damageAt', now + 800)
        this.hitHero(pool.x, pool.y, 6 * this.tuning.enemyDamage)
      }
    })
    if (now >= this.hudAt) {
      this.hudAt = now + 100
      if (now > this.comboExpiresAt) this.hitCombo = 0
      this.props.onHud({ hp: Math.max(0, this.hp), maxHp: this.maxHp, pollution: Math.round(this.pollution), value: this.value, combo: this.hitCombo, finisher: Math.round(this.finisherCharge) })
    }
    if (now >= this.pollutionAt) {
      this.pollutionAt = now + 1000
      const pressure = this.enemies.countActive() * (this.props.boss ? .28 : .16) * this.tuning.pollutionRate * (1 - this.props.combatStats.pollutionGuard)
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
      pixelArt: false,
      transparent: true,
      physics: { default: 'arcade', arcade: { debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene,
      audio: { noAudio: true },
      render: { antialias: true, roundPixels: false },
    })
    return () => game.destroy(true)
  }, [props.adventure.id, props.boss, props.difficulty, props.combatStats.attack, props.combatStats.maxHp])

  const control = (action: string, active = true) => window.dispatchEvent(new CustomEvent('sgame-control', { detail: { action, active } }))
  const holdProps = (action: string) => ({
    onPointerDown: (event: React.PointerEvent) => { event.currentTarget.setPointerCapture(event.pointerId); control(action, true) },
    onPointerUp: () => control(action, false), onPointerCancel: () => control(action, false), onPointerLeave: () => control(action, false),
  })

  return <div className="combat-stage">
    <div ref={host} className="phaser-host" />
    <div className="touch-controls" aria-label="触屏控制">
      <div className="dpad"><button {...holdProps('up')} className="up">▲</button><button {...holdProps('left')} className="left">◀</button><button {...holdProps('down')} className="down">▼</button><button {...holdProps('right')} className="right">▶</button></div>
      <div className="action-pad"><button {...holdProps('charge')} className="charge">蓄力工具<small>按住 E</small></button><button onPointerDown={() => control('pulse')} className="pulse">定向脉冲<small>Q</small></button><button onPointerDown={() => control('finisher')} className="finisher">原型终结<small>R · 100%</small></button><button onPointerDown={() => control('dash')} className="dash">冲刺<small>SPACE</small></button></div>
    </div>
  </div>
}
