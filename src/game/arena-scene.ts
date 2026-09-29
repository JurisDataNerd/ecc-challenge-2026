import Phaser from 'phaser';
import type { ParticipantStage, StageOrdinal } from '../data/participantStages';

export type StageBoard = { id: StageOrdinal; name: string; locked: boolean };
type Movement = { x: number; y: number };
type Facing = 'Back' | 'Front' | 'Left' | 'Right';
type Obstacle = readonly [x: number, y: number, width: number, height: number];

const MAP_SIZE = 640;
const WALK_SPEED = 190;
const BOARD_RADIUS = 86;
const CHARACTER_PATH = '/assets/mixel/MainCharacter%20v.1.0';

// Solid footprints for the baked Mixel map. Add a map-specific mask if another scene needs one.
// ponytail: hand-authored rectangles fit this fixed sample map; replace with tile collisions if maps become editable.
const TERRAIN_OBSTACLES: Obstacle[] = [
  [96, 130, 16, 184], [112, 130, 121, 15], [136, 145, 16, 47], [232, 130, 16, 62], [248, 130, 104, 15],
  [180, 279, 173, 41], [352, 97, 191, 16], [352, 113, 16, 33], [352, 193, 16, 31], [352, 241, 16, 14],
  [352, 279, 16, 162], [529, 113, 14, 367], [353, 440, 73, 40], [480, 440, 63, 40],
  [159, 241, 35, 23], [288, 241, 33, 23], [324, 161, 28, 31], [385, 115, 26, 24], [481, 115, 31, 24],
  [385, 159, 17, 34], [501, 159, 12, 34], [355, 193, 28, 31], [417, 204, 34, 23], [479, 204, 34, 23],
  [390, 258, 16, 35], [486, 258, 20, 35], [391, 354, 18, 59], [485, 382, 23, 32], [514, 382, 29, 32],
  [105, 49, 12, 44], [286, 127, 32, 49], [583, 49, 24, 64], [394, 318, 30, 35], [121, 380, 40, 57],
  [195, 546, 15, 31], [551, 477, 19, 30], [550, 602, 12, 31], [385, 9, 46, 46], [163, 99, 27, 27],
  [0, 221, 29, 34], [557, 267, 19, 22], [36, 575, 59, 55], [485, 611, 27, 23], [362, 46, 17, 15],
  [420, 74, 21, 18], [512, 35, 29, 61], [0, 295, 64, 22], [258, 390, 26, 56], [479, 479, 65, 34],
  [33, 69, 27, 26], [226, 39, 33, 21], [452, 70, 27, 25], [605, 160, 35, 34], [66, 447, 32, 33],
  [226, 453, 64, 50], [577, 298, 63, 45], [479, 543, 65, 36],
];

const facings: Facing[] = ['Back', 'Front', 'Left', 'Right'];

export class ArenaScene extends Phaser.Scene {
  private player: Phaser.GameObjects.Sprite | null = null;
  private shadow: Phaser.GameObjects.Image | null = null;
  private mapPixels: Uint8ClampedArray | null = null;
  private mapWidth = MAP_SIZE;
  private mapHeight = MAP_SIZE;
  private facing: Facing = 'Front';
  private nearbyBoard: StageBoard | null = null;

  constructor(
    private readonly stage: ParticipantStage,
    private readonly readMovement: () => Movement,
    private readonly onNearbyBoard: (board: StageBoard | null) => void,
    private readonly onBoardInteract: (board: StageBoard) => void,
    private readonly onReady: () => void,
  ) {
    super(`stage-${stage.ordinal}`);
  }

  preload() {
    this.load.image('world-map', this.stage.mapPath);
    this.load.image('player-shadow', `${CHARACTER_PATH}/MainC_Shadow.png`);
    for (const facing of facings) {
      this.load.spritesheet(`idle-${facing}`, `${CHARACTER_PATH}/MainC_Idle_${facing}.PNG`, { frameWidth: 32, frameHeight: 33 });
      this.load.spritesheet(`walk-${facing}`, `${CHARACTER_PATH}/MainC_Walk_${facing}.PNG`, { frameWidth: 32, frameHeight: 33 });
    }
  }

  create() {
    const scale = this.stage.mapScale;
    this.add.image(this.stage.worldSize / 2, this.stage.worldSize / 2, 'world-map').setScale(scale);

    const source = this.textures.get('world-map').getSourceImage() as HTMLImageElement;
    this.mapWidth = source.width;
    this.mapHeight = source.height;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = this.mapWidth;
    mapCanvas.height = this.mapHeight;
    const context = mapCanvas.getContext('2d', { willReadFrequently: true });
    if (context) {
      context.drawImage(source, 0, 0);
      this.mapPixels = context.getImageData(0, 0, this.mapWidth, this.mapHeight).data;
    }

    if (this.stage.ordinal === 1) {
      const spawnPatch = this.add.graphics();
      spawnPatch.fillStyle(0xc69c6d);
      spawnPatch.fillRect(438 * scale, 410 * scale, 24 * scale, 35 * scale);
    }

    this.createAnimations();
    this.drawBoard();
    this.spawnPlayer();
    this.onReady();
  }

  update(_time: number, delta: number) {
    if (!this.player) return;
    const input = this.readMovement();
    let x = input.x;
    let y = input.y;

    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) { x /= magnitude; y /= magnitude; }
    if (magnitude > 0.08) {
      this.facing = Math.abs(x) > Math.abs(y) ? (x < 0 ? 'Left' : 'Right') : (y < 0 ? 'Back' : 'Front');
      const step = (WALK_SPEED * Math.min(delta, 50)) / 1000;
      const nextX = Phaser.Math.Clamp(this.player.x + x * step, 20, this.stage.worldSize - 20);
      const nextY = Phaser.Math.Clamp(this.player.y + y * step, 20, this.stage.worldSize - 20);
      let moved = false;
      if (!this.touchesTerrain(nextX, this.player.y)) { moved ||= nextX !== this.player.x; this.player.x = nextX; }
      if (!this.touchesTerrain(this.player.x, nextY)) { moved ||= nextY !== this.player.y; this.player.y = nextY; }
      this.player.anims.play(`${moved ? 'walk' : 'idle'}-${this.facing}`, true);
    } else {
      this.player.anims.play(`idle-${this.facing}`, true);
    }

    this.player.setDepth(this.player.y);
    this.shadow?.setPosition(this.player.x, this.player.y - 4).setDepth(this.player.y - 1);
    const board = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.stage.board.x, this.stage.board.y) <= BOARD_RADIUS
      ? { id: this.stage.ordinal as StageOrdinal, name: this.stage.boardName, locked: false }
      : null;
    if (board?.id !== this.nearbyBoard?.id) {
      this.nearbyBoard = board;
      this.onNearbyBoard(board);
    }
  }

  interact() {
    if (this.nearbyBoard) this.onBoardInteract(this.nearbyBoard);
  }

  private spawnPlayer() {
    const { x, y } = this.stage.spawn;
    this.shadow = this.add.image(x, y - 4, 'player-shadow').setDisplaySize(54, 34).setAlpha(0.8).setDepth(y - 1);
    this.player = this.add.sprite(x, y, 'idle-Front').setOrigin(0.5, 1).setScale(this.stage.ordinal === 1 ? 2 : 1.5).setDepth(y).play('idle-Front');
    const zoom = Math.min(1.2, Math.max(0.8, this.scale.width / 960));
    this.cameras.main.setBounds(0, 0, this.stage.worldSize, this.stage.worldSize).setZoom(zoom).startFollow(this.player, true, 0.12, 0.12);
  }

  private touchesTerrain(x: number, y: number) {
    const scale = this.stage.mapScale;
    const left = (x - 12) / scale;
    const right = (x + 12) / scale;
    const top = (y - 20) / scale;
    const bottom = (y - 3) / scale;
    const pixels = this.mapPixels;
    if (!pixels) return false;

    if (this.stage.ordinal === 1) {
      if (TERRAIN_OBSTACLES.some(([ox, oy, width, height]) => left < ox + width && right > ox && top < oy + height && bottom > oy)) return true;
      for (let row = Math.max(545, Math.floor(top)); row < Math.min(this.mapHeight, Math.ceil(bottom)); row++) {
        for (let column = Math.max(160, Math.floor(left)); column < Math.min(350, Math.ceil(right)); column++) {
          if (this.isWaterPixel(pixels, column, row, 115, 170, 158)) return true;
        }
      }
      return false;
    }

    return [[left, top], [right, top], [left, bottom], [right, bottom], [(left + right) / 2, (top + bottom) / 2]]
      .some(([column, row]) => this.isBlueWaterPixel(pixels, Math.floor(column), Math.floor(row)));
  }

  private isWaterPixel(pixels: Uint8ClampedArray, column: number, row: number, red: number, green: number, blue: number) {
    const index = (row * this.mapWidth + column) * 4;
    return pixels[index] === red && pixels[index + 1] === green && pixels[index + 2] === blue;
  }

  private isBlueWaterPixel(pixels: Uint8ClampedArray, column: number, row: number) {
    if (column < 0 || row < 0 || column >= this.mapWidth || row >= this.mapHeight) return false;
    const index = (row * this.mapWidth + column) * 4;
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    return blue > 190 && blue - red > 70 && blue - green > 20;
  }

  private createAnimations() {
    for (const facing of facings) {
      this.anims.create({ key: `idle-${facing}`, frames: this.anims.generateFrameNumbers(`idle-${facing}`, { start: 0, end: 8 }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `walk-${facing}`, frames: this.anims.generateFrameNumbers(`walk-${facing}`, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }
  }

  private drawBoard() {
    const { x, y } = this.stage.board;
    const depth = y + 44;
    const art = this.add.graphics().setDepth(depth);
    art.fillStyle(0x392e27, 0.28).fillEllipse(x, y + 32, 65, 19);
    art.fillStyle(0x6c4933).fillRect(x - 4, y + 8, 8, 38);
    art.fillStyle(0xf3c45e).fillRect(x - 36, y - 23, 72, 38);
    art.lineStyle(4, 0x392e27).strokeRect(x - 36, y - 23, 72, 38);
    art.fillStyle(0x4f8a62).fillRect(x - 36, y - 23, 72, 7);
    this.add.text(x, y - 2, `L${this.stage.ordinal} JOURNAL`, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#17324d',
    }).setOrigin(0.5).setDepth(depth + 1);
  }
}
