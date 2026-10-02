import Phaser from 'phaser';
import { L3_BRIDGE, TREE_BASES, movePlayer, touchesTerrain } from './terrain';
import type { ParticipantStage } from '../data/participantStages';
import { STAGE_QUIZZES } from '../data/mockQuests';
import { STAGE_MONSTERS, monsterArtPath, type StageMonster } from '../data/stageMonsters';

import { getHeroSprite, getSavedHeroGender } from '../data/heroCharacters';

export type StageEncounter = { id: string; name: string; locked: boolean };
type Movement = { x: number; y: number };
const MAP_SIZE = 640;
const ENCOUNTER_RADIUS = 100;

export class ArenaScene extends Phaser.Scene {
  private player: Phaser.GameObjects.Sprite | null = null;
  private shadow: Phaser.GameObjects.Image | null = null;
  private mapPixels: Uint8ClampedArray | null = null;
  private mapWidth = MAP_SIZE;
  private mapHeight = MAP_SIZE;
  private nearbyEncounter: StageEncounter | null = null;
  private monsterSprites: { monster: StageMonster; sprite: Phaser.GameObjects.Image }[] = [];

  constructor(
    private readonly stage: ParticipantStage,
    private readonly readMovement: () => Movement,
    private readonly readDefeats: () => readonly string[],
    private readonly onNearbyEncounter: (encounter: StageEncounter | null) => void,
    private readonly onEncounterInteract: (encounter: StageEncounter) => void,
    private readonly onReady: () => void,
    private readonly heroSpritesheetUrl?: string,
  ) {
    super(`stage-${stage.ordinal}`);
  }

  preload() {
    this.load.image('world-map', this.stage.mapPath);
    this.load.image('player-shadow', '/assets/mixel/MainCharacter%20v.1.0/MainC_Shadow.png');
    const heroSprite = this.heroSpritesheetUrl || getHeroSprite('professional', getSavedHeroGender());
    this.load.spritesheet('knight', heroSprite, { frameWidth: 48, frameHeight: 48 });
    for (const monster of STAGE_MONSTERS[this.stage.ordinal]) this.load.image(monster.art, monsterArtPath(monster.art));
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

    this.drawBridge();
    this.drawCanopies(source);
    this.createAnimations();
    this.drawMonsters();
    this.spawnPlayer();
    this.onReady();
  }

  update(_time: number, delta: number) {
    if (!this.player) return;
    const input = this.readMovement();
    const {x,y}=input;
    if (Math.hypot(x,y)>0.08) {
      const next=movePlayer(this.player,input,delta,this.stage.worldSize,point =>
        touchesTerrain(this.stage.ordinal,this.stage.mapScale,point,this.mapPixels,this.mapWidth,this.mapHeight)
        || this.monsterSprites.some(({monster}) => Phaser.Math.Distance.Between(point.x,point.y,monster.x,monster.y) < (monster.boss ? 45 : 27)));
      const moved=next.x!==this.player.x || next.y!==this.player.y;
      this.player.setPosition(next.x,next.y).anims.play(moved?'knight-walk':'knight-idle',true);
      if (x) this.player.setFlipX(x<0);
    } else this.player.anims.play('knight-idle',true);

    this.player.setDepth(this.player.y);
    this.shadow?.setPosition(this.player.x, this.player.y - 4).setDepth(this.player.y - 1);
    const defeats = this.readDefeats();
    const bossUnlocked = STAGE_MONSTERS[this.stage.ordinal].slice(0,2).every(monster => defeats.includes(monster.quizId));
    for (const {monster,sprite} of this.monsterSprites) sprite.setTint(defeats.includes(monster.quizId) ? 0xb7d5ba : monster.boss && !bossUnlocked ? 0x8094a1 : 0xffffff);
    const nearby: {distance:number; encounter:StageEncounter}[] = this.monsterSprites.map(({monster}) => ({
      distance: Phaser.Math.Distance.Between(this.player!.x,this.player!.y,monster.x,monster.y),
      encounter: {id:monster.quizId,name:STAGE_QUIZZES.find(quiz => quiz.id === monster.quizId)?.enemyName || 'Monster',locked:Boolean(monster.boss && !bossUnlocked)},
    }));
    const encounter = nearby.filter(item => item.distance <= ENCOUNTER_RADIUS).sort((a,b) => a.distance-b.distance)[0]?.encounter || null;
    if (encounter?.id !== this.nearbyEncounter?.id || encounter?.locked !== this.nearbyEncounter?.locked) {
      this.nearbyEncounter = encounter;
      this.onNearbyEncounter(encounter);
    }
  }

  interact() {
    if (this.nearbyEncounter && !this.nearbyEncounter.locked) this.onEncounterInteract(this.nearbyEncounter);
  }

  private spawnPlayer() {
    const { x, y } = this.stage.spawn;
    this.shadow = this.add.image(x, y - 4, 'player-shadow').setDisplaySize(68, 40).setAlpha(0.8).setDepth(y - 1);
    this.player = this.add.sprite(x, y, 'knight').setOrigin(0.5, 1).setScale(1.85).setDepth(y).play('knight-idle');
    const updateCamera = () => this.cameras.main.setZoom(Math.max(this.scale.width < 768 || this.scale.height < 480 ? 0.8 : 1, this.scale.width/this.stage.worldSize, this.scale.height/this.stage.worldSize));
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, this.stage.worldSize, this.stage.worldSize).startFollow(this.player, true, 0.12, 0.12, 0, 32);
    updateCamera();
    this.scale.on('resize', updateCamera);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', updateCamera));
  }

  private drawBridge() {
    if (this.stage.ordinal !== 1) return;
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
    const canopies = (TREE_BASES[this.stage.ordinal] ?? []).map(([x,y]) => [x-32,y-60,64,52,x,y]);
    if (canopies.length === 0) return;
    canopies.forEach(([x,y,w,h,baseX,baseY],index) => {
      const texture=this.textures.createCanvas(`canopy-${index}`,w,h);
      if (!texture) return;
      const ctx=texture.context;
      // Crop the baked canopy into a foreground ellipse. The transparent corners keep paths visible.
      ctx.beginPath();ctx.ellipse(w/2,h/2,w/2,h/2,0,0,Math.PI*2);ctx.clip();
      ctx.drawImage(source,x,y,w,h,0,0,w,h);
      // Clear only background connected to the crop edge; keep the enclosed leaf pixels intact.
      const pixels=ctx.getImageData(0,0,w,h), seen=new Uint8Array(w*h), queue:number[]=[];
      const ground=new Set([0x95bb1f,0x8fb31e]);
      const visit=(i:number)=>{if(i<0||i>=w*h||seen[i])return;seen[i]=1;const p=i*4,d=pixels.data;if(!d[p+3]||ground.has((d[p]<<16)|(d[p+1]<<8)|d[p+2])){d[p+3]=0;queue.push(i);}};
      for(let i=0;i<w*h;i++)if(!pixels.data[i*4+3])visit(i);
      for(let i=0;i<queue.length;i++){const p=queue[i];if(p%w)visit(p-1);if(p%w<w-1)visit(p+1);visit(p-w);visit(p+w);}
      ctx.putImageData(pixels,0,0);texture.refresh();
      this.add.image((x+w/2)*scale,(y+h/2)*scale,`canopy-${index}`).setScale(scale).setDepth(baseY*scale);
    });
  }

  private createAnimations() {
    this.anims.create({ key: 'knight-idle', frames: this.anims.generateFrameNumbers('knight', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'knight-walk', frames: this.anims.generateFrameNumbers('knight', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
  }

  private drawMonsters() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    STAGE_MONSTERS[this.stage.ordinal].forEach((monster,index) => {
      const source = this.textures.get(monster.art).getSourceImage() as HTMLImageElement;
      const height = monster.boss ? 110 : 82;
      const width = Math.min(monster.boss ? 210 : 100, height * source.width / source.height);
      this.add.ellipse(monster.x,monster.y-3,width*.7,16,0x0b2d54,.3).setDepth(monster.y-2);
      const sprite = this.add.image(monster.x,monster.y,monster.art).setOrigin(.5,1).setDisplaySize(width,height).setDepth(monster.y);
      this.monsterSprites.push({monster,sprite});
      if (!reducedMotion) this.tweens.add({targets:sprite,y:monster.y-4,duration:1500+index*180,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    });
  }
}
