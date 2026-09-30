import Phaser from 'phaser';
import { GameEventBus } from '../GameEventBus';
import { PathCode } from '../../types';
import { STAGE_QUIZZES, STAGE_BOSS_MISSIONS } from '../../data/mockQuests';

interface EnemySprite extends Phaser.Physics.Arcade.Sprite {
  quizData?: any;
  isDefeated?: boolean;
  glowTween?: Phaser.Tweens.Tween;
  label?: Phaser.GameObjects.Text;
}

interface BossSprite extends Phaser.Physics.Arcade.Sprite {
  bossData?: any;
  glowTween?: Phaser.Tweens.Tween;
  label?: Phaser.GameObjects.Text;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerLight!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private currentPath: PathCode = 'professional';
  private currentStage: number = 1;
  private isTransitioningZone: boolean = false;

  private worldBackground!: Phaser.GameObjects.Image;
  private enemies: EnemySprite[] = [];
  private boss!: BossSprite;
  private gameEventUnsubs: Array<() => void> = [];
  private bossTorches: Phaser.GameObjects.Sprite[] = [];
  private bossLights: Phaser.GameObjects.Arc[] = [];
  private defeatedEnemyIds: Set<string> = new Set();

  private promptText!: Phaser.GameObjects.Text;
  private zoneBanner!: Phaser.GameObjects.Container;
  private zoneBannerText!: Phaser.GameObjects.Text;
  private targetPointerPosition: { x: number; y: number } | null = null;
  private isBossRejecting: boolean = false;

  private readonly mapWidth = 1024;
  private readonly mapHeight = 1024;

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data: { pathCode?: PathCode; stageOrdinal?: number }) {
    if (data.pathCode) this.currentPath = data.pathCode;
    if (data.stageOrdinal) this.currentStage = data.stageOrdinal;
  }

  create() {
    this.buildWorldMap();
    this.createPlayer();
    this.setupInputs();
    this.spawnStageEntities();
    this.setupZoneBanner();

    // Interaction prompt (retro bottom toast)
    this.promptText = this.add.text(this.scale.width / 2, this.scale.height - 45, '', {
      fontFamily: '"Pixelify Sans", sans-serif',
      fontSize: '14px',
      color: '#fde047',
      backgroundColor: '#090e1a',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.promptText.setPosition(gameSize.width / 2, gameSize.height - 45);
      if (this.zoneBanner) {
        this.zoneBanner.setPosition(gameSize.width / 2, 70);
      }
      this.updateCameraBounds();
    });

    this.gameEventUnsubs.push(GameEventBus.on('SET_STAGE', (stageOrdinal: number) => {
      if (this.currentStage !== stageOrdinal) {
        this.switchStage(stageOrdinal);
      }
    }));

    this.gameEventUnsubs.push(GameEventBus.on('SET_PATH', (pathCode: PathCode) => {
      this.currentPath = pathCode;
      this.updatePlayerTexture();
    }));

    this.gameEventUnsubs.push(GameEventBus.on('ENEMY_DEFEATED', (enemyId: string) => {
      this.defeatEnemy(enemyId);
    }));

    this.gameEventUnsubs.push(GameEventBus.on('BOSS_DEFEATED', () => {
      this.celebrateBossDefeat();
    }));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.gameEventUnsubs.splice(0).forEach(unsubscribe => unsubscribe());
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > 95) {
        this.targetPointerPosition = { x: pointer.worldX, y: pointer.worldY };
      }
    });

    this.updateCameraBounds();
    this.showZoneBanner(this.getStageTitle(this.currentStage));
  }

  private getStageTitle(stage: number): string {
    switch (stage) {
      case 1:
        return 'Tahap 1: Desa Riset Lapangan & Pertanian';
      case 2:
        return 'Tahap 2: Kota Bengkel & Prototipe Inovasi';
      case 3:
        return 'Tahap 3: Hutan Suaka & Koridor Validasi';
      case 4:
        return 'Tahap 4: Kawasan Sidang Dewan Finalis Jakarta';
      default:
        return `Tahap ${stage}`;
    }
  }

  private getStageSpawnPosition(stage: number): { x: number; y: number } {
    switch (stage) {
      case 1:
        return { x: 512, y: 750 };
      case 2:
        return { x: 512, y: 800 };
      case 3:
        return { x: 512, y: 820 };
      case 4:
        return { x: 512, y: 820 };
      default:
        return { x: 512, y: 750 };
    }
  }

  private buildWorldMap() {
    // 0. Dark border void
    this.add.rectangle(512, 512, 4000, 4000, 0x090e1a).setDepth(-10);

    // 1. Stage Map Image (Pipoya 32x32 Tileset)
    const stageKey = `map_stage${this.currentStage}`;
    const initialKey = this.textures.exists(stageKey) ? stageKey : 'custom_unified_world';
    this.worldBackground = this.add.image(512, 512, initialKey).setDepth(0);

    // 2. Physics bounds
    this.physics.world.setBounds(40, 40, this.mapWidth - 80, this.mapHeight - 80);
  }

  private switchStage(newStage: number) {
    this.isTransitioningZone = true;
    this.currentStage = newStage;
    this.player.setVelocity(0, 0);
    this.targetPointerPosition = null;

    // Atmospheric camera fade transition
    this.cameras.main.fadeOut(220, 9, 14, 26);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Switch background texture
      const stageKey = `map_stage${this.currentStage}`;
      if (this.worldBackground && this.textures.exists(stageKey)) {
        this.worldBackground.setTexture(stageKey);
      }

      // Reposition player
      const spawn = this.getStageSpawnPosition(this.currentStage);
      this.player.setPosition(spawn.x, spawn.y);
      this.playerLight.setPosition(spawn.x, spawn.y);

      // Respawn entities
      this.spawnStageEntities();

      this.cameras.main.fadeIn(250, 9, 14, 26);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.isTransitioningZone = false;
        this.showZoneBanner(this.getStageTitle(this.currentStage));
      });
    });
  }

  private getTargetZoom(): number {
    const w = this.scale.width;
    if (w < 768) {
      return Math.max(0.75, Math.min(1.0, w / 950));
    }
    return 1.0;
  }

  private updateCameraBounds() {
    const zoom = this.getTargetZoom();
    this.cameras.main.setZoom(zoom);

    const viewW = this.scale.width / zoom;
    const viewH = this.scale.height / zoom;

    const extraX = Math.max(0, (viewW - this.mapWidth) / 2);
    const minX = -extraX;
    const width = Math.max(this.mapWidth, viewW);

    const extraY = Math.max(0, (viewH - this.mapHeight) / 2);
    const minY = -extraY;
    const height = Math.max(this.mapHeight, viewH);

    this.cameras.main.setBounds(minX, minY, width, height);
    this.cameras.main.setBackgroundColor('#090e1a');
  }

  private getRoleConfig(): { textureKey: string; animPrefix: string } {
    switch (this.currentPath) {
      case 'social_impact':
        return { textureKey: 'hero_mage', animPrefix: 'mage' };
      case 'business':
        return { textureKey: 'hero_assassin', animPrefix: 'assassin' };
      case 'professional':
      default:
        return { textureKey: 'hero_knight', animPrefix: 'knight' };
    }
  }

  private createPlayer() {
    const spawn = this.getStageSpawnPosition(this.currentStage);
    const { textureKey, animPrefix } = this.getRoleConfig();
    const useRoleTex = this.textures.exists(textureKey);
    const initialKey = useRoleTex ? textureKey : (this.textures.exists('craftpix_hero') ? 'craftpix_hero' : this.getPlayerTextureKey());

    this.player = this.physics.add.sprite(spawn.x, spawn.y, initialKey);
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.4);

    if (useRoleTex && this.anims.exists(`${animPrefix}_idle`)) {
      this.player.play(`${animPrefix}_idle`);
    } else if (this.anims.exists('hero_idle')) {
      this.player.play('hero_idle');
    }

    (this.player.body as Phaser.Physics.Arcade.Body)?.setSize(22, 22).setOffset(13, 22);

    const auraColor = this.currentPath === 'social_impact' ? 0x059669 : this.currentPath === 'business' ? 0xd97706 : 0x2563eb;
    this.playerLight = this.add.circle(spawn.x, spawn.y, 28, auraColor, 0.22).setDepth(9);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private updatePlayerTexture() {
    if (this.player) {
      const { textureKey, animPrefix } = this.getRoleConfig();
      const auraColor = this.currentPath === 'social_impact' ? 0x059669 : this.currentPath === 'business' ? 0xd97706 : 0x2563eb;
      if (this.playerLight) {
        this.playerLight.setFillStyle(auraColor, 0.22);
      }

      if (this.textures.exists(textureKey)) {
        this.player.setTexture(textureKey);
        if (this.anims.exists(`${animPrefix}_idle`)) {
          this.player.play(`${animPrefix}_idle`, true);
        }
      } else {
        this.player.setTexture(this.getPlayerTextureKey());
      }
    }
  }

  private getPlayerTextureKey(): string {
    switch (this.currentPath) {
      case 'social_impact':
        return 'player_social_impact';
      case 'business':
        return 'player_business';
      case 'professional':
      default:
        return 'player_professional';
    }
  }

  private setupInputs() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      }) as any;
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  private setupZoneBanner() {
    this.zoneBanner = this.add.container(this.scale.width / 2, 70).setDepth(90).setScrollFactor(0);
    this.zoneBanner.setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x090e1a, 0.95);
    bg.lineStyle(2, 0xd97706, 1.0);
    bg.fillRect(-220, -18, 440, 36);
    bg.strokeRect(-220, -18, 440, 36);

    this.zoneBannerText = this.add.text(0, 0, '', {
      fontFamily: '"Pixelify Sans", sans-serif',
      fontSize: '15px',
      color: '#fde047'
    }).setOrigin(0.5);

    this.zoneBanner.add([bg, this.zoneBannerText]);
  }

  private showZoneBanner(title: string) {
    if (!this.zoneBanner || !this.zoneBannerText) return;
    this.zoneBannerText.setText(title);
    this.zoneBanner.setAlpha(0);
    this.zoneBanner.setY(55);

    this.tweens.add({
      targets: this.zoneBanner,
      alpha: 1,
      y: 70,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2400, () => {
          this.tweens.add({
            targets: this.zoneBanner,
            alpha: 0,
            y: 55,
            duration: 350,
            ease: 'Sine.easeIn'
          });
        });
      }
    });
  }

  private spawnStageEntities() {
    // 1. Cleanup old enemies
    this.enemies.forEach(e => {
      if (e.glowTween) e.glowTween.stop();
      if (e.label) e.label.destroy();
      e.destroy();
    });
    this.enemies = [];

    // 2. Cleanup old boss & braziers
    if (this.boss) {
      if (this.boss.glowTween) this.boss.glowTween.stop();
      if (this.boss.label) this.boss.label.destroy();
      this.boss.destroy();
    }

    this.bossTorches.forEach(t => t.destroy());
    this.bossTorches = [];
    this.bossLights.forEach(l => l.destroy());
    this.bossLights = [];

    const quizzes = STAGE_QUIZZES.filter(q => q.stageOrdinal === this.currentStage);

    // 3. Stage-specific enemy coordinates
    const enemyConfigs: Record<number, Array<{ x: number; y: number; key: string; anim: string; fallback: string }>> = {
      1: [
        { x: 460, y: 520, key: 'craftpix_cultist1', anim: 'cultist1_idle', fallback: 'enemy_stage1' }
      ],
      2: [
        { x: 380, y: 560, key: 'craftpix_cultist2', anim: 'cultist2_idle', fallback: 'enemy_stage2_1' },
        { x: 640, y: 560, key: 'craftpix_cultist3', anim: 'cultist3_idle', fallback: 'enemy_stage2_2' }
      ],
      3: [
        { x: 320, y: 600, key: 'craftpix_cultist4', anim: 'cultist4_idle', fallback: 'enemy_stage3_1' },
        { x: 512, y: 520, key: 'craftpix_cultist5', anim: 'cultist5_idle', fallback: 'enemy_stage3_2' },
        { x: 700, y: 600, key: 'craftpix_cultist6', anim: 'cultist6_idle', fallback: 'enemy_stage3_3' }
      ],
      4: [] // Stage 4 focuses on final presentation to the judges
    };

    const currentConfigs = enemyConfigs[this.currentStage] || [];

    currentConfigs.forEach((cfg, idx) => {
      const quiz = quizzes[idx] || quizzes[0];
      if (!quiz) return;

      const isAlreadyDefeated = this.defeatedEnemyIds.has(quiz.id);
      const hasCraftpix = this.textures.exists(cfg.key);
      const texKey = hasCraftpix ? cfg.key : cfg.fallback;

      const enemy = this.physics.add.sprite(cfg.x, cfg.y, texKey) as EnemySprite;
      enemy.setDepth(10);
      enemy.quizData = quiz;
      enemy.isDefeated = isAlreadyDefeated;
      enemy.setImmovable(true);

      if (hasCraftpix) {
        enemy.setScale(2.0);
        if (this.anims.exists(cfg.anim)) {
          enemy.play(cfg.anim);
        }
        (enemy.body as Phaser.Physics.Arcade.Body)?.setSize(22, 22).setOffset(5, 10);
      } else {
        (enemy.body as Phaser.Physics.Arcade.Body)?.setSize(34, 34).setOffset(7, 7);
      }

      this.physics.add.collider(this.player, enemy);

      if (isAlreadyDefeated) {
        enemy.setAlpha(0.35);
      } else {
        enemy.glowTween = this.tweens.add({
          targets: enemy,
          y: cfg.y - 6,
          duration: 1100 + idx * 200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      enemy.label = this.add.text(cfg.x, cfg.y - 34, quiz.enemyName, {
        fontFamily: '"Pixelify Sans", sans-serif',
        fontSize: '12px',
        color: isAlreadyDefeated ? '#64748b' : '#fde047',
        backgroundColor: '#090e1a',
        padding: { x: 8, y: 3 }
      }).setOrigin(0.5).setDepth(11);

      this.enemies.push(enemy);
    });

    // 4. Boss coordinates per stage
    const bossPositions: Record<number, { x: number; y: number }> = {
      1: { x: 512, y: 280 },
      2: { x: 512, y: 260 },
      3: { x: 512, y: 260 },
      4: { x: 512, y: 300 }
    };

    const bossPos = bossPositions[this.currentStage] || { x: 512, y: 280 };
    const bossMission = STAGE_BOSS_MISSIONS[this.currentStage] || STAGE_BOSS_MISSIONS[1];
    const hasLeader = this.textures.exists('craftpix_boss_leader');
    const bossTexture = hasLeader ? 'craftpix_boss_leader' : `boss_stage${this.currentStage}`;

    this.boss = this.physics.add.sprite(bossPos.x, bossPos.y, bossTexture) as BossSprite;
    this.boss.setDepth(10);
    this.boss.bossData = bossMission;
    this.boss.setImmovable(true);

    if (hasLeader) {
      this.boss.setScale(2.4);
      if (this.anims.exists('boss_leader_idle')) {
        this.boss.play('boss_leader_idle');
      }
      (this.boss.body as Phaser.Physics.Arcade.Body)?.setSize(24, 24).setOffset(4, 7);
    } else {
      (this.boss.body as Phaser.Physics.Arcade.Body)?.setSize(56, 56).setOffset(12, 12);
    }

    this.physics.add.collider(this.player, this.boss, () => this.handleBossAttempt());

    this.boss.glowTween = this.tweens.add({
      targets: this.boss,
      scale: hasLeader ? 2.55 : 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.boss.label = this.add.text(bossPos.x, bossPos.y - 45, `${bossMission.bossName}`, {
      fontFamily: '"Pixelify Sans", sans-serif',
      fontSize: '13px',
      color: '#f59e0b',
      backgroundColor: '#090e1a',
      padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(11);

    // 5. Flanking Torch Braziers around Boss
    const brazierOffsets = [-64, 64];
    brazierOffsets.forEach(offsetX => {
      const bx = bossPos.x + offsetX;
      const by = bossPos.y + 10;
      if (this.anims.exists('craftpix_fire_burn')) {
        const torch = this.add.sprite(bx, by - 12, 'craftpix_fire').setScale(1.5).setDepth(5);
        torch.play('craftpix_fire_burn');
        this.bossTorches.push(torch);
      }
      const warmLight = this.add.circle(bx, by - 8, 32, 0xf59e0b, 0.2).setDepth(3);
      this.tweens.add({
        targets: warmLight,
        scale: 1.2,
        alpha: 0.28,
        duration: 450 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.bossLights.push(warmLight);
    });
  }

  private handleBossAttempt() {
    if (this.isBossRejecting) return;

    const quizzes = STAGE_QUIZZES.filter(q => q.stageOrdinal === this.currentStage);
    const unDefeated = quizzes.filter(q => !this.defeatedEnemyIds.has(q.id));

    // If case-study quizzes are remaining, notify player
    if (unDefeated.length > 0) {
      this.isBossRejecting = true;

      this.cameras.main.flash(350, 220, 38, 38);
      this.cameras.main.shake(250, 0.015);

      if (this.anims.exists('boss_leader_summon')) {
        this.boss.play('boss_leader_summon');
      }

      // Knockback player away downwards
      this.player.y += 75;
      this.player.setVelocity(0, 0);
      this.targetPointerPosition = null;

      // Show clear informative prompt
      this.promptText.setText(`Selesaikan kuis studi kasus terlebih dahulu (${unDefeated.length} kuis tersisa).`);
      this.promptText.setColor('#ef4444');
      this.promptText.setVisible(true);

      // Boss bounce animation
      this.tweens.add({
        targets: this.boss,
        scale: this.textures.exists('craftpix_boss_leader') ? 2.8 : 1.2,
        duration: 180,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          setTimeout(() => {
            this.isBossRejecting = false;
            this.promptText.setColor('#fde047');
            if (this.boss && this.anims.exists('boss_leader_idle')) {
              this.boss.play('boss_leader_idle');
            }
          }, 1500);
        }
      });
    } else {
      GameEventBus.emit('TRIGGER_BOSS_MISSION', this.boss.bossData);
    }
  }

  private defeatEnemy(enemyId: string) {
    this.defeatedEnemyIds.add(enemyId);
    const targetEnemy = this.enemies.find(e => e.quizData?.id === enemyId);
    if (targetEnemy) {
      targetEnemy.isDefeated = true;
      if (targetEnemy.glowTween) targetEnemy.glowTween.stop();
      targetEnemy.setAlpha(0.35);
      if (targetEnemy.label) {
        targetEnemy.label.setText(`${targetEnemy.quizData?.enemyName} (Selesai)`);
        targetEnemy.label.setColor('#94a3b8');
      }
      this.createSparkleBurst(targetEnemy.x, targetEnemy.y, 0x10b981);
    }
  }

  private celebrateBossDefeat() {
    if (this.boss) {
      if (this.anims.exists('boss_leader_summon')) {
        this.boss.play('boss_leader_summon');
      }
      this.createSparkleBurst(this.boss.x, this.boss.y, 0xf59e0b);
      if (this.boss.label) {
        this.boss.label.setText(`${this.boss.bossData?.bossName} (Tugas Terkirim)`);
        this.boss.label.setColor('#059669');
      }
    }
  }

  private createSparkleBurst(x: number, y: number, color: number) {
    for (let i = 0; i < 16; i++) {
      const p = this.add.circle(x, y, 4, color).setDepth(20);
      const angle = (i / 16) * Math.PI * 2;
      const dist = Phaser.Math.Between(20, 50);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 550,
        onComplete: () => p.destroy()
      });
    }
  }

  update() {
    if (!this.player || this.isTransitioningZone) return;

    const speed = 200;
    let vx = 0;
    let vy = 0;

    const left = Boolean(this.cursors?.left.isDown || this.wasdKeys?.A.isDown);
    const right = Boolean(this.cursors?.right.isDown || this.wasdKeys?.D.isDown);
    const up = Boolean(this.cursors?.up.isDown || this.wasdKeys?.W.isDown);
    const down = Boolean(this.cursors?.down.isDown || this.wasdKeys?.S.isDown);

    if (left || right || up || down) {
      this.targetPointerPosition = null;
    }

    if (left) {
      vx -= speed;
      this.player.setFlipX(true);
    }
    if (right) {
      vx += speed;
      this.player.setFlipX(false);
    }
    if (up) vy -= speed;
    if (down) vy += speed;

    if (this.targetPointerPosition && vx === 0 && vy === 0) {
      const dx = this.targetPointerPosition.x - this.player.x;
      const dy = this.targetPointerPosition.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 12) {
        vx = (dx / dist) * speed;
        vy = (dy / dist) * speed;
        if (dx < 0) this.player.setFlipX(true);
        if (dx > 0) this.player.setFlipX(false);
      } else {
        this.targetPointerPosition = null;
      }
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);
    this.playerLight.setPosition(this.player.x, this.player.y);

    // Dynamic Role Movement Animation
    const isMoving = vx !== 0 || vy !== 0;
    const { animPrefix } = this.getRoleConfig();

    if (isMoving) {
      const walkAnim = `${animPrefix}_walk`;
      if (this.anims.exists(walkAnim) && this.player.anims.currentAnim?.key !== walkAnim) {
        this.player.play(walkAnim, true);
      }
    } else {
      const idleAnim = `${animPrefix}_idle`;
      if (this.anims.exists(idleAnim) && this.player.anims.currentAnim?.key !== idleAnim) {
        this.player.play(idleAnim, true);
      }
    }

    this.checkInteractions();
  }

  private checkInteractions() {
    let activePrompt = '';
    const interactRadius = 70;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);

      if (dist < interactRadius) {
        if (enemy.isDefeated) {
          activePrompt = `${enemy.quizData?.enemyName} (Selesai)`;
        } else {
          activePrompt = `Tekan SPASI atau Dekati untuk jawab kuis: ${enemy.quizData?.enemyName}`;
          if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            GameEventBus.emit('TRIGGER_QUIZ', enemy.quizData);
          }
        }
        break;
      }
    }

    if (!activePrompt && this.boss && this.boss.active) {
      const bossDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
      if (bossDist < 95) {
        activePrompt = `Tekan SPASI untuk membuka tugas besar: ${this.boss.bossData?.bossName}`;
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.handleBossAttempt();
        }
      }
    }

    if (!this.isBossRejecting) {
      this.promptText.setText(activePrompt);
      this.promptText.setVisible(Boolean(activePrompt));
    }
  }
}
