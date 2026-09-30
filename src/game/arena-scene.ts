import Phaser from 'phaser';
import { L3_BRIDGE, TREE_BASES, movePlayer, touchesTerrain } from './terrain';
import type { ParticipantStage, StageOrdinal } from '../data/participantStages';

export type StageBoard = { id: StageOrdinal; name: string; locked: boolean };
type Movement = { x: number; y: number };
type Facing = 'Back' | 'Front' | 'Left' | 'Right';
const MAP_SIZE = 640;
const BOARD_RADIUS = 100;
const CHARACTER_PATH = '/assets/mixel/MainCharacter%20v.1.0';

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

    this.drawBridge();
    this.drawCanopies(source);
    this.createAnimations();
    this.drawBoard();
    this.spawnPlayer();
    this.onReady();
  }

  update(_time: number, delta: number) {
    if (!this.player) return;
    const input = this.readMovement();
    const {x,y}=input;
    if (Math.hypot(x,y)>0.08) {
      this.facing = Math.abs(x)>Math.abs(y) ? (x<0?'Left':'Right') : (y<0?'Back':'Front');
      const next=movePlayer(this.player,input,delta,this.stage.worldSize,point => touchesTerrain(this.stage.ordinal,this.stage.mapScale,point,this.mapPixels,this.mapWidth,this.mapHeight));
      const moved=next.x!==this.player.x || next.y!==this.player.y;
      this.player.setPosition(next.x,next.y).anims.play(`${moved?'walk':'idle'}-${this.facing}`,true);
    } else this.player.anims.play(`idle-${this.facing}`,true);

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
    this.player = this.add.sprite(x, y, 'idle-Front').setOrigin(0.5, 1).setScale(2).setDepth(y).play('idle-Front');
    const updateCamera = () => this.cameras.main.setZoom(Math.max(this.scale.width < 768 || this.scale.height < 480 ? 0.8 : 1, this.scale.width/this.stage.worldSize, this.scale.height/this.stage.worldSize));
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, this.stage.worldSize, this.stage.worldSize).startFollow(this.player, true, 0.12, 0.12, 0, 32);
    updateCamera();
    this.scale.on('resize', updateCamera);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', updateCamera));
  }

  private drawBridge() {
    if (this.stage.ordinal !== 3) return;
    const [x,y,w,h]=L3_BRIDGE, scale=this.stage.mapScale;
    // Reuse this map's rope bridge, with its water/grass background made transparent.
    const texture=this.textures.createCanvas('island-bridge',w,72);
    if (!texture) return;
    const ctx=texture.context;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(this.textures.get('world-map').getSourceImage() as HTMLImageElement,584,32,176,96,0,0,w,72);
    const pixels=ctx.getImageData(0,0,w,72);
    for(let i=0;i<pixels.data.length;i+=4){const [r,g,b]=pixels.data.subarray(i,i+3);if(b>r+25 || g>r+8)pixels.data[i+3]=0;}
    ctx.putImageData(pixels,0,0);texture.refresh();
    this.add.image((x+w/2)*scale,(y+h/2)*scale,'island-bridge').setScale(scale).setDepth(1);
  }

  private drawCanopies(source: HTMLImageElement) {
    const scale=this.stage.mapScale;
    const canopies=this.stage.ordinal===1
      ? [[96,318,98,67,142,437],[255,64,78,66,304,176],[560,20,62,56,595,114],[389,289,56,34,406,353]]
      : TREE_BASES[this.stage.ordinal].map(([x,y]) => [x-32,y-60,64,52,x,y]);
    canopies.forEach(([x,y,w,h,baseX,baseY],index) => {
      const texture=this.textures.createCanvas(`canopy-${index}`,w,h);
      if (!texture) return;
      const ctx=texture.context;
      // Crop the baked canopy into a foreground ellipse. The transparent corners keep paths visible.
      ctx.beginPath();ctx.ellipse(w/2,h/2,w/2,h/2,0,0,Math.PI*2);ctx.clip();
      ctx.drawImage(source,x,y,w,h,0,0,w,h);
      // Clear only background connected to the crop edge; keep the enclosed leaf pixels intact.
      const pixels=ctx.getImageData(0,0,w,h), seen=new Uint8Array(w*h), queue:number[]=[];
      const ground=new Set(this.stage.ordinal===1?[0x9ab037,0x7d9630,0xc69c6d]:[0x95bb1f,0x8fb31e]);
      const visit=(i:number)=>{if(i<0||i>=w*h||seen[i])return;seen[i]=1;const p=i*4,d=pixels.data;if(!d[p+3]||ground.has((d[p]<<16)|(d[p+1]<<8)|d[p+2])){d[p+3]=0;queue.push(i);}};
      for(let i=0;i<w*h;i++)if(!pixels.data[i*4+3])visit(i);
      for(let i=0;i<queue.length;i++){const p=queue[i];if(p%w)visit(p-1);if(p%w<w-1)visit(p+1);visit(p-w);visit(p+w);}
      ctx.putImageData(pixels,0,0);texture.refresh();
      this.add.image((x+w/2)*scale,(y+h/2)*scale,`canopy-${index}`).setScale(scale).setDepth(baseY*scale);
    });
  }

  private createAnimations() {
    for (const facing of facings) {
      this.anims.create({ key: `idle-${facing}`, frames: this.anims.generateFrameNumbers(`idle-${facing}`, { start: 0, end: 8 }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `walk-${facing}`, frames: this.anims.generateFrameNumbers(`walk-${facing}`, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }
  }

  private drawBoard() {
    const { x, y } = this.stage.board;
    const depth = y + 28;
    const art = this.add.graphics().setDepth(depth);
    art.fillStyle(0x392e27, 0.28).fillEllipse(x, y + 32, 65, 19);
    art.fillStyle(0x6c4933).fillRect(x - 4, y + 8, 8, 38);
    art.fillStyle(0xf3c45e).fillRect(x - 50, y - 25, 100, 42);
    art.lineStyle(4, 0x392e27).strokeRect(x - 50, y - 25, 100, 42);
    art.fillStyle(Phaser.Display.Color.HexStringToColor(this.stage.accent).color).fillRect(x - 50, y - 25, 100, 7);
    this.add.text(x, y - 2, `${this.stage.phase} ${this.stage.name.toUpperCase()}`, {
      fontFamily: '"Pixelify Sans", monospace', fontSize: '14px', fontStyle: 'bold', color: '#17324d',
    }).setOrigin(0.5).setDepth(depth + 1);
  }
}
