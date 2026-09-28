import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createDungeonStoneTextures();
    this.createDungeonProps();
    this.createCharacterTextures();
    this.createDungeonMonsters();
    this.createDungeonBosses();

    // Load 4 distinct Pipoya RPG World Maps for each Stage
    this.load.image('map_stage1', '/assets/dungeon/map_stage1.png');
    this.load.image('map_stage2', '/assets/dungeon/map_stage2.png');
    this.load.image('map_stage3', '/assets/dungeon/map_stage3.png');
    this.load.image('map_stage4', '/assets/dungeon/map_stage4.png');
    this.load.image('custom_unified_world', '/assets/dungeon/map_stage1.png');
    this.load.image('custom_battle_bg', '/assets/dungeon/custom_battle_bg.png');
    this.load.image('temple_unified_world', '/assets/dungeon/map_stage1.png');
    this.load.image('craftpix_walls_floor', '/assets/dungeon/Walls_floor.png');
    this.load.image('craftpix_objects', '/assets/dungeon/Objects_interior.png');
    this.load.image('craftpix_cracks', '/assets/dungeon/Decorative_cracks_interior.png');
    this.load.spritesheet('craftpix_fire', '/assets/dungeon/Fire_animation.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('craftpix_chest', '/assets/dungeon/Chest.png', { frameWidth: 16, frameHeight: 16 });

    // Characters & Bosses
    this.load.spritesheet('hero_knight', '/assets/dungeon/hero_knight_spritesheet.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('hero_mage', '/assets/dungeon/hero_mage_spritesheet.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('hero_assassin', '/assets/dungeon/hero_assassin_spritesheet.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('craftpix_hero', '/assets/dungeon/Discoverer1_idle.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('craftpix_cultist1', '/assets/dungeon/Cultist1_Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('craftpix_cultist2', '/assets/dungeon/Cultist2_Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('craftpix_cultist3', '/assets/dungeon/Cultist3_Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('craftpix_cultist4', '/assets/dungeon/Cultist4_Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('craftpix_cultist5', '/assets/dungeon/Cultist5_Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('craftpix_cultist6', '/assets/dungeon/Cultist6_Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('craftpix_boss_leader', '/assets/dungeon/Leader_Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('craftpix_boss_summon', '/assets/dungeon/Leader_summon.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    this.createCompositeCraftpixTextures();
    this.createCraftpixAnimations();
    this.scene.start('WorldScene');
  }

  private createCompositeCraftpixTextures() {
    try {
      // 1. Craftpix Floor (64x64) from Walls_floor.png
      if (this.textures.exists('craftpix_walls_floor')) {
        const wallsImg = this.textures.get('craftpix_walls_floor').getSourceImage() as HTMLImageElement;
        const floorTex = this.textures.createCanvas('craftpix_tile_floor', 64, 64);
        if (floorTex && wallsImg) {
          const ctx = floorTex.getContext();
          ctx.imageSmoothingEnabled = false;
          // Sample limestone flagstones (tiles at 96, 208 and 112, 224)
          ctx.drawImage(wallsImg, 96, 208, 16, 16, 0, 0, 32, 32);
          ctx.drawImage(wallsImg, 112, 208, 16, 16, 32, 0, 32, 32);
          ctx.drawImage(wallsImg, 112, 224, 16, 16, 0, 32, 32, 32);
          ctx.drawImage(wallsImg, 96, 224, 16, 16, 32, 32, 32, 32);
          floorTex.refresh();
        }

        // 2. Craftpix Wall (64x64) from Walls_floor.png
        const wallTex = this.textures.createCanvas('craftpix_tile_wall', 64, 64);
        if (wallTex && wallsImg) {
          const ctx = wallTex.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(wallsImg, 16, 16, 16, 16, 0, 0, 32, 32);
          ctx.drawImage(wallsImg, 32, 16, 16, 16, 32, 0, 32, 32);
          ctx.drawImage(wallsImg, 16, 32, 16, 16, 0, 32, 32, 32);
          ctx.drawImage(wallsImg, 32, 32, 16, 16, 32, 32, 32, 32);
          wallTex.refresh();
        }

        // 3. Craftpix Path (64x64) Runic boulevard tile
        const pathTex = this.textures.createCanvas('craftpix_tile_path', 64, 64);
        if (pathTex && wallsImg) {
          const ctx = pathTex.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(wallsImg, 0, 160, 16, 16, 0, 0, 32, 32);
          ctx.drawImage(wallsImg, 16, 160, 16, 16, 32, 0, 32, 32);
          ctx.drawImage(wallsImg, 0, 176, 16, 16, 0, 32, 32, 32);
          ctx.drawImage(wallsImg, 16, 176, 16, 16, 32, 32, 32, 32);
          pathTex.refresh();
        }
      }

      // 4. Objects from Objects_interior.png
      if (this.textures.exists('craftpix_objects')) {
        const objImg = this.textures.get('craftpix_objects').getSourceImage() as HTMLImageElement;
        
        // Pillar (32x64)
        const pillarTex = this.textures.createCanvas('craftpix_pillar_tex', 32, 64);
        if (pillarTex && objImg) {
          const ctx = pillarTex.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(objImg, 64, 96, 32, 64, 0, 0, 32, 64);
          pillarTex.refresh();
        }

        // Altar (48x48)
        const altarTex = this.textures.createCanvas('craftpix_altar_tex', 48, 48);
        if (altarTex && objImg) {
          const ctx = altarTex.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(objImg, 128, 0, 48, 48, 0, 0, 48, 48);
          altarTex.refresh();
        }

        // Guardian Statue (32x48)
        const statueTex = this.textures.createCanvas('craftpix_statue_tex', 32, 48);
        if (statueTex && objImg) {
          const ctx = statueTex.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(objImg, 304, 96, 32, 48, 0, 0, 32, 48);
          statueTex.refresh();
        }

        // Brazier Pedestal (32x32)
        const brazierTex = this.textures.createCanvas('craftpix_brazier_tex', 32, 32);
        if (brazierTex && objImg) {
          const ctx = brazierTex.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(objImg, 128, 192, 32, 32, 0, 0, 32, 32);
          brazierTex.refresh();
        }
      }

      // 5. Chest from Chest.png
      if (this.textures.exists('craftpix_chest')) {
        const chestImg = this.textures.get('craftpix_chest').getSourceImage() as HTMLImageElement;
        const chestTex = this.textures.createCanvas('craftpix_chest_tex', 32, 32);
        if (chestTex && chestImg) {
          const ctx = chestTex.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(chestImg, 0, 0, 32, 32, 0, 0, 32, 32);
          chestTex.refresh();
        }
      }
    } catch (e) {
      console.warn('Craftpix texture compilation notice (fallback active):', e);
    }
  }

  private createCraftpixAnimations() {
    try {
      // 1. Torches / Fire Animation (frames: 0, 40, 80, 120, 160, 200)
      if (this.textures.exists('craftpix_fire') && !this.anims.exists('craftpix_fire_burn')) {
        this.anims.create({
          key: 'craftpix_fire_burn',
          frames: [
            { key: 'craftpix_fire', frame: 0 },
            { key: 'craftpix_fire', frame: 40 },
            { key: 'craftpix_fire', frame: 80 },
            { key: 'craftpix_fire', frame: 120 },
            { key: 'craftpix_fire', frame: 160 },
            { key: 'craftpix_fire', frame: 200 }
          ],
          frameRate: 7,
          repeat: -1
        });
      }

      // 2. Cultist Animations (12 frames each, row 0 facing front/down)
      for (let i = 1; i <= 6; i++) {
        const key = `craftpix_cultist${i}`;
        const animKey = `cultist${i}_idle`;
        if (this.textures.exists(key) && !this.anims.exists(animKey)) {
          this.anims.create({
            key: animKey,
            frames: this.anims.generateFrameNumbers(key, { start: 0, end: 11 }),
            frameRate: 6,
            repeat: -1
          });
        }
      }

      // 3. Boss Leader Idle (12 frames) & Summon (5 frames)
      if (this.textures.exists('craftpix_boss_leader') && !this.anims.exists('boss_leader_idle')) {
        this.anims.create({
          key: 'boss_leader_idle',
          frames: this.anims.generateFrameNumbers('craftpix_boss_leader', { start: 0, end: 11 }),
          frameRate: 6,
          repeat: -1
        });
      }

      if (this.textures.exists('craftpix_boss_summon') && !this.anims.exists('boss_leader_summon')) {
        this.anims.create({
          key: 'boss_leader_summon',
          frames: this.anims.generateFrameNumbers('craftpix_boss_summon', { start: 0, end: 4 }),
          frameRate: 5,
          repeat: -1
        });
      }

      // 4. Player Hero Animations for each Class / Role
      // Knight (Professional)
      if (this.textures.exists('hero_knight')) {
        if (!this.anims.exists('knight_idle')) {
          this.anims.create({
            key: 'knight_idle',
            frames: this.anims.generateFrameNumbers('hero_knight', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
          });
        }
        if (!this.anims.exists('knight_walk')) {
          this.anims.create({
            key: 'knight_walk',
            frames: this.anims.generateFrameNumbers('hero_knight', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
          });
        }
        if (!this.anims.exists('knight_attack')) {
          this.anims.create({
            key: 'knight_attack',
            frames: this.anims.generateFrameNumbers('hero_knight', { start: 8, end: 11 }),
            frameRate: 9,
            repeat: 0
          });
        }
      }

      // Mage (Social Impact)
      if (this.textures.exists('hero_mage')) {
        if (!this.anims.exists('mage_idle')) {
          this.anims.create({
            key: 'mage_idle',
            frames: this.anims.generateFrameNumbers('hero_mage', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
          });
        }
        if (!this.anims.exists('mage_walk')) {
          this.anims.create({
            key: 'mage_walk',
            frames: this.anims.generateFrameNumbers('hero_mage', { start: 4, end: 7 }),
            frameRate: 7,
            repeat: -1
          });
        }
        if (!this.anims.exists('mage_attack')) {
          this.anims.create({
            key: 'mage_attack',
            frames: this.anims.generateFrameNumbers('hero_mage', { start: 8, end: 11 }),
            frameRate: 9,
            repeat: 0
          });
        }
      }

      // Assassin (Business)
      if (this.textures.exists('hero_assassin')) {
        if (!this.anims.exists('assassin_idle')) {
          this.anims.create({
            key: 'assassin_idle',
            frames: this.anims.generateFrameNumbers('hero_assassin', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
          });
        }
        if (!this.anims.exists('assassin_walk')) {
          this.anims.create({
            key: 'assassin_walk',
            frames: this.anims.generateFrameNumbers('hero_assassin', { start: 4, end: 7 }),
            frameRate: 9,
            repeat: -1
          });
        }
        if (!this.anims.exists('assassin_attack')) {
          this.anims.create({
            key: 'assassin_attack',
            frames: this.anims.generateFrameNumbers('hero_assassin', { start: 8, end: 11 }),
            frameRate: 11,
            repeat: 0
          });
        }
      }

      // Fallback Hero Idle
      if (this.textures.exists('craftpix_hero') && !this.anims.exists('hero_idle')) {
        this.anims.create({
          key: 'hero_idle',
          frames: this.anims.generateFrameNumbers('craftpix_hero', { start: 0, end: 3 }),
          frameRate: 4,
          repeat: -1
        });
      }
    } catch (e) {
      console.warn('Craftpix animation creation notice:', e);
    }
  }

  private createDungeonStoneTextures() {
    // 1. Regular Dungeon Stone Floor (64x64) - Bright Stone Slabs
    const floorGfx = this.make.graphics({ x: 0, y: 0 });
    // Base slab color: warm light limestone
    floorGfx.fillStyle(0xe2e8f0, 1);
    floorGfx.fillRect(0, 0, 64, 64);

    // Stone flagstone variations (4 tiles in 1)
    floorGfx.fillStyle(0xedf2f7, 1);
    floorGfx.fillRect(2, 2, 29, 29);
    floorGfx.fillRect(33, 33, 29, 29);

    floorGfx.fillStyle(0xdbe3ed, 1);
    floorGfx.fillRect(33, 2, 29, 29);
    floorGfx.fillRect(2, 33, 29, 29);

    // Mortar / Grout lines
    floorGfx.lineStyle(2, 0x94a3b8, 0.7);
    floorGfx.strokeRect(0, 0, 64, 64);
    floorGfx.lineBetween(0, 32, 64, 32);
    floorGfx.lineBetween(32, 0, 32, 64);

    // Subtle stone texture flecks
    floorGfx.fillStyle(0x718096, 0.25);
    floorGfx.fillCircle(12, 14, 2);
    floorGfx.fillCircle(45, 20, 2);
    floorGfx.fillCircle(22, 50, 2);
    floorGfx.fillCircle(52, 48, 2);

    floorGfx.generateTexture('tile_stone_floor', 64, 64);
    floorGfx.destroy();

    // 2. Central Paved Pathway (64x64) - Polished Runic Pathway
    const pathGfx = this.make.graphics({ x: 0, y: 0 });
    pathGfx.fillStyle(0xf8fafc, 1);
    pathGfx.fillRect(0, 0, 64, 64);

    // Beveled stone inner border
    pathGfx.lineStyle(2, 0xd97706, 0.7);
    pathGfx.strokeRect(4, 4, 56, 56);

    pathGfx.fillStyle(0xf1f5f9, 1);
    pathGfx.fillRect(8, 8, 48, 48);

    // Ancient runic diamond motif in the center
    pathGfx.lineStyle(1.5, 0xb45309, 0.8);
    pathGfx.strokeCircle(32, 32, 14);
    pathGfx.strokeRect(26, 26, 12, 12);

    pathGfx.generateTexture('tile_stone_path', 64, 64);
    pathGfx.destroy();

    // 3. Dungeon Stone Wall Block (64x64) - Heavy Masonry Wall
    const wallGfx = this.make.graphics({ x: 0, y: 0 });
    wallGfx.fillStyle(0x475569, 1);
    wallGfx.fillRect(0, 0, 64, 64);

    // Top highlight bevel (light hitting from top)
    wallGfx.fillStyle(0x64748b, 1);
    wallGfx.fillRect(2, 2, 60, 10);

    // Brick rows
    wallGfx.lineStyle(2, 0x1e293b, 0.9);
    wallGfx.lineBetween(0, 22, 64, 22);
    wallGfx.lineBetween(0, 44, 64, 44);
    wallGfx.lineBetween(32, 0, 32, 22);
    wallGfx.lineBetween(16, 22, 16, 44);
    wallGfx.lineBetween(48, 22, 48, 44);
    wallGfx.lineBetween(32, 44, 32, 64);

    wallGfx.generateTexture('tile_dungeon_wall', 64, 64);
    wallGfx.destroy();
  }

  private createDungeonProps() {
    // 1. Ancient Stone Pillar (48x72)
    const pillarGfx = this.make.graphics({ x: 0, y: 0 });
    // Shadow
    pillarGfx.fillStyle(0x000000, 0.25);
    pillarGfx.fillEllipse(24, 66, 36, 12);
    // Base plinth
    pillarGfx.fillStyle(0x64748b, 1);
    pillarGfx.fillRect(6, 52, 36, 14);
    // Capital (top)
    pillarGfx.fillStyle(0x94a3b8, 1);
    pillarGfx.fillRect(6, 6, 36, 12);
    // Column shaft
    pillarGfx.fillStyle(0xcbd5e1, 1);
    pillarGfx.fillRect(10, 18, 28, 36);
    // Column fluting grooves
    pillarGfx.lineStyle(2, 0x94a3b8, 0.8);
    pillarGfx.lineBetween(16, 18, 16, 54);
    pillarGfx.lineBetween(24, 18, 24, 54);
    pillarGfx.lineBetween(32, 18, 32, 54);

    pillarGfx.generateTexture('dungeon_pillar', 48, 72);
    pillarGfx.destroy();

    // 2. Torch Brazier on Pedestal (36x48)
    const torchGfx = this.make.graphics({ x: 0, y: 0 });
    // Base stone
    torchGfx.fillStyle(0x64748b, 1);
    torchGfx.fillRect(10, 34, 16, 12);
    // Iron pole & bowl
    torchGfx.fillStyle(0x334155, 1);
    torchGfx.fillRect(15, 18, 6, 18);
    torchGfx.fillRoundedRect(6, 14, 24, 8, 3);
    // Fiery Flame (Outer orange, inner bright yellow)
    torchGfx.fillStyle(0xea580c, 0.9);
    torchGfx.fillTriangle(18, 2, 8, 16, 28, 16);
    torchGfx.fillStyle(0xfde047, 1);
    torchGfx.fillTriangle(18, 6, 12, 15, 24, 15);

    torchGfx.generateTexture('torch_brazier', 36, 48);
    torchGfx.destroy();

    // 3. Grand Stone Boss Dais / Altar (100x100)
    const daisGfx = this.make.graphics({ x: 0, y: 0 });
    // Outer stone ring
    daisGfx.fillStyle(0x94a3b8, 0.5);
    daisGfx.fillCircle(50, 50, 48);
    daisGfx.fillStyle(0xf1f5f9, 1);
    daisGfx.fillCircle(50, 50, 44);
    // Golden rune inscribed ring
    daisGfx.lineStyle(3, 0xd97706, 0.9);
    daisGfx.strokeCircle(50, 50, 38);
    // Inner octagram glyph
    daisGfx.lineStyle(2, 0xb45309, 0.8);
    daisGfx.strokeRect(32, 32, 36, 36);
    daisGfx.strokeCircle(50, 50, 18);
    // Glowing center rune
    daisGfx.fillStyle(0xf59e0b, 0.9);
    daisGfx.fillCircle(50, 50, 10);

    daisGfx.generateTexture('boss_dais', 100, 100);
    daisGfx.destroy();
  }

  private createCharacterTextures() {
    // 1. Professional Track: Silver-Armored Knight of Strategy
    const profGfx = this.make.graphics({ x: 0, y: 0 });
    // Shadow
    profGfx.fillStyle(0x000000, 0.25);
    profGfx.fillEllipse(24, 46, 28, 10);
    // Royal Blue Cape
    profGfx.fillStyle(0x1e3a8a, 1);
    profGfx.fillRoundedRect(10, 18, 28, 24, 6);
    // Silver Plate Armor Torso
    profGfx.fillStyle(0xe2e8f0, 1);
    profGfx.fillRoundedRect(14, 16, 20, 22, 4);
    // Golden Lion Heraldic Chest Crest
    profGfx.fillStyle(0xf59e0b, 1);
    profGfx.fillCircle(24, 25, 4);
    // Steel Pauldrons (Shoulders)
    profGfx.fillStyle(0x94a3b8, 1);
    profGfx.fillCircle(12, 18, 5);
    profGfx.fillCircle(36, 18, 5);
    // Head / Face
    profGfx.fillStyle(0xfde68a, 1);
    profGfx.fillCircle(24, 11, 8);
    // Knight Silver Helmet with Blue Plume
    profGfx.fillStyle(0x64748b, 1);
    profGfx.fillRect(16, 5, 16, 7);
    profGfx.fillStyle(0x2563eb, 1);
    profGfx.fillCircle(24, 4, 3);
    // Steel Longsword at side
    profGfx.fillStyle(0x94a3b8, 1);
    profGfx.fillRect(36, 20, 3, 20);
    profGfx.fillStyle(0xd97706, 1);
    profGfx.fillRect(34, 24, 7, 2);

    profGfx.generateTexture('player_professional', 48, 48);
    profGfx.destroy();

    // 2. Social Impact Track: Emerald Mystic / Ranger of Community
    const socGfx = this.make.graphics({ x: 0, y: 0 });
    socGfx.fillStyle(0x000000, 0.25);
    socGfx.fillEllipse(24, 46, 28, 10);
    // Emerald Traveling Cloak
    socGfx.fillStyle(0x059669, 1);
    socGfx.fillRoundedRect(10, 16, 28, 26, 8);
    // Cream Inner Tunic
    socGfx.fillStyle(0xfef3c7, 1);
    socGfx.fillRect(18, 18, 12, 20);
    // Nature Talisman Crest
    socGfx.fillStyle(0x10b981, 1);
    socGfx.fillCircle(24, 26, 4);
    // Head
    socGfx.fillStyle(0xfde68a, 1);
    socGfx.fillCircle(24, 11, 8);
    // Brown Traveler Hair & Headband
    socGfx.fillStyle(0x78350f, 1);
    socGfx.fillCircle(24, 8, 8);
    socGfx.fillStyle(0x047857, 1);
    socGfx.fillRect(16, 9, 16, 3);
    // Oak Staff with Glowing Green Orb
    socGfx.fillStyle(0x92400e, 1);
    socGfx.fillRect(36, 12, 3, 28);
    socGfx.fillStyle(0x34d399, 1);
    socGfx.fillCircle(37, 10, 5);

    socGfx.generateTexture('player_social_impact', 48, 48);
    socGfx.destroy();

    // 3. Business Track: Agile Guildmaster / Entrepreneur Scout
    const bizGfx = this.make.graphics({ x: 0, y: 0 });
    bizGfx.fillStyle(0x000000, 0.25);
    bizGfx.fillEllipse(24, 46, 28, 10);
    // Rich Crimson & Gold Doublet Coat
    bizGfx.fillStyle(0x991b1b, 1);
    bizGfx.fillRoundedRect(12, 16, 24, 24, 6);
    // Gold embroidery trims
    bizGfx.lineStyle(2, 0xf59e0b, 1);
    bizGfx.strokeRect(15, 18, 18, 20);
    // Leather belt with gold coin pouch
    bizGfx.fillStyle(0x451a03, 1);
    bizGfx.fillRect(14, 28, 20, 4);
    bizGfx.fillStyle(0xfbbf24, 1);
    bizGfx.fillCircle(30, 31, 3);
    // Head
    bizGfx.fillStyle(0xfde047, 1);
    bizGfx.fillCircle(24, 11, 8);
    // Feathered Scout Beret
    bizGfx.fillStyle(0x7f1d1d, 1);
    bizGfx.fillRoundedRect(14, 5, 20, 6, 2);
    bizGfx.fillStyle(0xfef08a, 1);
    bizGfx.fillTriangle(30, 6, 34, 1, 31, 8);

    bizGfx.generateTexture('player_business', 48, 48);
    bizGfx.destroy();
  }

  private createDungeonMonsters() {
    // 1. Stage 1 Enemy: "Challenger Asumsi" - Granite Stone Golem
    const e1 = this.make.graphics({ x: 0, y: 0 });
    e1.fillStyle(0x000000, 0.25);
    e1.fillEllipse(24, 44, 26, 8);
    // Carved stone torso
    e1.fillStyle(0x64748b, 1);
    e1.fillRoundedRect(12, 14, 24, 24, 6);
    // Stone shoulder boulders
    e1.fillStyle(0x475569, 1);
    e1.fillCircle(10, 18, 8);
    e1.fillCircle(38, 18, 8);
    // Molten magma cracks & glowing orange eyes
    e1.lineStyle(2, 0xea580c, 1);
    e1.lineBetween(16, 20, 24, 28);
    e1.lineBetween(24, 28, 32, 22);
    e1.fillStyle(0xfbbf24, 1);
    e1.fillCircle(18, 16, 3);
    e1.fillCircle(30, 16, 3);

    e1.generateTexture('enemy_stage1', 48, 48);
    e1.destroy();

    // 2. Stage 2 Enemy 1: "Ideation Sentry" - Spectral Phantom Armor
    const e2_1 = this.make.graphics({ x: 0, y: 0 });
    e2_1.fillStyle(0x000000, 0.2);
    e2_1.fillEllipse(24, 44, 24, 8);
    // Ethereal Indigo Mist
    e2_1.fillStyle(0x6366f1, 0.3);
    e2_1.fillCircle(24, 24, 20);
    // Floating Knight Plate
    e2_1.fillStyle(0x4f46e5, 1);
    e2_1.fillRoundedRect(14, 14, 20, 20, 4);
    // Spectral Blue Eye Slits
    e2_1.fillStyle(0xa5f3fc, 1);
    e2_1.fillRect(18, 12, 4, 3);
    e2_1.fillRect(26, 12, 4, 3);
    // Floating Longblade
    e2_1.lineStyle(2, 0x818cf8, 1);
    e2_1.lineBetween(36, 8, 36, 36);

    e2_1.generateTexture('enemy_stage2_1', 48, 48);
    e2_1.destroy();

    // 3. Stage 2 Enemy 2: "Prototype Tester" - Clockwork Iron Watcher
    const e2_2 = this.make.graphics({ x: 0, y: 0 });
    e2_2.fillStyle(0x000000, 0.2);
    e2_2.fillEllipse(24, 44, 24, 8);
    // Brass casing
    e2_2.fillStyle(0xb45309, 1);
    e2_2.fillRoundedRect(12, 12, 24, 24, 8);
    // Rotating gear teeth
    e2_2.lineStyle(3, 0xf59e0b, 1);
    e2_2.strokeRect(8, 8, 32, 32);
    // Glowing central ocular lens
    e2_2.fillStyle(0x38bdf8, 1);
    e2_2.fillCircle(24, 24, 7);

    e2_2.generateTexture('enemy_stage2_2', 48, 48);
    e2_2.destroy();

    // 4. Stage 3 Enemy 1: "Market Evaluator" - Crystal Cave Drake
    const e3_1 = this.make.graphics({ x: 0, y: 0 });
    e3_1.fillStyle(0x0284c7, 0.3);
    e3_1.fillCircle(24, 24, 20);
    e3_1.fillStyle(0x0369a1, 1);
    e3_1.fillRoundedRect(12, 14, 24, 22, 6);
    // Crystalline spikes
    e3_1.fillStyle(0x38bdf8, 1);
    e3_1.fillTriangle(24, 4, 18, 14, 30, 14);
    e3_1.fillTriangle(14, 8, 10, 18, 18, 18);
    e3_1.fillTriangle(34, 8, 30, 18, 38, 18);
    e3_1.generateTexture('enemy_stage3_1', 48, 48);
    e3_1.destroy();

    // 5. Stage 3 Enemy 2: "Risk Sentinel" - Crypt Warden
    const e3_2 = this.make.graphics({ x: 0, y: 0 });
    e3_2.fillStyle(0xd97706, 0.25);
    e3_2.fillCircle(24, 24, 20);
    e3_2.fillStyle(0x78350f, 1);
    e3_2.fillRoundedRect(14, 12, 20, 26, 4);
    e3_2.fillStyle(0xf59e0b, 1);
    e3_2.fillRect(10, 16, 8, 18); // Tower shield
    e3_2.lineStyle(2, 0xfef08a, 1);
    e3_2.strokeRect(10, 16, 8, 18);
    e3_2.generateTexture('enemy_stage3_2', 48, 48);
    e3_2.destroy();

    // 6. Stage 3 Enemy 3: "Pitch Critic" - Dark Arch-Sorcerer
    const e3_3 = this.make.graphics({ x: 0, y: 0 });
    e3_3.fillStyle(0x581c87, 0.3);
    e3_3.fillCircle(24, 24, 20);
    // Dark cowl & robe
    e3_3.fillStyle(0x3b0764, 1);
    e3_3.fillTriangle(24, 6, 10, 38, 38, 38);
    // Floating glowing book
    e3_3.fillStyle(0xa855f7, 1);
    e3_3.fillRect(28, 20, 14, 10);
    e3_3.fillStyle(0xf3e8ff, 1);
    e3_3.fillRect(29, 21, 12, 8);
    e3_3.generateTexture('enemy_stage3_3', 48, 48);
    e3_3.destroy();
  }

  private createDungeonBosses() {
    // 1. Boss 1: "The Empathy Titan" - Ancient Ruins Megalith (80x80)
    const b1 = this.make.graphics({ x: 0, y: 0 });
    b1.fillStyle(0x000000, 0.25);
    b1.fillEllipse(40, 74, 52, 14);
    // Stone titan torso
    b1.fillStyle(0x334155, 1);
    b1.fillRoundedRect(18, 16, 44, 48, 12);
    // Massive stone fist blocks
    b1.fillStyle(0x475569, 1);
    b1.fillCircle(12, 38, 12);
    b1.fillCircle(68, 38, 12);
    // Runic chest core
    b1.fillStyle(0x059669, 1);
    b1.fillCircle(40, 36, 14);
    b1.fillStyle(0x34d399, 1);
    b1.fillCircle(40, 36, 6);
    // Horned Stone Crest
    b1.fillStyle(0x1e293b, 1);
    b1.fillTriangle(40, 4, 30, 20, 50, 20);

    b1.generateTexture('boss_stage1', 80, 80);
    b1.destroy();

    // 2. Boss 2: "The Feasibility Behemoth" - Ironclad Dungeon Colossus (80x80)
    const b2 = this.make.graphics({ x: 0, y: 0 });
    b2.fillStyle(0x000000, 0.25);
    b2.fillEllipse(40, 74, 52, 14);
    // Iron chassis
    b2.fillStyle(0x1e1b4b, 1);
    b2.fillRoundedRect(16, 16, 48, 48, 10);
    // Twin spinning brass shields
    b2.lineStyle(4, 0xf59e0b, 1);
    b2.strokeCircle(14, 40, 14);
    b2.strokeCircle(66, 40, 14);
    // Molten blast furnace chest
    b2.fillStyle(0xd97706, 1);
    b2.fillRect(32, 28, 16, 16);
    b2.fillStyle(0xfde047, 1);
    b2.fillCircle(40, 36, 5);

    b2.generateTexture('boss_stage2', 80, 80);
    b2.destroy();

    // 3. Boss 3: "The Pitch Overlord" - Grand Ancient Archon (80x80)
    const b3 = this.make.graphics({ x: 0, y: 0 });
    b3.fillStyle(0x000000, 0.25);
    b3.fillEllipse(40, 74, 52, 14);
    // Golden wings
    b3.fillStyle(0xf59e0b, 0.85);
    b3.fillTriangle(40, 28, 4, 12, 12, 54);
    b3.fillTriangle(40, 28, 76, 12, 68, 54);
    // Regal Archon Robes
    b3.fillStyle(0x78350f, 1);
    b3.fillRoundedRect(24, 20, 32, 48, 8);
    // Radiant Sun Halo
    b3.lineStyle(3, 0xfde047, 1);
    b3.strokeCircle(40, 20, 18);
    b3.fillStyle(0xfef08a, 1);
    b3.fillCircle(40, 20, 9);
    // Great Scepter
    b3.fillStyle(0xd97706, 1);
    b3.fillRect(60, 10, 4, 46);
    b3.fillStyle(0xf59e0b, 1);
    b3.fillCircle(62, 10, 6);

    b3.generateTexture('boss_stage3', 80, 80);
    b3.destroy();
  }
}
