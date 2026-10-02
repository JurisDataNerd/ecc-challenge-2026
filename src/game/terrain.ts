import { PARTICIPANT_STAGES, type StageOrdinal } from '../data/participantStages';
export type Rect = readonly [x: number, y: number, width: number, height: number];
export type Point = { x: number; y: number };
// Source-image pixels, traced against the fixed maps. Tree coordinates are visible trunk bases.
// ponytail: fixed scenery footprints fit these baked maps; use tile/object layers when maps become editable.
export const TREE_BASES: Record<2 | 3, readonly (readonly [number, number])[]> = {2: [[256, 28], [672, 60], [320, 92], [480, 92], [352, 124], [512, 124], [608, 124], [192, 156], [320, 156], [160, 188], [896, 188], [192, 220], [736, 220], [928, 220], [288, 252], [672, 252], [320, 284], [480, 284], [640, 284], [832, 284], [384, 316], [608, 316], [672, 316], [800, 316], [576, 348], [640, 348], [864, 348], [192, 380], [512, 380], [96, 412], [288, 412], [128, 444], [224, 444], [320, 444], [608, 444], [192, 476], [256, 476], [896, 476], [32, 508], [160, 508], [224, 508], [992, 508], [128, 540], [960, 540], [672, 572], [832, 572], [704, 604], [800, 604], [832, 636], [608, 668], [928, 668], [640, 700], [768, 700], [896, 700], [960, 700], [832, 732], [928, 732], [576, 764], [800, 764], [992, 796], [704, 828], [896, 828], [640, 860], [736, 860], [544, 892], [704, 892], [992, 892], [512, 924], [960, 956], [640, 988], [896, 988], [800, 1020]], 3: [[64, 124], [256, 124], [32, 156], [160, 156], [320, 156], [192, 188], [448, 188], [800, 188], [96, 220], [160, 220], [288, 220], [384, 220], [480, 220], [768, 220], [64, 252], [224, 252], [448, 252], [544, 252], [192, 284], [352, 284], [128, 316], [416, 316], [512, 316], [800, 316], [288, 348], [960, 348], [256, 380], [416, 412], [608, 444], [672, 444], [32, 476], [192, 476], [320, 476], [576, 476], [704, 476], [96, 508], [544, 508], [64, 540], [512, 572], [768, 572], [960, 572], [96, 604], [224, 604], [544, 604], [736, 604], [160, 636], [576, 636], [672, 636], [288, 668], [256, 700], [832, 700], [992, 700], [864, 732], [192, 764], [736, 764], [800, 764], [256, 796], [704, 796], [608, 828], [960, 828], [832, 860], [928, 860], [768, 892], [640, 924], [736, 924], [800, 924], [768, 956], [832, 956], [896, 988], [928, 1020]]};
export const L3_BRIDGE: Rect = [378, 516, 132, 28];
export const L3_NORTH_BRIDGE: Rect = [584, 64, 176, 48];
export const L2_LADDERS: readonly Rect[] = [[450, 440, 28, 148], [962, 250, 26, 146]];
export const TERRAIN: Record<StageOrdinal, readonly Rect[]> = {
  1: [
    [96,130,16,184],[112,130,121,15],[136,145,16,47],[232,130,16,62],[248,130,104,15],
    [180,279,173,41],[352,97,191,16],[352,113,16,33],[352,193,16,31],[352,241,16,14],
    [352,279,16,162],[529,113,14,367],[353,440,73,40],[480,440,63,40],
    [159,241,35,23],[288,241,33,23],[324,161,28,31],[385,115,26,24],[481,115,31,24],
    [385,159,17,34],[501,159,12,34],[355,193,28,31],[417,204,34,23],[479,204,34,23],
    [390,258,16,35],[486,258,20,35],[391,354,18,59],[485,382,23,32],[514,382,29,32],
    [105,49,12,44],[286,127,32,49],[583,49,24,64],[394,318,30,35],[121,380,40,57],
    [195,546,15,31],[551,477,19,30],[550,602,12,31],[385,9,46,46],[163,99,27,27],
    [0,221,29,34],[557,267,19,22],[36,575,59,55],[485,611,27,23],[362,46,17,15],
    [420,74,21,18],[512,35,29,61],[0,295,64,22],[258,390,26,56],[479,479,65,34],
    [33,69,27,26],[226,39,33,21],[452,70,27,25],[605,160,35,34],[66,447,32,33],
    [226,453,64,50],[577,298,63,45],[479,543,65,36],
  ],
  2: [
    // House and its roof, crates, barrels, pots and torch stands.
    [0,576,416,256],[128,544,128,32],[256,480,160,96],[418,688,60,80],
    [420,770,24,22],[420,800,24,24],[450,770,28,24],[160,830,32,36],[195,830,24,36],[226,830,24,36],[520,588,16,18],
    // Cliff faces. Painted ladder corridors are the only traversable crossings.
    [96,0,96,64],[128,64,96,32],[192,96,32,96],[352,0,32,64],[384,64,64,96],
    [448,128,64,96],[512,160,64,64],[544,192,160,64],[704,128,64,64],[704,64,64,64],
    [768,96,64,96],[832,128,32,96],[864,192,32,64],[896,224,64,128],[960,320,32,64],
    [256,256,32,128],[288,288,64,96],[352,352,32,96],[384,384,32,96],[416,448,96,128],
    [512,416,64,96],[576,448,32,96],[608,480,32,96],[640,448,96,96],[736,384,32,128],
    [768,416,64,96],[832,448,96,128],[928,512,64,64],[992,544,32,32],
    ...TREE_BASES[2].map(([x,y]) => [x-12,y-14,24,16] as const),
  ],
  3: [
    [864,96,160,224],[832,194,28,60],[355,518,26,52],[352,576,32,36],[612,478,24,36],
    [552,134,16,20],[744,8,16,20],
    // Fallen timber and the solid bases of dead trees in the southwest.
    [20,670,30,36],[40,700,22,40],[110,778,24,42],[216,816,24,46],[276,880,24,45],
    [500,830,24,42],[628,920,30,42],
    ...TREE_BASES[3].map(([x,y]) => [x-12,y-14,24,16] as const),
  ],
};
const inside = (x: number, y: number, [rx,ry,w,h]: Rect) => x >= rx && x < rx+w && y >= ry && y < ry+h;
export function touchesTerrain(stage: StageOrdinal, scale: number, point: Point, pixels: Uint8ClampedArray | null, width: number, height: number) {
  const left = (point.x-12)/scale, right = (point.x+12)/scale;
  const top = (point.y-20)/scale, bottom = (point.y-3)/scale;
  const board = PARTICIPANT_STAGES[stage-1].board;
  if (point.x+12>board.x-8 && point.x-12<board.x+8 && point.y-3>board.y+8 && point.y-20<board.y+46) return true;
  const ladder = stage === 2 && L2_LADDERS.some(rect => inside(left,top,rect) && inside(right,bottom,rect));
  if (!ladder && TERRAIN[stage].some(([x,y,w,h]) => left < x+w && right > x && top < y+h && bottom > y)) return true;
  if (!pixels) return false;
  for (let y=Math.max(0,Math.floor(top)); y<Math.min(height,Math.ceil(bottom)); y++) {
    for (let x=Math.max(0,Math.floor(left)); x<Math.min(width,Math.ceil(right)); x++) {
      if (stage === 3 && (inside(x,y,L3_BRIDGE) || inside(x,y,L3_NORTH_BRIDGE))) continue;
      const i=(y*width+x)*4, r=pixels[i], g=pixels[i+1], b=pixels[i+2];
      if (stage === 1 ? x >= 160 && x < 350 && y >= 545 && g-r > 15 && b-r > 20 : b-r > 60 && b-g > 20) return true;
    }
  }
  return false;
}
export function movementInput(keyboard: Point, stick: Point, paused: boolean): Point {
  if (paused) return { x:0, y:0 };
  let x=keyboard.x+stick.x, y=keyboard.y+stick.y;
  const magnitude=Math.hypot(x,y);
  if (magnitude <= 0.08) return { x:0, y:0 };
  if (magnitude > 1) { x/=magnitude; y/=magnitude; }
  return {x,y};
}
export function movePlayer(point: Point, input: Point, delta: number, size: number, collides: (point: Point) => boolean): Point {
  const step=190*Math.min(Math.max(delta,0),50)/1000;
  let x=point.x, y=point.y;
  const nextX=Math.max(20,Math.min(size-20,x+input.x*step));
  const nextY=Math.max(20,Math.min(size-20,y+input.y*step));
  if (!collides({x:nextX,y})) x=nextX;
  if (!collides({x,y:nextY})) y=nextY;
  return {x,y};
}

