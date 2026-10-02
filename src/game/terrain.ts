import type { StageOrdinal } from '../data/participantStages';
export type Rect = readonly [x: number, y: number, width: number, height: number];
export type Point = { x: number; y: number };
// Source-image pixels, traced against the fixed maps. Tree coordinates are visible trunk bases.
// ponytail: fixed scenery footprints fit these baked maps; use tile/object layers when maps become editable.
const RIVER_TREES: readonly (readonly [number, number])[] = [
  [64, 124], [256, 124], [32, 156], [160, 156], [320, 156], [192, 188], [448, 188], [800, 188], [96, 220], [160, 220], [288, 220], [384, 220], [480, 220], [768, 220], [64, 252], [224, 252], [448, 252], [544, 252], [192, 284], [352, 284], [128, 316], [416, 316], [512, 316], [800, 316], [288, 348], [960, 348], [256, 380], [416, 412], [608, 444], [672, 444], [32, 476], [192, 476], [320, 476], [576, 476], [704, 476], [96, 508], [544, 508], [64, 540], [512, 572], [768, 572], [960, 572], [96, 604], [224, 604], [544, 604], [736, 604], [160, 636], [576, 636], [672, 636], [288, 668], [256, 700], [832, 700], [992, 700], [864, 732], [192, 764], [736, 764], [800, 764], [256, 796], [704, 796], [608, 828], [960, 828], [832, 860], [928, 860], [768, 892], [640, 924], [736, 924], [800, 924], [768, 956], [832, 956], [896, 988], [928, 1020]
];

export const TREE_BASES: Record<StageOrdinal, readonly (readonly [number, number])[]> = {
  1: RIVER_TREES,
  2: [],
  3: [],
  4: [],
};

export const L3_BRIDGE: Rect = [378, 516, 132, 28];
export const L3_NORTH_BRIDGE: Rect = [584, 64, 176, 48];
export const L2_LADDERS: readonly Rect[] = [[450, 440, 28, 148], [962, 250, 26, 146]];

const RIVER_TERRAIN: readonly Rect[] = [
  [864,96,160,224],[832,194,28,60],[355,518,26,52],[352,576,32,36],[612,478,24,36],
  [552,134,16,20],[744,8,16,20],
  // Fallen timber and the solid bases of dead trees in the southwest.
  [20,670,30,36],[40,700,22,40],[110,778,24,42],[216,816,24,46],[276,880,24,45],
  [500,830,24,42],[628,920,30,42],
  ...RIVER_TREES.map(([x,y]) => [x-12,y-14,24,16] as const),
];

export const TERRAIN: Record<StageOrdinal, readonly Rect[]> = {
  1: RIVER_TERRAIN,
  2: [
    // Top-Left: Library & Alchemical Study
    [51, 51, 274, 55], [51, 51, 35, 140], [80, 160, 42, 50], [135, 235, 60, 45], [51, 320, 274, 30], [310, 51, 20, 150],
    // Top-Middle: Council Sanctuary & Grand Pillars
    [330, 51, 347, 55], [395, 155, 45, 125], [555, 155, 45, 125], [330, 51, 16, 150], [670, 51, 16, 290],
    // Top-Right: Dungeon Cells & Spiral Staircase
    [686, 51, 255, 125], [930, 51, 20, 325], [686, 51, 16, 325], [705, 175, 25, 45], [875, 435, 55, 60],
    // Center: Prototype Workshop & Central Forge
    [465, 315, 135, 185], [346, 470, 38, 70], [346, 595, 80, 35], [405, 495, 35, 70], [555, 415, 75, 40], [555, 545, 80, 45],
    [330, 345, 16, 350], [650, 345, 150, 40], [875, 345, 65, 40], [650, 555, 16, 140],
    // Bottom-Left: Knight Armory & Weapon Displays
    [51, 505, 20, 440], [51, 505, 280, 30], [310, 505, 20, 200], [310, 820, 20, 125], [51, 925, 280, 25],
    [65, 535, 235, 40], [65, 595, 35, 220], [265, 595, 35, 220], [130, 875, 95, 30],
    // Bottom-Right: Vault, Treasury & Barrel Storage
    [675, 685, 265, 30], [930, 685, 20, 260], [675, 685, 20, 25], [675, 820, 20, 125], [675, 925, 265, 25],
    [690, 725, 140, 40], [855, 715, 70, 70], [800, 810, 42, 30], [860, 880, 70, 40], [690, 875, 45, 40],
    // Entrance Gate Corridors
    [346, 685, 65, 170], [615, 685, 65, 170], [346, 855, 115, 75], [565, 855, 115, 75],
  ],
  3: [
    // Outer Fortress Walls & Ramparts
    [60, 45, 905, 170],
    [60, 45, 90, 835],
    [875, 45, 90, 835],
    [60, 725, 390, 155],
    [575, 725, 390, 155],
    // Central Pitch Presentation Pavilion
    [380, 245, 265, 305],
    [340, 360, 40, 190],
    [645, 360, 40, 190],
    // Gargoyles, Statues & Pillars
    [218, 620, 62, 90],
    [720, 620, 62, 90],
    [185, 365, 42, 95],
    [185, 515, 42, 95],
    [775, 365, 42, 95],
    [775, 515, 42, 95],
    [405, 635, 35, 80],
    [560, 635, 35, 80],
    // Braziers & Torches
    [335, 360, 28, 70],
    [335, 480, 28, 70],
    [635, 360, 28, 70],
    [635, 480, 28, 70],
    // Courtyard Trees
    [155, 150, 110, 150],
    [690, 150, 160, 150],
    [155, 650, 70, 95],
    [755, 665, 70, 90],
  ],
  4: [
    // North Grand Celestial Altar Pavilion
    [350, 85, 324, 255], [350, 310, 80, 50], [594, 310, 80, 50],
    // Balustrade Outer Railings & Cloud Perimeter
    [140, 180, 215, 45], [670, 180, 215, 45],
    [140, 180, 45, 120], [840, 180, 45, 120],
    [125, 270, 40, 500], [855, 270, 40, 500],
    [140, 750, 275, 45], [605, 750, 275, 45],
    [390, 750, 35, 110], [595, 750, 35, 110],
    // 4 Holy Water Pools
    [180, 285, 135, 95], [705, 285, 135, 95],
    [185, 635, 155, 110], [680, 635, 155, 110],
    // 2 Water Fountains
    [255, 450, 120, 110], [645, 450, 120, 110],
    // Winged Angel Statues & Floating Crystals
    [165, 420, 55, 95], [795, 420, 55, 95],
    [390, 390, 40, 75], [390, 560, 40, 75],
    [590, 390, 40, 75], [590, 560, 40, 75],
    [280, 175, 40, 80], [700, 175, 40, 80],
    [180, 685, 40, 80], [800, 685, 40, 80],
  ],
};
const inside = (x: number, y: number, [rx,ry,w,h]: Rect) => x >= rx && x < rx+w && y >= ry && y < ry+h;
export function touchesTerrain(stage: StageOrdinal, scale: number, point: Point, pixels: Uint8ClampedArray | null, width: number, height: number) {
  const left = (point.x-12)/scale, right = (point.x+12)/scale;
  const top = (point.y-20)/scale, bottom = (point.y-3)/scale;
  const ladder = stage === 2 && L2_LADDERS.some(rect => inside(left,top,rect) && inside(right,bottom,rect));
  if (!ladder && TERRAIN[stage].some(([x,y,w,h]) => left < x+w && right > x && top < y+h && bottom > y)) return true;
  if (!pixels) return false;
  for (let y=Math.max(0,Math.floor(top)); y<Math.min(height,Math.ceil(bottom)); y++) {
    for (let x=Math.max(0,Math.floor(left)); x<Math.min(width,Math.ceil(right)); x++) {
      if (stage === 1 && (inside(x,y,L3_BRIDGE) || inside(x,y,L3_NORTH_BRIDGE))) continue;
      const i=(y*width+x)*4, r=pixels[i], g=pixels[i+1], b=pixels[i+2];
      if (stage === 1) {
        if (b-r > 60 && b-g > 20) return true;
      } else if (stage === 2) {
        if (r < 55 && g < 50 && b < 45) return true;
      } else if (stage === 3) {
        if (y >= 860 && (x < 445 || x > 575)) return true;
        if (x < 55 || x > 970 || y < 40) return true;
      } else if (stage === 4) {
        if (y >= 820 && (x < 440 || x > 585)) return true;
        if (x < 130 || x > 895 || y < 80) return true;
      }
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

