import Phaser from "phaser";

export type StageBoard = {
  id: number;
  name: string;
  locked: boolean;
  x: number;
  y: number;
};

type Movement = { x: number; y: number };
type Facing = "Back" | "Front" | "Left" | "Right";
type Obstacle = readonly [x: number, y: number, width: number, height: number];

const MAP_SIZE = 640;
const MAP_SCALE = 2;
const WORLD_SIZE = MAP_SIZE * MAP_SCALE;
const WALK_SPEED = 190;
const BOARD_RADIUS = 86;
const CHARACTER_PATH = "/assets/mixel/MainCharacter%20v.1.0";

// Solid footprints on Mixel's 640px sample map. Grass, paths, stairs, stepping
// stones, flowers, bushes, and tree canopies are walkable; walls and trunks are not.
// ponytail: these footprints fit this baked map; author new collisions with each new map.
const TERRAIN_OBSTACLES: Obstacle[] = [
  // Ruin walls: openings at the west passage and diagonal staircase stay clear.
  [96, 130, 16, 184], [112, 130, 121, 15], [136, 145, 16, 47],
  [232, 130, 16, 62], [248, 130, 104, 15],
  // The ramp ends around x=180; the masonry wall resumes beyond its landing.
  [180, 279, 173, 41],
  [352, 97, 191, 16], [352, 113, 16, 33], [352, 193, 16, 31], [352, 241, 16, 14],
  [352, 279, 16, 162], [529, 113, 14, 367],
  [353, 440, 73, 40], [480, 440, 63, 40],
  // Stone pillars and raised blocks inside the ruins.
  [159, 241, 35, 23], [288, 241, 33, 23], [324, 161, 28, 31],
  [385, 115, 26, 24], [481, 115, 31, 24], [385, 159, 17, 34], [501, 159, 12, 34],
  [355, 193, 28, 31], [417, 204, 34, 23], [479, 204, 34, 23],
  [390, 258, 16, 35], [486, 258, 20, 35], [391, 354, 18, 59],
  [485, 382, 23, 32], [514, 382, 29, 32],
  // Standing tree trunks and roots block movement; their leafy canopies stay walkable.
  [105, 49, 12, 44], [286, 127, 32, 49], [583, 49, 24, 64],
  [394, 318, 30, 35], [121, 380, 40, 57], [195, 546, 15, 31],
  [551, 477, 19, 30], [550, 602, 12, 31],
  [385, 9, 46, 46], [163, 99, 27, 27], [0, 221, 29, 34],
  [557, 267, 19, 22], [36, 575, 59, 55], [485, 611, 27, 23],
  // Fallen logs and boulders.
  [362, 46, 17, 15], [420, 74, 21, 18], [512, 35, 29, 61],
  [0, 295, 64, 22], [258, 390, 26, 56], [479, 479, 65, 34],
  [33, 69, 27, 26], [226, 39, 33, 21], [452, 70, 27, 25], [605, 160, 35, 34],
  [66, 447, 32, 33], [226, 453, 64, 50], [577, 298, 63, 45], [479, 543, 65, 36],
];

const stages: StageBoard[] = [
  { id: 1, name: "Discover & empathize", locked: false, x: 410, y: 433 },
  { id: 2, name: "Prototype lab", locked: true, x: 467, y: 178 },
  { id: 3, name: "Pitch pavilion", locked: true, x: 427, y: 535 },
].map((stage) => ({ ...stage, x: stage.x * MAP_SCALE, y: stage.y * MAP_SCALE }));

const characterFiles: Record<Facing, string> = {
  Back: "Back",
  Front: "Front",
  Left: "Left",
  Right: "Right",
};

export class ArenaScene extends Phaser.Scene {
  private player: Phaser.GameObjects.Sprite | null = null;
  private shadow: Phaser.GameObjects.Image | null = null;
  private mapPixels: Uint8ClampedArray | null = null;
  private facing: Facing = "Front";
  private keys: Record<"up" | "down" | "left" | "right" | "w" | "a" | "s" | "d" | "interact", Phaser.Input.Keyboard.Key> | null = null;
  private activeBoardId: number | null = null;
  private nearbyBoard: StageBoard | null = null;

  constructor(
    private readonly readMovement: () => Movement,
    private readonly onNearbyBoard: (board: StageBoard | null) => void,
    private readonly onBoardInteract: (board: StageBoard) => void,
    private readonly onReady: () => void,
  ) {
    super("arena");
  }

  preload() {
    this.load.image("world-map", "/assets/mixel/Sample%20640x640.PNG");
    this.load.image("player-shadow", `${CHARACTER_PATH}/MainC_Shadow.png`);

    for (const facing of Object.keys(characterFiles) as Facing[]) {
      const name = characterFiles[facing];
      this.load.spritesheet(`idle-${facing}`, `${CHARACTER_PATH}/MainC_Idle_${name}.PNG`, {
        frameWidth: 32,
        frameHeight: 33,
      });
      this.load.spritesheet(`walk-${facing}`, `${CHARACTER_PATH}/MainC_Walk_${name}.PNG`, {
        frameWidth: 32,
        frameHeight: 33,
      });
    }
  }

  create() {
    this.add.image(WORLD_SIZE / 2, WORLD_SIZE / 2, "world-map").setScale(MAP_SCALE);
    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = MAP_SIZE;
    mapCanvas.height = MAP_SIZE;
    const mapContext = mapCanvas.getContext("2d", { willReadFrequently: true });
    if (!mapContext) throw new Error("Canvas 2D is required for terrain collision");
    mapContext.drawImage(this.textures.get("world-map").getSourceImage() as CanvasImageSource, 0, 0);
    this.mapPixels = mapContext.getImageData(0, 0, MAP_SIZE, MAP_SIZE).data;

    const spawnPatch = this.add.graphics();
    spawnPatch.fillStyle(0xc69c6d);
    spawnPatch.fillRect(438 * MAP_SCALE, 410 * MAP_SCALE, 24 * MAP_SCALE, 35 * MAP_SCALE);
    this.createAnimations();
    this.drawBase();
    stages.forEach((stage) => this.drawBoard(stage));

    const startX = 448 * MAP_SCALE;
    const startY = 440 * MAP_SCALE;
    this.shadow = this.add.image(startX, startY - 4, "player-shadow")
      .setDisplaySize(54, 34)
      .setAlpha(0.8)
      .setDepth(startY - 1);
    this.player = this.add.sprite(startX, startY, "idle-Front")
      .setOrigin(0.5, 1)
      .setScale(MAP_SCALE)
      .setDepth(startY)
      .play("idle-Front");

    const camera = this.cameras.main;
    camera.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE).setZoom(1.25);
    camera.startFollow(this.player, true, 0.12, 0.12);

    this.input.keyboard?.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "W", "A", "S", "D", "E"]);
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.keys = {
        up: keyboard.addKey("UP"),
        down: keyboard.addKey("DOWN"),
        left: keyboard.addKey("LEFT"),
        right: keyboard.addKey("RIGHT"),
        w: keyboard.addKey("W"),
        a: keyboard.addKey("A"),
        s: keyboard.addKey("S"),
        d: keyboard.addKey("D"),
        interact: keyboard.addKey("E"),
      };
    }

    this.onReady();
  }

  update(_time: number, delta: number) {
    if (!this.player) return;

    const input = this.readMovement();
    let x = input.x;
    let y = input.y;

    if (this.keys) {
      x += Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
      y += Number(this.keys.down.isDown || this.keys.s.isDown) - Number(this.keys.up.isDown || this.keys.w.isDown);
    }

    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }

    if (magnitude > 0.08) {
      if (Math.abs(x) > Math.abs(y)) this.facing = x < 0 ? "Left" : "Right";
      else this.facing = y < 0 ? "Back" : "Front";

      const step = (WALK_SPEED * Math.min(delta, 50)) / 1000;
      const nextX = Phaser.Math.Clamp(this.player.x + x * step, 32, WORLD_SIZE - 32);
      const nextY = Phaser.Math.Clamp(this.player.y + y * step, 32, WORLD_SIZE - 32);
      let moved = false;

      if (!this.touchesTerrain(nextX, this.player.y)) {
        moved ||= nextX !== this.player.x;
        this.player.x = nextX;
      }
      if (!this.touchesTerrain(this.player.x, nextY)) {
        moved ||= nextY !== this.player.y;
        this.player.y = nextY;
      }

      this.player.anims.play(`${moved ? "walk" : "idle"}-${this.facing}`, true);
    } else {
      this.player.anims.play(`idle-${this.facing}`, true);
    }

    this.player.setDepth(this.player.y);
    this.shadow?.setPosition(this.player.x, this.player.y - 4).setDepth(this.player.y - 1);

    if (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.interact();

    const nearest = stages.find((stage) =>
      Phaser.Math.Distance.Between(this.player!.x, this.player!.y, stage.x, stage.y) <= BOARD_RADIUS,
    ) ?? null;
    if (nearest?.id !== this.activeBoardId) {
      this.activeBoardId = nearest?.id ?? null;
      this.nearbyBoard = nearest;
      this.onNearbyBoard(nearest);
    }
  }

  interact() {
    if (this.nearbyBoard) this.onBoardInteract(this.nearbyBoard);
  }

  private touchesTerrain(x: number, y: number) {
    const left = (x - 12) / MAP_SCALE;
    const right = (x + 12) / MAP_SCALE;
    const top = (y - 20) / MAP_SCALE;
    const bottom = (y - 3) / MAP_SCALE;

    if (TERRAIN_OBSTACLES.some(([obstacleX, obstacleY, width, height]) =>
      left < obstacleX + width && right > obstacleX
      && top < obstacleY + height && bottom > obstacleY,
    )) return true;

    // The pond has an irregular shore: use the water pixels in the original map.
    const pixels = this.mapPixels;
    if (!pixels) return false;
    for (let row = Math.max(545, Math.floor(top)); row < Math.min(MAP_SIZE, Math.ceil(bottom)); row++) {
      for (let column = Math.max(160, Math.floor(left)); column < Math.min(350, Math.ceil(right)); column++) {
        const index = (row * MAP_SIZE + column) * 4;
        if (pixels[index] === 115 && pixels[index + 1] === 170 && pixels[index + 2] === 158) return true;
      }
    }
    return false;
  }

  private createAnimations() {
    for (const facing of Object.keys(characterFiles) as Facing[]) {
      this.anims.create({
        key: `idle-${facing}`,
        frames: this.anims.generateFrameNumbers(`idle-${facing}`, { start: 0, end: 8 }),
        frameRate: 5,
        repeat: -1,
      });
      this.anims.create({
        key: `walk-${facing}`,
        frames: this.anims.generateFrameNumbers(`walk-${facing}`, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  private drawBase() {
    const x = 448 * MAP_SCALE;
    const y = 390 * MAP_SCALE;
    const sign = this.add.graphics().setDepth(y);
    sign.fillStyle(0x392e27);
    sign.fillRect(x - 3, y + 3, 6, 26);
    sign.fillStyle(0xf3c45e);
    sign.fillRect(x - 25, y - 13, 50, 20);
    sign.lineStyle(3, 0x392e27);
    sign.strokeRect(x - 25, y - 13, 50, 20);
    this.add.text(x, y - 4, "BASE", {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#392e27",
    }).setOrigin(0.5).setDepth(y + 1);
  }

  private drawBoard(stage: StageBoard) {
    const { x, y, id, locked } = stage;
    const depth = y + 44;
    const art = this.add.graphics().setDepth(depth);
    art.fillStyle(0x392e27, 0.28);
    art.fillEllipse(x, y + 32, 65, 19);
    art.fillStyle(0x6c4933);
    art.fillRect(x - 4, y + 8, 8, 38);
    art.fillStyle(locked ? 0xa6a18c : 0xf3c45e);
    art.fillRect(x - 30, y - 20, 60, 34);
    art.lineStyle(4, 0x392e27);
    art.strokeRect(x - 30, y - 20, 60, 34);
    art.fillStyle(locked ? 0x858879 : 0x4f8a62);
    art.fillRect(x - 30, y - 20, 60, 7);

    this.add.text(x, y - 2, locked ? "LOCKED" : `STAGE ${id}`, {
      fontFamily: "Arial, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#17324d",
    }).setOrigin(0.5).setDepth(depth + 1);
  }
}
