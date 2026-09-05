import Phaser from 'phaser'
import { useEffect, useRef } from 'react'
import type { AdventureDefinition, CombatStats, Difficulty, RunMetrics, SkillEffects } from '../types'
import { playUiSound } from '../store/audio'
import { bosses, elitesFor, enemiesFor, type EnemyDefinition } from '../data/enemies'
import { difficultyTuning } from '../data/balance'
import { assetUrl } from '../utils/assets'
import GameIcon from '../components/GameIcon'
import { getWeaponBehavior } from '../data/weaponBehaviors'

export interface BattleResult { purified: number; damageTaken: number; value: number }

interface Props {
  adventure: AdventureDefinition
  difficulty: Difficulty
  boss?: boolean
  builds: string[]
  weaponId: string
  combatStats: CombatStats
  skillEffects: SkillEffects
  screenShake: boolean
  initialPollution: number
  initialValue: number
  finisherCharge?: number
  pulseCooldown?: number
  dashCooldown?: number
  onHud: (hud: Partial<RunMetrics>) => void
  onComplete: (result: BattleResult) => void
  onDefeat: () => void
}

const legacy = assetUrl('art/legacy')
type PickupKind = 'material' | 'shield' | 'heal' | 'attack' | 'speed' | 'energy' | 'prototype'

class ActionScene extends Phaser.Scene {
  private hero!: Phaser.Physics.Arcade.Sprite
  private enemies!: Phaser.Physics.Arcade.Group
  private projectiles!: Phaser.Physics.Arcade.Group
  private enemyProjectiles!: Phaser.Physics.Arcade.Group
  private pickups!: Phaser.Physics.Arcade.Group
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: Record<string, Phaser.Input.Keyboard.Key>
  private held = { left: false, right: false, up: false, down: false }
  private maxHp = 100
  private hp = 100
  private maxShield = 0
  private shield = 0
  private secondWindUsed = false
  private kills = 0
  private targetKills = 12
  private value = 0
  private attackAt = 0
  private activeAttackAt = 0
  private hybridSigil = false
  private manualShots = 0
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
  private buffSpawnAt = 0
  private attackBoostUntil = 0
  private speedBoostUntil = 0
  private awaitingPrototype = false
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
  private get weaponBehavior() { return getWeaponBehavior(this.props.weaponId) }
  private get weaponMode() { return this.weaponBehavior.mode }
  private get attackMultiplier() { return this.time.now < this.attackBoostUntil ? 1.35 : 1 }

  preload() {
    const type = this.props.adventure.wasteType
    this.load.image('background', assetUrl(`art/combat-v3/${type}-arena.jpg`))
    this.load.spritesheet('enemy-walk-atlas', assetUrl('art/combat-v3/enemy-walk-atlas.png'), { frameWidth: 314, frameHeight: 314 })
    this.load.image('hero-front', `${legacy}/sprites/hero_idle_front.png`)
    this.load.image('hero-right', `${legacy}/sprites/hero_idle_right.png`)
    this.load.image('hero-back', `${legacy}/sprites/hero_idle_back.png`)
    this.load.image('hero-walk-1', `${legacy}/sprites/hero_walk_right_1.png`)
    this.load.image('hero-walk-2', `${legacy}/sprites/hero_walk_right_2.png`)
    for (let i = 0; i < 8; i += 1) this.load.image(`enemy-${i}`, `${legacy}/themes/${type}_monster_${i}.png`)
    this.load.image('enemy-refined', assetUrl(`art/enemies-v2/${type}-shell.png`))
    this.load.image('spark', `${legacy}/sprites/item_spark.png`)
    this.load.image('shield', `${legacy}/sprites/item_shield.png`)
    this.load.image('core', `${legacy}/sprites/item_print.png`)
    this.load.image('pickup-heart', `${legacy}/sprites/item_heart.png`)
    this.load.image('pickup-power', `${legacy}/sprites/item_power.png`)
    this.load.image('pickup-dash', `${legacy}/sprites/item_dash.png`)
    this.load.image('pickup-energy', `${legacy}/sprites/item_battery.png`)
    const prop = type === 'electronic' ? 'facility_terminal' : type === 'plastic' ? 'facility_recycler' : type === 'paper' ? 'facility_shelf' : 'facility_workbench'
    this.load.image('arena-prop', `${legacy}/sprites/${prop}.png`)
  }

  create() {
    this.startedAt = this.time.now
    this.invulnerableUntil = this.time.now + 1800
    this.buffSpawnAt = this.time.now + 2600
    this.pollution = this.props.initialPollution
    this.value = this.props.initialValue
    this.targetKills = this.props.boss ? 1 : this.props.difficulty === 'experience' ? 5 : this.props.difficulty === 'challenge' ? 12 : 8
    this.maxHp = this.props.combatStats.maxHp + (this.props.builds.includes('barrier') ? 15 : 0)
    this.hp = this.maxHp
    this.maxShield = 12 + Math.round(this.props.combatStats.pollutionGuard * 100) + (this.props.builds.includes('barrier') ? 22 : 0)
    this.shield = this.maxShield
    const bg = this.add.image(480, 270, 'background').setDisplaySize(960, 540)
    const floorGlow = this.add.rectangle(480, 270, 910, 486, this.props.adventure.wasteType === 'textile' ? 0xff4b9d : this.props.adventure.wasteType === 'paper' ? 0xffb44c : 0x35d9ef, .035).setDepth(1)
    floorGlow.setBlendMode(Phaser.BlendModes.ADD)
    const frame = this.add.rectangle(480, 270, 928, 508).setStrokeStyle(4, 0x061116).setDepth(10)
    frame.setFillStyle(0x000000, 0)

    this.physics.world.setBounds(22, 22, 916, 496)
    this.hero = this.physics.add.sprite(480, 330, 'hero-front').setDepth(5).setScale(.44)
    this.hero.setCollideWorldBounds(true).setBodySize(this.hero.width * .38, this.hero.height * .28).setOffset(this.hero.width * .31, this.hero.height * .64)
    this.enemies = this.physics.add.group()
    this.projectiles = this.physics.add.group()
    this.enemyProjectiles = this.physics.add.group()
    this.pickups = this.physics.add.group({ allowGravity: false })
    this.obstacles = this.physics.add.staticGroup()
    this.hazardPools = this.add.group()
    ;[[122, 118, 74, 60], [838, 118, 74, 60], [122, 422, 74, 60], [838, 422, 74, 60]].forEach(([x, y, width, height], index) => {
      const obstacle = this.add.image(x, y, 'arena-prop').setDisplaySize(width, height).setDepth(3).setTint(index % 2 ? 0xd8e8ff : 0xffffff)
      this.physics.add.existing(obstacle, true); this.obstacles.add(obstacle)
      const beacon = this.add.rectangle(x, y + height / 2 - 2, width - 14, 4, index % 2 ? 0xffc65a : 0x41e7ff, .72).setDepth(4)
      this.tweens.add({ targets: beacon, alpha: .22, duration: 880 + index * 90, yoyo: true, repeat: -1 })
    })
    this.physics.add.collider(this.hero, this.obstacles)
    this.physics.add.collider(this.enemies, this.obstacles)
    const atlasRow = { electronic: 0, plastic: 1, paper: 2, textile: 3 }[this.props.adventure.wasteType]
    this.anims.create({ key: 'enemy-walk', frames: [0, 1, 2, 3].map((offset) => ({ key: 'enemy-walk-atlas', frame: atlasRow * 4 + offset })), frameRate: 8, repeat: -1 })
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => this.hitEnemy(projectile as Phaser.Physics.Arcade.Image, enemy as Phaser.Physics.Arcade.Sprite))
    this.physics.add.overlap(this.hero, this.enemies, (_, hit) => { const enemy = hit as Phaser.Physics.Arcade.Sprite; const definition = enemy.getData('definition') as EnemyDefinition; this.hitHero(enemy.x, enemy.y, (definition?.contactDamage ?? 9) * this.tuning.enemyDamage) })
    this.physics.add.overlap(this.hero, this.enemyProjectiles, (_, projectile) => {
      const shot = projectile as Phaser.Physics.Arcade.Image
      this.hitHero(shot.x, shot.y, 7 * this.tuning.enemyDamage)
      shot.destroy()
    })
    this.physics.add.overlap(this.hero, this.pickups, (_, pickup) => this.collectPickup(pickup as Phaser.Physics.Arcade.Image))

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,Q,E,R,SPACE') as Record<string, Phaser.Input.Keyboard.Key>
    this.keys.Q.on('down', () => this.pulse())
    this.keys.E.on('down', () => { this.chargeStartedAt = this.time.now })
    this.keys.E.on('up', () => this.releaseCharge())
    this.keys.R.on('down', () => this.finisher())
    this.keys.SPACE.on('down', () => this.dash())
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2
      this.activeAttack(point.x, point.y)
    })
    window.addEventListener('sgame-control', this.controlHandler)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('sgame-control', this.controlHandler))
    if (this.props.boss) this.spawnEnemy(true)
    else for (let i = 0; i < 3; i += 1) this.spawnEnemy(false)
    const intro = this.add.text(480, 270, this.props.boss ? 'POLLUTION SHELL // BOSS ROOM' : 'RECYCLING ROOM // AREA SECURED', { fontFamily: 'monospace', fontSize: '17px', color: '#efffff', backgroundColor: '#07161de8', padding: { x: 18, y: 10 }, stroke: '#071116', strokeThickness: 2 }).setOrigin(.5).setDepth(20)
    this.tweens.add({ targets: intro, alpha: 0, y: 250, delay: 650, duration: 420, onComplete: () => intro.destroy() })
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
    const x = boss ? 480 : edge === 0 ? 55 : edge === 1 ? 905 : Phaser.Math.Between(70, 890)
    const y = boss ? 125 : edge === 2 ? 55 : edge === 3 ? 475 : Phaser.Math.Between(70, 465)
    const pool = enemiesFor(this.props.adventure.wasteType)
    const elitePool = elitesFor(this.props.adventure.wasteType)
    const bossDefinition = bosses.find((item) => item.name === this.props.adventure.boss) ?? bosses.find((item) => item.type === this.props.adventure.wasteType)
    const canElite = !boss && this.time.now - this.startedAt > 8500 && elitePool.length > 0 && Math.random() < .2
    const definition = (boss ? bossDefinition : canElite ? Phaser.Utils.Array.GetRandom(elitePool) : Phaser.Utils.Array.GetRandom(pool)) as EnemyDefinition
    const variant = boss ? 7 : definition.sprite
    const enemy = this.enemies.create(x, y, boss ? 'enemy-refined' : 'enemy-walk-atlas') as Phaser.Physics.Arcade.Sprite
    const hp = Math.round(definition.hp * this.tuning.enemyHp)
    enemy.setDepth(4)
    if (boss) enemy.setDisplaySize(108, 98)
    else {
      enemy.setDisplaySize(definition.tier === 'elite' ? 58 : 44, definition.tier === 'elite' ? 58 : 44)
      enemy.play({ key: 'enemy-walk', startFrame: variant % 4 }, true)
    }
    const roleTint: Partial<Record<EnemyDefinition['role'], number>> = { ranged: 0xb9ddff, charger: 0xffd0a0, hazard: 0xd8b4ff, support: 0xa5f2bf, splitter: 0xffb7d5 }
    enemy.setTint(definition.tier === 'elite' ? 0xffe287 : roleTint[definition.role] ?? 0xffffff).setData({ hp, maxHp: hp, boss, definition, shootAt: this.time.now + Phaser.Math.Between(900, 1900), abilityAt: this.time.now + Phaser.Math.Between(1200, 2200), slowedUntil: 0, phase: 0 })
    enemy.setBodySize(enemy.width * .46, enemy.height * .34).setOffset(enemy.width * .27, enemy.height * .56)
    this.attachEnemyBar(enemy, boss)
    if (boss) {
      const ring = this.add.circle(x, y, 58).setStrokeStyle(4, 0xff765e, .8).setDepth(3)
      this.tweens.add({ targets: ring, scale: 1.15, alpha: .35, duration: 900, yoyo: true, repeat: -1 })
      enemy.setData('ring', ring)
      const entrance = this.add.circle(x, y, 18, 0xff765e, .3).setStrokeStyle(5, 0xffd3b2, .8).setDepth(8)
      this.tweens.add({ targets: entrance, scale: 5, alpha: 0, duration: 560, onComplete: () => entrance.destroy() })
    }
  }

  private attachEnemyBar(enemy: Phaser.Physics.Arcade.Sprite, boss: boolean) {
    const width = boss ? 104 : enemy.getData('definition').tier === 'elite' ? 66 : 48
    const background = this.add.rectangle(enemy.x, enemy.y, width, boss ? 9 : 6, 0x071116, .94).setStrokeStyle(2, boss ? 0xffd65a : 0xd9f2ef, .72).setDepth(9)
    const fill = this.add.rectangle(enemy.x - width / 2 + 2, enemy.y, width - 4, boss ? 5 : 3, boss ? 0xff765e : 0x74ed9d, 1).setOrigin(0, .5).setDepth(10)
    enemy.setData('barWidth', width).setData('barBg', background).setData('barFill', fill)
  }

  private updateEnemyBar(enemy: Phaser.Physics.Arcade.Sprite) {
    const background = enemy.getData('barBg') as Phaser.GameObjects.Rectangle | undefined
    const fill = enemy.getData('barFill') as Phaser.GameObjects.Rectangle | undefined
    if (!background || !fill) return
    const width = enemy.getData('barWidth') as number
    const y = enemy.y - enemy.displayHeight * .55 - 8
    const ratio = Phaser.Math.Clamp((enemy.getData('hp') as number) / (enemy.getData('maxHp') as number), 0, 1)
    background.setPosition(enemy.x, y)
    fill.setPosition(enemy.x - width / 2 + 2, y).setDisplaySize((width - 4) * ratio, fill.height)
  }

  private destroyEnemyBar(enemy: Phaser.Physics.Arcade.Sprite) {
    ;(enemy.getData('barBg') as Phaser.GameObjects.Rectangle | undefined)?.destroy()
    ;(enemy.getData('barFill') as Phaser.GameObjects.Rectangle | undefined)?.destroy()
  }

  private spawnPickup(x: number, y: number, forced?: PickupKind) {
    const randomPool: PickupKind[] = ['material', 'material', 'shield', 'heal', 'energy']
    const kind = forced ?? Phaser.Utils.Array.GetRandom(randomPool)
    const spec: Record<PickupKind, { texture: string; label: string; color: number; size: number }> = {
      material: { texture: 'spark', label: '可用材料', color: 0xffd65a, size: 22 },
      shield: { texture: 'shield', label: '+20 护盾', color: 0x62dcff, size: 28 },
      heal: { texture: 'pickup-heart', label: `修复 ${Math.round((.1 + this.props.skillEffects.healingBonus) * 100)}% 生命`, color: 0xff6d78, size: 28 },
      attack: { texture: 'pickup-power', label: '超载攻击 · 8秒', color: 0xffb24f, size: 30 },
      speed: { texture: 'pickup-dash', label: '轻量移动 · 8秒', color: 0x7ef2b0, size: 30 },
      energy: { texture: 'pickup-energy', label: `终结能量 +${18 + this.props.skillEffects.energyBonus}`, color: 0xb995ff, size: 26 },
      prototype: { texture: 'core', label: this.props.adventure.prototype, color: 0xffe56d, size: 42 },
    }
    const data = spec[kind]
    const pickup = this.pickups.create(Phaser.Math.Clamp(x, 70, 890), Phaser.Math.Clamp(y, 70, 470), data.texture) as Phaser.Physics.Arcade.Image
    pickup.setDisplaySize(data.size, data.size).setDepth(8).setTint(data.color).setData('kind', kind).setData('bornAt', this.time.now)
    pickup.setCircle(Math.max(8, pickup.width * .26), pickup.width * .24, pickup.height * .24)
    const shadow = this.add.ellipse(pickup.x, pickup.y + data.size * .38, data.size * .8, 8, 0x000000, .45).setDepth(5)
    const beacon = this.add.circle(pickup.x, pickup.y, data.size * .72).setStrokeStyle(3, data.color, .8).setDepth(7)
    const label = this.add.text(pickup.x, pickup.y - data.size * .75, data.label, { fontFamily: 'monospace', fontSize: kind === 'prototype' ? '11px' : '8px', color: '#ffffff', backgroundColor: '#071116dc', padding: { x: 5, y: 3 }, stroke: '#071116', strokeThickness: 2 }).setOrigin(.5, 1).setDepth(11)
    pickup.setData('shadow', shadow).setData('beacon', beacon).setData('label', label)
    this.tweens.add({ targets: pickup, scaleX: pickup.scaleX * 1.1, scaleY: pickup.scaleY * 1.1, angle: kind === 'prototype' ? 6 : 3, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    this.tweens.add({ targets: beacon, scale: 1.35, alpha: .12, duration: 760, yoyo: true, repeat: -1 })
  }

  private collectPickup(pickup: Phaser.Physics.Arcade.Image) {
    if (!pickup.active) return
    const kind = pickup.getData('kind') as PickupKind
    let message = ''
    if (kind === 'material') { this.value += Math.round(4 * this.props.combatStats.valueGain); message = '可用材料 +4' }
    if (kind === 'shield') { this.maxShield = Math.max(this.maxShield, this.shield + 20); this.shield += 20; message = '循环护盾 +20' }
    if (kind === 'heal') { const restored = Math.ceil(this.maxHp * (.1 + this.props.skillEffects.healingBonus)); this.hp = Math.min(this.maxHp, this.hp + restored); message = `生命修复 +${restored}` }
    if (kind === 'attack') { this.attackBoostUntil = this.time.now + 8000; message = '超载攻击已启动 · 8秒' }
    if (kind === 'speed') { this.speedBoostUntil = this.time.now + 8000; message = '轻量移动已启动 · 8秒' }
    if (kind === 'energy') { this.finisherCharge = Math.min(100, this.finisherCharge + 18 + this.props.skillEffects.energyBonus); message = `终结能量 +${18 + this.props.skillEffects.energyBonus}` }
    if (kind === 'prototype') { message = '稳定原型已回收'; this.awaitingPrototype = false; this.ended = true; this.time.delayedCall(900, () => this.props.onComplete({ purified: this.kills, damageTaken: this.damageTaken, value: this.value })) }
    ;(pickup.getData('shadow') as Phaser.GameObjects.Ellipse | undefined)?.destroy()
    ;(pickup.getData('beacon') as Phaser.GameObjects.Arc | undefined)?.destroy()
    ;(pickup.getData('label') as Phaser.GameObjects.Text | undefined)?.destroy()
    const burst = this.add.circle(pickup.x, pickup.y, 14, kind === 'heal' ? 0xff6d78 : kind === 'shield' ? 0x62dcff : 0xffdf69, .8).setDepth(10)
    this.tweens.add({ targets: burst, scale: 4, alpha: 0, duration: 300, onComplete: () => burst.destroy() })
    pickup.destroy(); playUiSound(kind === 'prototype' ? 'success' : 'hover', kind === 'prototype' ? .9 : .42)
    this.showPickupToast(message)
  }

  private showPickupToast(message: string) {
    const toast = this.add.text(480, 465, message, { fontFamily: 'monospace', fontSize: '12px', color: '#071116', backgroundColor: '#fff0a8', padding: { x: 10, y: 6 } }).setOrigin(.5).setDepth(20)
    this.tweens.add({ targets: toast, y: 444, alpha: 0, delay: 560, duration: 300, onComplete: () => toast.destroy() })
  }

  private spawnMapBuff() {
    const kinds: PickupKind[] = ['shield', 'heal', 'attack', 'speed']
    const kind = Phaser.Utils.Array.GetRandom(kinds)
    const x = Phaser.Math.Between(220, 740); const y = Phaser.Math.Between(115, 425)
    const marker = this.add.circle(x, y, 30, 0x54e8ff, .08).setStrokeStyle(4, 0x9ff8ff, .8).setDepth(7)
    this.tweens.add({ targets: marker, scale: .55, alpha: .9, duration: 520, onComplete: () => { marker.destroy(); this.spawnPickup(x, y, kind) } })
    this.buffSpawnAt = this.time.now + Phaser.Math.Between(10500, 14500)
  }

  private updatePickups() {
    this.pickups.getChildren().forEach((item) => {
      const pickup = item as Phaser.Physics.Arcade.Image
      if (!pickup.active) return
      const distance = Phaser.Math.Distance.Between(pickup.x, pickup.y, this.hero.x, this.hero.y)
      const kind = pickup.getData('kind') as PickupKind
      const attraction = (kind === 'prototype' ? 260 : this.props.builds.includes('magnet') ? 165 : 72) * this.props.combatStats.aimAssist
      if (distance < attraction) this.physics.moveToObject(pickup, this.hero, kind === 'prototype' ? 250 : 180)
      else pickup.setVelocity(0)
      ;(pickup.getData('shadow') as Phaser.GameObjects.Ellipse | undefined)?.setPosition(pickup.x, pickup.y + pickup.displayHeight * .38)
      ;(pickup.getData('beacon') as Phaser.GameObjects.Arc | undefined)?.setPosition(pickup.x, pickup.y)
      ;(pickup.getData('label') as Phaser.GameObjects.Text | undefined)?.setPosition(pickup.x, pickup.y - pickup.displayHeight * .72)
    })
  }

  private attack(now: number) {
    if (now < this.attackAt) return
    const living = this.enemies.getChildren().filter((item) => (item as Phaser.Physics.Arcade.Sprite).active) as Phaser.Physics.Arcade.Sprite[]
    if (!living.length) return
    const nearest = living.sort((a, b) => Phaser.Math.Distance.Between(this.hero.x, this.hero.y, a.x, a.y) - Phaser.Math.Distance.Between(this.hero.x, this.hero.y, b.x, b.y))[0]
    const projectile = this.projectiles.create(this.hero.x, this.hero.y - 8, 'spark') as Phaser.Physics.Arcade.Image
    const crit = Math.random() < this.props.combatStats.critChance * .6
    const baseDamage = this.props.combatStats.attack + (this.props.builds.includes('cascade') ? 4 : 0)
    projectile.setScale(crit ? .22 : .17).setDepth(6).setTint(crit ? 0xffd65a : 0x72dbe7).setAlpha(.82).setData('damage', Math.round(baseDamage * .32 * (crit ? 1.5 : 1) * this.attackMultiplier)).setData('target', nearest).setData('homing', true)
    this.physics.moveToObject(projectile, nearest, 440)
    this.time.delayedCall(1400, () => projectile.active && projectile.destroy())
    this.attackAt = now + (this.props.builds.includes('pulse') ? 1180 : 1480) / this.props.combatStats.attackSpeed
    const flash = this.add.circle(this.hero.x, this.hero.y - 8, 6, 0x9feef2, .55).setDepth(6)
    this.tweens.add({ targets: flash, scale: 2.1, alpha: 0, duration: 150, onComplete: () => flash.destroy() })
  }

  private activeAttack(x: number, y: number) {
    if (this.ended || this.time.now < this.activeAttackAt) return
    if (this.weaponMode === 'shear') return this.castArcShear(x, y)
    const useSigil = ['sigil', 'anchor'].includes(this.weaponMode) || (this.weaponMode === 'hybrid' && (this.hybridSigil = !this.hybridSigil))
    if (useSigil) this.castSigil(x, y)
    else this.fireManualBolt(x, y)
  }

  private fireManualBolt(x: number, y: number) {
    this.activeAttackAt = this.time.now + this.weaponBehavior.clickCooldown / this.props.combatStats.attackSpeed
    const direction = new Phaser.Math.Vector2(x - this.hero.x, y - this.hero.y).normalize()
    if (!direction.lengthSq()) return
    this.lastDirection.copy(direction)
    this.manualShots += 1
    const crit = Math.random() < this.props.combatStats.critChance
    const damage = Math.round(this.props.combatStats.attack * (crit ? 2.05 : 1.35) * this.attackMultiplier)
    const spread = this.weaponMode === 'prism' ? [-.14, 0, .14] : this.weaponMode === 'swarm' ? [-.1, 0, .1] : this.weaponMode === 'bolt' && this.manualShots % 4 === 0 ? [-.16, 0, .16] : [0]
    const swarmTargets = this.weaponMode === 'swarm' ? this.enemies.getChildren().map((item) => item as Phaser.Physics.Arcade.Sprite).filter((item) => item.active).sort((a, b) => Phaser.Math.Distance.Between(x, y, a.x, a.y) - Phaser.Math.Distance.Between(x, y, b.x, b.y)).slice(0, 3) : []
    spread.forEach((offset, index) => {
      const shotDirection = direction.clone().rotate(offset)
      const projectile = this.projectiles.create(this.hero.x + shotDirection.x * 18, this.hero.y - 7 + shotDirection.y * 18, 'spark') as Phaser.Physics.Arcade.Image
      const target = swarmTargets[index % Math.max(1, swarmTargets.length)]
      const homing = this.weaponMode === 'swarm' && Boolean(target)
      projectile.setScale(crit ? .34 : this.weaponMode === 'swarm' ? .2 : .27).setDepth(7).setTint(crit ? 0xffdf62 : this.weaponBehavior.color).setData('damage', spread.length > 1 ? Math.round(damage * (this.weaponMode === 'swarm' ? .56 : .72)) : damage).setData('homing', homing).setData('active', true).setData('target', target).setVelocity(shotDirection.x * 720, shotDirection.y * 720)
      this.time.delayedCall(900, () => projectile.active && projectile.destroy())
    })
    const muzzle = this.add.star(this.hero.x + direction.x * 17, this.hero.y - 7 + direction.y * 17, 6, 4, 11, crit ? 0xffd65a : 0xb9fbff, .92).setDepth(8).setRotation(direction.angle())
    this.tweens.add({ targets: muzzle, scale: 2.4, alpha: 0, duration: 130, onComplete: () => muzzle.destroy() })
    playUiSound(crit ? 'success' : 'click', .35)
  }

  private castSigil(x: number, y: number) {
    this.activeAttackAt = this.time.now + this.weaponBehavior.clickCooldown / this.props.combatStats.cooldownRate
    const targetX = Phaser.Math.Clamp(x, 55, 905)
    const targetY = Phaser.Math.Clamp(y, 55, 485)
    const radius = this.weaponMode === 'anchor' ? 132 : this.weaponMode === 'hybrid' ? 78 : 98
    const tint = this.weaponMode === 'anchor' ? 0x4fa6ff : 0x865dff
    const outer = this.add.circle(targetX, targetY, radius, tint, .1).setStrokeStyle(4, this.weaponBehavior.color, .9).setDepth(7)
    const inner = this.add.circle(targetX, targetY, radius * .52, 0xff78ad, .08).setStrokeStyle(3, 0x70f0ff, .85).setDepth(7)
    const delay = this.weaponMode === 'anchor' ? 470 : 300
    this.tweens.add({ targets: [outer, inner], angle: 150, scale: .72, duration: delay, ease: 'Sine.easeIn' })
    this.time.delayedCall(delay, () => {
      if (!outer.active) return
      this.cameras.main.shake(this.profileShake ? 70 : 0, .004)
      this.enemies.getChildren().forEach((item) => {
        const enemy = item as Phaser.Physics.Arcade.Sprite
        if (enemy.active && Phaser.Math.Distance.Between(targetX, targetY, enemy.x, enemy.y) <= radius) {
          if (this.weaponMode === 'anchor') enemy.setData('slowedUntil', this.time.now + 1800)
          this.damageEnemy(enemy, Math.round(this.props.combatStats.attack * (this.weaponMode === 'anchor' ? 2.3 : 1.75) * this.attackMultiplier), true)
        }
      })
      const bloom = this.add.circle(targetX, targetY, 22, 0xc9baff, .72).setDepth(8)
      this.tweens.add({ targets: bloom, scale: 5.5, alpha: 0, duration: 330, onComplete: () => bloom.destroy() })
      outer.destroy(); inner.destroy(); playUiSound('success', .5)
    })
  }

  private castArcShear(x: number, y: number) {
    this.activeAttackAt = this.time.now + this.weaponBehavior.clickCooldown / this.props.combatStats.attackSpeed
    const direction = new Phaser.Math.Vector2(x - this.hero.x, y - this.hero.y).normalize()
    if (!direction.lengthSq()) return
    this.lastDirection.copy(direction)
    const range = 125
    const arc = this.add.arc(this.hero.x, this.hero.y - 6, 76, -55, 55, false, this.weaponBehavior.color, .2).setStrokeStyle(11, this.weaponBehavior.color, .92).setDepth(8).setRotation(direction.angle())
    this.tweens.add({ targets: arc, scale: 1.45, alpha: 0, duration: 155, onComplete: () => arc.destroy() })
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      if (!enemy.active) return
      const toward = new Phaser.Math.Vector2(enemy.x - this.hero.x, enemy.y - this.hero.y)
      if (toward.length() <= range && toward.normalize().dot(direction) > .35) this.damageEnemy(enemy, Math.round(this.props.combatStats.attack * 1.18 * this.attackMultiplier), true)
    })
    playUiSound('click', .38)
  }

  private hitEnemy(projectile: Phaser.Physics.Arcade.Image, enemy: Phaser.Physics.Arcade.Sprite) {
    const damage = projectile.getData('damage') as number
    const active = (projectile.getData('active') as boolean | undefined) ?? !projectile.getData('homing')
    projectile.destroy()
    this.damageEnemy(enemy, damage, active)
  }

  private damageEnemy(enemy: Phaser.Physics.Arcade.Sprite, damage: number, active = false, allowChain = true) {
    if (!enemy.active) return
    playUiSound(active ? 'success' : 'click', active ? .34 : .18)
    const hp = (enemy.getData('hp') as number) - damage
    enemy.setData('hp', hp).setTint(0xffffff)
    this.hitCombo = this.time.now < this.comboExpiresAt ? this.hitCombo + (active ? 2 : 1) : (active ? 2 : 1)
    this.comboExpiresAt = this.time.now + 1600
    this.finisherCharge = Math.min(100, this.finisherCharge + (enemy.getData('boss') ? 5 : 8))
    this.time.delayedCall(55, () => enemy.active && enemy.clearTint())
    this.cameras.main.shake(this.profileShake ? 28 : 0, .002)
    for (let i = 0; i < 4; i += 1) {
      const bit = this.add.rectangle(enemy.x, enemy.y, 4, 4, this.props.adventure.wasteType === 'textile' ? 0xff78ad : 0x41e7ff).setDepth(7)
      this.tweens.add({ targets: bit, x: enemy.x + Phaser.Math.Between(-28, 28), y: enemy.y + Phaser.Math.Between(-28, 28), alpha: 0, duration: 220, onComplete: () => bit.destroy() })
    }
    const number = this.add.text(enemy.x, enemy.y - enemy.displayHeight * .52, `${active ? '✦ ' : ''}${damage}`, { fontFamily: 'monospace', fontSize: active ? '15px' : '11px', color: active ? '#fff1a8' : '#d7fbff', stroke: '#071116', strokeThickness: 4 }).setOrigin(.5).setDepth(12)
    this.tweens.add({ targets: number, y: number.y - 24, alpha: 0, duration: active ? 520 : 380, onComplete: () => number.destroy() })
    if (this.props.builds.includes('pulse') && Math.random() < .18) enemy.setData('slowedUntil', this.time.now + 700)
    this.checkBossPhase(enemy, hp)
    if (active && allowChain && this.weaponMode === 'chain') {
      const next = this.enemies.getChildren().map((item) => item as Phaser.Physics.Arcade.Sprite).filter((item) => item.active && item !== enemy && Phaser.Math.Distance.Between(enemy.x, enemy.y, item.x, item.y) < 170).sort((a, b) => Phaser.Math.Distance.Between(enemy.x, enemy.y, a.x, a.y) - Phaser.Math.Distance.Between(enemy.x, enemy.y, b.x, b.y))[0]
      if (next) {
        const chain = this.add.line(0, 0, enemy.x, enemy.y, next.x, next.y, 0x7ef2b0, .85).setOrigin(0).setLineWidth(3).setDepth(8)
        this.tweens.add({ targets: chain, alpha: 0, duration: 180, onComplete: () => chain.destroy() })
        this.damageEnemy(next, Math.max(1, Math.round(damage * .38)), true, false)
      }
    }
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
    const splitOrigin = { x: enemy.x, y: enemy.y, texture: enemy.texture.key, frame: Number(enemy.frame.name) }
    const shouldSplit = !isBoss && definition.role === 'splitter' && !enemy.getData('splitChild')
    const ring = enemy.getData('ring') as Phaser.GameObjects.Arc | undefined
    ring?.destroy()
    this.destroyEnemyBar(enemy)
    const burst = this.add.circle(enemy.x, enemy.y, isBoss ? 24 : 12, 0x70f0a8, .75).setDepth(8)
    this.tweens.add({ targets: burst, scale: isBoss ? 8 : 4, alpha: 0, duration: 440, onComplete: () => burst.destroy() })
    enemy.destroy()
    if (shouldSplit) {
      for (const offset of [-22, 22]) {
        const fragment = this.enemies.create(splitOrigin.x + offset, splitOrigin.y, splitOrigin.texture) as Phaser.Physics.Arcade.Sprite
        fragment.setDepth(4).setFrame(splitOrigin.frame).setDisplaySize(30, 30).setTint(definition.color).setData({ hp: 12, maxHp: 12, boss: false, definition, splitChild: true, shootAt: this.time.now + 1800, abilityAt: this.time.now + 3200, slowedUntil: 0, phase: 0 })
        fragment.play({ key: 'enemy-walk', startFrame: Math.abs(offset) % 4 }, true)
        fragment.setBodySize(fragment.width * .5, fragment.height * .36).setOffset(fragment.width * .25, fragment.height * .58)
        this.attachEnemyBar(fragment, false)
      }
    }
    playUiSound(isBoss ? 'success' : 'hover', isBoss ? .8 : .28)
    this.kills += 1
    if (!isBoss) this.hp = Math.min(this.maxHp, this.hp + this.props.skillEffects.killHeal)
    this.value += Math.round((isBoss ? 100 : 8) * this.props.combatStats.valueGain)
    this.pollution = Math.max(0, this.pollution - (isBoss ? 30 : 2.5))
    if (this.props.builds.includes('magnet')) this.hp = Math.min(this.maxHp, this.hp + 2)
    if (isBoss) {
      this.awaitingPrototype = true
      this.spawnPickup(splitOrigin.x, splitOrigin.y, 'prototype')
    } else if (Math.random() < .72) this.spawnPickup(splitOrigin.x, splitOrigin.y)
    if (this.kills >= this.targetKills) {
      if (!isBoss) {
        this.ended = true
        this.time.delayedCall(1250, () => this.props.onComplete({ purified: this.kills, damageTaken: this.damageTaken, value: this.value }))
      }
    } else if (!this.props.boss) this.spawnEnemy(false)
  }

  private hitHero(sourceX: number, sourceY: number, damage: number) {
    if (this.time.now < this.invulnerableUntil || this.ended) return
    this.invulnerableUntil = this.time.now + 760
    const protectedDamage = damage * .68 * (1 - this.props.combatStats.pollutionGuard)
    const absorbed = Math.min(this.shield, protectedDamage)
    this.shield -= absorbed
    const healthDamage = protectedDamage - absorbed
    this.hp -= healthDamage
    this.damageTaken += healthDamage
    if (!this.secondWindUsed && this.props.skillEffects.secondWindShield > 0 && this.hp > 0 && this.hp <= this.maxHp * .3) {
      this.secondWindUsed = true
      this.shield += this.props.skillEffects.secondWindShield
      this.maxShield = Math.max(this.maxShield, this.shield)
      const notice = this.add.text(this.hero.x, this.hero.y - 45, '二次整备 · 护盾 +30', { fontSize: '14px', color: '#a4f5ff', backgroundColor: '#082c35', padding: { x: 8, y: 5 } }).setOrigin(.5).setDepth(20)
      this.tweens.add({ targets: notice, y: notice.y - 25, alpha: 0, delay: 600, duration: 700, onComplete: () => notice.destroy() })
    }
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
    const damage = Math.round((22 + ratio * 55) * (this.props.combatStats.attack / 16) * this.attackMultiplier)
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
        this.damageEnemy(enemy, damage, true)
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
      this.damageEnemy(enemy, damage, true)
    })
  }

  private pulse() {
    if (this.time.now < this.pulseReadyAt || this.ended) return
    this.pulseReadyAt = this.time.now + 6500 / this.props.combatStats.cooldownRate
    playUiSound('success', .45)
    const wave = this.add.circle(this.hero.x, this.hero.y, 22, 0x41e7ff, .15).setStrokeStyle(6, 0x9ff7ff, .9).setDepth(7)
    this.tweens.add({ targets: wave, scale: (220 + this.props.skillEffects.pulseRadius) / 22, alpha: 0, duration: 480, onComplete: () => wave.destroy() })
    this.enemies.getChildren().forEach((item) => {
      const enemy = item as Phaser.Physics.Arcade.Sprite
      const toEnemy = new Phaser.Math.Vector2(enemy.x - this.hero.x, enemy.y - this.hero.y).normalize()
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.x, enemy.y) < 220 + this.props.skillEffects.pulseRadius && this.lastDirection.dot(toEnemy) > .15) {
        enemy.setData('slowedUntil', this.time.now + 900)
        this.damageEnemy(enemy, Math.round(24 * this.attackMultiplier), true)
      }
    })
  }

  private dash() {
    if (this.time.now < this.dashReadyAt || this.ended) return
    this.dashReadyAt = this.time.now + 1800 / this.props.combatStats.cooldownRate
    this.shield = Math.min(this.maxShield, this.shield + this.props.skillEffects.dashShield)
    playUiSound('hover', .25)
    this.dashUntil = this.time.now + 190
    this.invulnerableUntil = this.time.now + (this.props.builds.includes('barrier') ? 650 : 260)
    const ghost = this.add.image(this.hero.x, this.hero.y, this.hero.texture.key).setScale(.44).setAlpha(.55).setTint(0x41e7ff).setDepth(3)
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
    const buffedSpeed = this.props.combatStats.moveSpeed * (now < this.speedBoostUntil ? 1.28 : 1)
    const speed = now < this.dashUntil ? 520 + (buffedSpeed - 210) : buffedSpeed
    this.hero.setVelocity(direction.x * speed, direction.y * speed)
    if (direction.lengthSq() > 0 && now - this.lastAnimAt > 145) { this.lastAnimAt = now; this.animFrame = !this.animFrame }
    if (direction.x !== 0) this.hero.setFlipX(direction.x < 0).setTexture(this.animFrame ? 'hero-walk-1' : 'hero-walk-2')
    else if (direction.y < 0) this.hero.setFlipX(false).setTexture('hero-back')
    else if (direction.y > 0) this.hero.setFlipX(false).setTexture('hero-front')

    this.attack(now)
    if (now >= this.buffSpawnAt && !this.awaitingPrototype) this.spawnMapBuff()
    this.updatePickups()
    this.projectiles.getChildren().forEach((item) => {
      const projectile = item as Phaser.Physics.Arcade.Image
      const target = projectile.getData('target') as Phaser.Physics.Arcade.Sprite | undefined
      if (target?.active) this.physics.moveToObject(projectile, target, 590)
    })
    if (!this.props.boss && now > this.spawnAt && this.enemies.countActive() < 5) {
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
      const speedEnemy = definition.speed * (isBoss ? .9 : .82) * (slowed ? .25 : 1)
      const keepDistance = isBoss || definition.role === 'ranged' || definition.role === 'support'
      if (keepDistance && distance < 155) this.physics.velocityFromRotation(Phaser.Math.Angle.Between(this.hero.x, this.hero.y, enemy.x, enemy.y), speedEnemy, (enemy.body as Phaser.Physics.Arcade.Body).velocity)
      else if (distance > (keepDistance ? 235 : isBoss ? 108 : 56)) this.physics.moveToObject(enemy, this.hero, speedEnemy)
      else enemy.setVelocity(0)
      const body = enemy.body as Phaser.Physics.Arcade.Body
      if (!isBoss) {
        enemy.setFlipX(body.velocity.x < -2)
        if (!enemy.anims.isPlaying) enemy.play('enemy-walk')
        enemy.setAngle(Phaser.Math.Clamp(body.velocity.x / Math.max(1, speedEnemy) * 3, -3, 3))
      } else {
        enemy.setAngle(Math.sin(now * .014) * 3.2)
        const stepScale = 1 + Math.sin(now * .022) * .025
        enemy.setDisplaySize(108 * stepScale, 98 / stepScale)
      }
      const ring = enemy.getData('ring') as Phaser.GameObjects.Arc | undefined
      ring?.setPosition(enemy.x, enemy.y)
      this.updateEnemyBar(enemy)
      if ((definition.role === 'ranged' || isBoss) && now > (enemy.getData('shootAt') as number)) {
        const shot = this.enemyProjectiles.create(enemy.x, enemy.y, 'spark') as Phaser.Physics.Arcade.Image
        shot.setScale(.16).setTint(0xff6f68).setDepth(6)
        this.physics.moveToObject(shot, this.hero, isBoss ? 260 : 190)
        enemy.setData('shootAt', now + (isBoss ? 1250 : 1700) * this.tuning.telegraphTime)
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
      const radar = this.enemies.getChildren().filter((item) => (item as Phaser.Physics.Arcade.Sprite).active).map((item) => {
        const enemy = item as Phaser.Physics.Arcade.Sprite
        return { x: enemy.x / 9.6, y: enemy.y / 5.4, boss: Boolean(enemy.getData('boss')) }
      })
      const boss = this.enemies.getChildren().find((item) => (item as Phaser.Physics.Arcade.Sprite).active && Boolean((item as Phaser.Physics.Arcade.Sprite).getData('boss'))) as Phaser.Physics.Arcade.Sprite | undefined
      const activeBuffs = [
        this.attackBoostUntil > now ? { id: 'attack', label: '攻击强化', remaining: Math.ceil((this.attackBoostUntil - now) / 1000), tone: 'attack' } : null,
        this.speedBoostUntil > now ? { id: 'speed', label: '移动强化', remaining: Math.ceil((this.speedBoostUntil - now) / 1000), tone: 'speed' } : null,
      ].filter(Boolean) as { id: string; label: string; remaining: number; tone: string }[]
      this.props.onHud({ hp: Math.max(0, this.hp), maxHp: this.maxHp, shield: Math.max(0, this.shield), maxShield: this.maxShield, bossHp: boss ? Math.max(0, boss.getData('hp')) : 0, bossMaxHp: boss?.getData('maxHp') ?? 0, pollution: Math.round(this.pollution), value: this.value, combo: this.hitCombo, finisher: Math.round(this.finisherCharge), playerX: this.hero.x / 9.6, playerY: this.hero.y / 5.4, radar, drops: this.pickups.countActive(), activeBuffs, skillCooldowns: { pulse: Math.max(0, (this.pulseReadyAt - now) / 1000), dash: Math.max(0, (this.dashReadyAt - now) / 1000), finisher: Math.max(0, 100 - this.finisherCharge) } })
    }
    if (now >= this.pollutionAt) {
      this.pollutionAt = now + 1000
      const pressure = this.enemies.countActive() * (this.props.boss ? .16 : .075) * this.tuning.pollutionRate * (1 - this.props.combatStats.pollutionGuard)
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
  const buildKey = props.builds.join('|')

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
  }, [props.adventure.id, props.boss, props.difficulty, props.weaponId, buildKey, props.screenShake, props.combatStats.attack, props.combatStats.attackSpeed, props.combatStats.cooldownRate, props.combatStats.critChance, props.combatStats.maxHp, props.combatStats.moveSpeed, props.combatStats.pollutionGuard])

  const control = (action: string, active = true) => window.dispatchEvent(new CustomEvent('sgame-control', { detail: { action, active } }))
  const holdProps = (action: string) => ({
    onPointerDown: (event: React.PointerEvent) => { event.currentTarget.setPointerCapture(event.pointerId); control(action, true) },
    onPointerUp: () => control(action, false), onPointerCancel: () => control(action, false),
  })

  return <div className="combat-stage">
    <div ref={host} className="phaser-host" />
    <div className="touch-controls" aria-label="触屏控制">
      <div className="dpad"><button {...holdProps('up')} className="up"><span className="control-arrow" /></button><button {...holdProps('left')} className="left"><span className="control-arrow" /></button><button {...holdProps('down')} className="down"><span className="control-arrow" /></button><button {...holdProps('right')} className="right"><span className="control-arrow" /></button></div>
      <div className="action-pad"><button {...holdProps('charge')} className="charge"><GameIcon name="charge" size={42} /><span>蓄力</span><small>按住 E</small></button><button onPointerDown={() => control('pulse')} className={`pulse ${(props.pulseCooldown ?? 0) <= 0 ? 'is-ready' : ''}`}><GameIcon name="pulse" size={42} /><span>脉冲</span><small>{(props.pulseCooldown ?? 0) <= 0 ? 'Q · 可用' : `${props.pulseCooldown?.toFixed(1)}s`}</small></button><button onPointerDown={() => control('finisher')} className={`finisher ${(props.finisherCharge ?? 0) >= 100 ? 'is-ready' : ''}`}><GameIcon name="ultimate" size={42} /><span>终结</span><small>R · {Math.round(props.finisherCharge ?? 0)}%</small></button><button onPointerDown={() => control('dash')} className={`dash ${(props.dashCooldown ?? 0) <= 0 ? 'is-ready' : ''}`}><GameIcon name="dash" size={38} /><span>冲刺</span><small>{(props.dashCooldown ?? 0) <= 0 ? '空格' : `${props.dashCooldown?.toFixed(1)}s`}</small></button></div>
    </div>
  </div>
}
