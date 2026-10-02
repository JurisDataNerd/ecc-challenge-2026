import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

type Color = [number, number, number, number]; // r, g, b, a

// Map dimensions: 1024 x 2048
// Interior Sanctum: Y 0..1023 (Center: 512, 512)
// Exterior Courtyard: Y 1024..2047 (Center: 512, 1536)
const MAP_W = 1024;
const MAP_H = 2048;

function createPNG(w: number, h: number): PNG {
  return new PNG({ width: w, height: h });
}

function setPixel(png: PNG, x: number, y: number, color: Color) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (y * png.width + x) << 2;
  const [r, g, b, a] = color;
  if (a === 255) {
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  } else if (a > 0) {
    const da = png.data[idx + 3] / 255;
    const sa = a / 255;
    const outA = sa + da * (1 - sa);
    png.data[idx] = Math.round((r * sa + png.data[idx] * da * (1 - sa)) / outA);
    png.data[idx + 1] = Math.round((g * sa + png.data[idx + 1] * da * (1 - sa)) / outA);
    png.data[idx + 2] = Math.round((b * sa + png.data[idx + 2] * da * (1 - sa)) / outA);
    png.data[idx + 3] = Math.round(outA * 255);
  }
}

function fillRect(png: PNG, x: number, y: number, w: number, h: number, color: Color) {
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      setPixel(png, x + px, y + py, color);
    }
  }
}

function fillCircle(png: PNG, cx: number, cy: number, r: number, color: Color) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) {
        setPixel(png, Math.round(cx + dx), Math.round(cy + dy), color);
      }
    }
  }
}

function fillEllipse(png: PNG, cx: number, cy: number, rx: number, ry: number, color: Color) {
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        setPixel(png, Math.round(cx + dx), Math.round(cy + dy), color);
      }
    }
  }
}

function drawRectOutline(png: PNG, x: number, y: number, w: number, h: number, color: Color, thickness = 1) {
  fillRect(png, x, y, w, thickness, color);
  fillRect(png, x, y + h - thickness, w, thickness, color);
  fillRect(png, x, y, thickness, h, color);
  fillRect(png, x + w - thickness, y, thickness, h, color);
}

// ==========================================
// COLOR PALETTES (Harmonized with Heroes)
// ==========================================
// Ocean / Water
const C_OCEAN_DEEP: Color = [53, 98, 134, 255];
const C_OCEAN_MID: Color = [63, 115, 158, 255];
const C_OCEAN_LIGHT: Color = [88, 148, 194, 255];
const C_WATER_FOAM: Color = [186, 230, 253, 220];

// Grass & Nature
const C_GRASS_DEEP: Color = [46, 117, 63, 255];
const C_GRASS_MID: Color = [67, 150, 86, 255];
const C_GRASS_LIGHT: Color = [98, 184, 115, 255];
const C_DIRT_EDGE: Color = [180, 150, 110, 255];
const C_SAND_BEACH: Color = [228, 205, 158, 255];

// Stone & Marble (Palace & Pillars)
const C_STONE_DARK: Color = [51, 65, 85, 255];
const C_STONE_MID: Color = [100, 116, 139, 255];
const C_STONE_LIGHT: Color = [148, 163, 184, 255];
const C_MARBLE_BASE: Color = [241, 245, 249, 255];
const C_MARBLE_SHADE: Color = [203, 213, 225, 255];
const C_MARBLE_LINE: Color = [148, 163, 184, 180];

// Gold & Royal Ornaments
const C_GOLD_DARK: Color = [180, 110, 15, 255];
const C_GOLD_MID: Color = [234, 179, 8, 255];
const C_GOLD_LIGHT: Color = [254, 240, 138, 255];

// Tri-Path Colors
const C_ROYAL_BLUE: Color = [37, 99, 235, 255]; // Knight
const C_CYAN_GLOW: Color = [56, 189, 248, 255];
const C_EMERALD: Color = [16, 185, 129, 255];   // Mage
const C_MINT_GLOW: Color = [110, 231, 183, 255];
const C_CRIMSON: Color = [225, 29, 72, 255];    // Assassin
const C_AMBER_GLOW: Color = [251, 146, 60, 255];

// ==========================================
// PROCEDURAL DRAWING HELPERS
// ==========================================
function drawCobblestoneRoad(png: PNG, x: number, y: number, w: number, h: number) {
  // Base path
  fillRect(png, x, y, w, h, [214, 211, 209, 255]); // Warm stone
  
  // Outer curb borders
  fillRect(png, x, y, 6, h, [120, 113, 108, 255]);
  fillRect(png, x + w - 6, y, 6, h, [120, 113, 108, 255]);
  fillRect(png, x + 6, y, 2, h, [231, 229, 228, 255]);
  fillRect(png, x + w - 8, y, 2, h, [168, 162, 158, 255]);

  // Cobble pattern
  for (let py = y + 4; py < y + h - 8; py += 16) {
    const offset = ((py - y) / 16) % 2 === 0 ? 0 : 12;
    for (let px = x + 8 + offset; px < x + w - 16; px += 24) {
      drawRectOutline(png, px, py, 22, 14, [168, 162, 158, 160], 1);
      fillRect(png, px + 2, py + 2, 18, 10, [225, 222, 219, 255]);
      // Small stone texture highlight
      fillRect(png, px + 3, py + 3, 4, 3, [245, 245, 244, 255]);
    }
  }
}

function drawMarblePillar(png: PNG, cx: number, cy: number, height = 90, accentColor: Color = C_GOLD_MID) {
  const w = 24;
  const left = cx - w / 2;
  const top = cy - height;

  // Base plinth
  fillRect(png, left - 4, cy - 10, w + 8, 10, C_STONE_DARK);
  fillRect(png, left - 2, cy - 8, w + 4, 8, C_MARBLE_SHADE);
  fillRect(png, left, cy - 6, w, 4, C_MARBLE_BASE);

  // Column shaft
  fillRect(png, left, top + 14, w, height - 24, C_MARBLE_SHADE);
  fillRect(png, left + 3, top + 14, w - 6, height - 24, C_MARBLE_BASE);
  fillRect(png, left + 7, top + 14, 4, height - 24, [255, 255, 255, 255]); // Flute highlight
  fillRect(png, left + w - 5, top + 14, 3, height - 24, C_STONE_MID); // Flute shade

  // Capital (top)
  fillRect(png, left - 4, top, w + 8, 14, C_STONE_DARK);
  fillRect(png, left - 2, top + 2, w + 4, 10, C_MARBLE_BASE);
  fillRect(png, left - 1, top + 6, w + 2, 4, accentColor);

  // Shadow at base
  fillEllipse(png, cx, cy + 3, 20, 6, [15, 23, 42, 100]);
}

function drawTree(png: PNG, cx: number, cy: number, radius = 40) {
  // Tree shadow
  fillEllipse(png, cx, cy + 12, radius * 1.1, radius * 0.4, [15, 23, 42, 120]);

  // Trunk
  fillRect(png, cx - 8, cy - 20, 16, 32, [120, 53, 15, 255]);
  fillRect(png, cx - 4, cy - 18, 8, 28, [146, 64, 14, 255]);

  // Multi-layered lush canopy (rich 16-bit RPG shading)
  fillCircle(png, cx, cy - 44, radius, [30, 81, 40, 255]); // Dark base
  fillCircle(png, cx - 14, cy - 40, radius * 0.8, [46, 117, 63, 255]);
  fillCircle(png, cx + 14, cy - 40, radius * 0.8, [46, 117, 63, 255]);
  fillCircle(png, cx, cy - 54, radius * 0.85, [67, 150, 86, 255]); // Mid foliage
  
  // Highlight clusters
  fillCircle(png, cx - 10, cy - 60, radius * 0.5, [98, 184, 115, 255]);
  fillCircle(png, cx + 12, cy - 56, radius * 0.45, [98, 184, 115, 255]);
  fillCircle(png, cx - 4, cy - 70, radius * 0.35, [134, 239, 172, 220]); // Top light catch

  // Tiny flower dots / fruits on tree
  const flowers: [number, number, Color][] = [
    [cx - 16, cy - 48, [254, 240, 138, 255]],
    [cx + 18, cy - 42, [253, 164, 175, 255]],
    [cx - 5, cy - 35, [254, 240, 138, 255]],
    [cx + 8, cy - 66, [253, 164, 175, 255]],
  ];
  flowers.forEach(([fx, fy, col]) => fillCircle(png, fx, fy, 2, col));
}

function drawTriCrestMosaic(png: PNG, cx: number, cy: number, radius = 54) {
  // Mosaic outer gold rim
  fillCircle(png, cx, cy, radius + 4, C_GOLD_DARK);
  fillCircle(png, cx, cy, radius + 2, C_GOLD_LIGHT);
  fillCircle(png, cx, cy, radius, [30, 41, 59, 255]);

  // Inner marble inlay
  fillCircle(png, cx, cy, radius - 6, [248, 250, 252, 255]);

  // 3 Colored Segments representing the 3 Roles (Professional Blue, Impact Green, Business Crimson)
  const sliceR = radius - 12;
  // Top-left: Professional Blue
  fillCircle(png, cx - 14, cy - 10, sliceR * 0.48, C_ROYAL_BLUE);
  fillCircle(png, cx - 14, cy - 10, sliceR * 0.3, C_CYAN_GLOW);

  // Top-right: Business Crimson
  fillCircle(png, cx + 14, cy - 10, sliceR * 0.48, C_CRIMSON);
  fillCircle(png, cx + 14, cy - 10, sliceR * 0.3, C_AMBER_GLOW);

  // Bottom: Social Impact Emerald
  fillCircle(png, cx, cy + 16, sliceR * 0.48, C_EMERALD);
  fillCircle(png, cx, cy + 16, sliceR * 0.3, C_MINT_GLOW);

  // Central golden star emblem
  fillCircle(png, cx, cy, 10, C_GOLD_MID);
  fillCircle(png, cx, cy, 6, C_GOLD_LIGHT);
}

// ==========================================
// MASTER GENERATOR
// ==========================================
export function generateCustomWorld(): PNG {
  const png = createPNG(MAP_W, MAP_H);

  console.log('Generating Zone 1: Exterior Courtyard of Trials...');
  // ----------------------------------------------------
  // 1. EXTERIOR ZONE (Y: 1024 to 2047)
  // ----------------------------------------------------
  // Ocean Base
  fillRect(png, 0, 1024, MAP_W, 1024, C_OCEAN_MID);
  // Subtle ocean wave streaks
  for (let y = 1040; y < 2040; y += 18) {
    const waveX = (y * 7) % 120;
    for (let x = waveX; x < MAP_W; x += 160) {
      fillRect(png, x, y, 32, 2, C_OCEAN_LIGHT);
      fillRect(png, x + 8, y + 1, 16, 1, C_WATER_FOAM);
    }
  }

  // Floating Island Landmass (Y: 1100 to 1980, X: 110 to 914)
  const islandCX = 512;
  const islandCY = 1580;
  // Sand beach fringe
  fillEllipse(png, islandCX, islandCY, 404, 384, C_DIRT_EDGE);
  fillEllipse(png, islandCX, islandCY, 396, 376, C_SAND_BEACH);

  // Island Upper Plateau (Lush Green Grass)
  fillEllipse(png, islandCX, islandCY - 20, 380, 350, C_GRASS_DEEP);
  fillEllipse(png, islandCX, islandCY - 24, 372, 342, C_GRASS_MID);

  // Decorative grass textures and wildflowers
  for (let gy = 1240; gy < 1920; gy += 24) {
    for (let gx = 180; gx < 840; gx += 32) {
      const dist = Math.hypot((gx - islandCX) / 370, (gy - (islandCY - 24)) / 340);
      if (dist < 0.92) {
        setPixel(png, gx, gy, C_GRASS_LIGHT);
        setPixel(png, gx + 1, gy - 1, C_GRASS_LIGHT);
        if ((gx + gy) % 64 === 0) {
          fillCircle(png, gx + 4, gy + 2, 2, [254, 240, 138, 255]); // Yellow flower
        } else if ((gx + gy) % 96 === 0) {
          fillCircle(png, gx + 2, gy - 2, 2, [244, 114, 182, 255]); // Pink flower
        }
      }
    }
  }

  // Grand Cobblestone Avenue leading north to Citadel
  drawCobblestoneRoad(png, 440, 1380, 144, 520);

  // Cross-paths to left and right pavilions
  drawCobblestoneRoad(png, 240, 1570, 204, 60);
  drawCobblestoneRoad(png, 580, 1570, 204, 60);

  // Central Tri-Crest Mosaic Plaza at Player Spawn (512, 1600)
  drawTriCrestMosaic(png, 512, 1600, 68);

  // --- WEST PAVILION: SHRINE OF STRATEGY (Knight / Professional) ---
  // Pavilion Stone Base at X: 260, Y: 1540
  fillRect(png, 200, 1480, 120, 110, C_STONE_DARK);
  fillRect(png, 204, 1484, 112, 102, C_MARBLE_BASE);
  drawRectOutline(png, 204, 1484, 112, 102, C_ROYAL_BLUE, 3);
  // Knight Emblem / Sword monument
  fillCircle(png, 260, 1530, 24, C_ROYAL_BLUE);
  fillCircle(png, 260, 1530, 18, C_CYAN_GLOW);
  fillRect(png, 258, 1514, 4, 32, C_MARBLE_BASE); // Sword blade
  fillRect(png, 250, 1522, 20, 4, C_GOLD_LIGHT);  // Sword crossguard
  // Pillars flanking the pavilion
  drawMarblePillar(png, 212, 1494, 70, C_ROYAL_BLUE);
  drawMarblePillar(png, 308, 1494, 70, C_ROYAL_BLUE);

  // --- EAST PAVILION: SHRINE OF COMMERCE (Assassin / Business) ---
  // Pavilion Stone Base at X: 764, Y: 1540
  fillRect(png, 704, 1480, 120, 110, C_STONE_DARK);
  fillRect(png, 708, 1484, 112, 102, C_MARBLE_BASE);
  drawRectOutline(png, 708, 1484, 112, 102, C_CRIMSON, 3);
  // Assassin Emblem / Dagger & Scale monument
  fillCircle(png, 764, 1530, 24, C_CRIMSON);
  fillCircle(png, 764, 1530, 18, C_AMBER_GLOW);
  fillRect(png, 762, 1516, 4, 28, [241, 245, 249, 255]); // Dagger
  fillRect(png, 754, 1528, 20, 3, C_GOLD_LIGHT); // Scale arm
  fillCircle(png, 755, 1534, 4, C_GOLD_MID);
  fillCircle(png, 773, 1534, 4, C_GOLD_MID);
  // Pillars flanking the pavilion
  drawMarblePillar(png, 716, 1494, 70, C_CRIMSON);
  drawMarblePillar(png, 812, 1494, 70, C_CRIMSON);

  // --- TEMPLE CITADEL FACADE & GRAND PORTAL (Y: 1200 to 1390) ---
  // Grand Terrace Plinth
  fillRect(png, 300, 1250, 424, 140, C_STONE_DARK);
  fillRect(png, 306, 1254, 412, 132, C_MARBLE_SHADE);
  fillRect(png, 312, 1260, 400, 120, C_MARBLE_BASE);

  // Marble Grand Steps leading down from Terrace (Y: 1390..1460, X: 440..584)
  for (let sy = 1390; sy < 1456; sy += 10) {
    fillRect(png, 436, sy, 152, 4, C_STONE_DARK);
    fillRect(png, 438, sy + 4, 148, 6, C_MARBLE_BASE);
  }

  // Citadel Temple Colonnade (6 Towering Pillars)
  const pillarXCoords = [330, 380, 430, 594, 644, 694];
  pillarXCoords.forEach(px => {
    drawMarblePillar(png, px, 1370, 100, C_GOLD_MID);
  });

  // Grand Portal Archway Entrance (Doorway at X: 496..528, Y: 1370..1395)
  // Outer Arch
  fillRect(png, 470, 1270, 84, 110, C_STONE_DARK);
  fillRect(png, 474, 1274, 76, 104, C_MARBLE_BASE);
  // Glowing Teleport Gateway
  fillRect(png, 490, 1300, 44, 80, [15, 23, 42, 255]); // Dark doorway void
  fillRect(png, 494, 1308, 36, 72, [2, 132, 199, 255]); // Azure light
  fillCircle(png, 512, 1344, 14, [186, 230, 253, 255]); // Inner radiant portal core
  // Gold pediment crest above doorway
  fillCircle(png, 512, 1285, 10, C_GOLD_MID);
  fillCircle(png, 512, 1285, 6, C_GOLD_LIGHT);

  // Lush Canopy Trees flanking the island
  const treeLocations = [
    // Left cluster
    [160, 1340, 48],
    [190, 1420, 42],
    [150, 1520, 46],
    [170, 1640, 44],
    [210, 1740, 40],
    [270, 1820, 38],
    // Right cluster
    [864, 1340, 48],
    [834, 1420, 42],
    [874, 1520, 46],
    [854, 1640, 44],
    [814, 1740, 40],
    [754, 1820, 38],
    // Terrace flanking
    [310, 1240, 36],
    [714, 1240, 36],
  ];
  treeLocations.forEach(([tx, ty, tr]) => drawTree(png, tx, ty, tr));

  console.log('Generating Zone 2: Grand Council Sanctum (Interior)...');
  // ----------------------------------------------------
  // 2. INTERIOR ZONE (Y: 0 to 1023)
  // ----------------------------------------------------
  // Deep Void Backdrop
  fillRect(png, 0, 0, MAP_W, 1024, [15, 23, 42, 255]);

  // Grand Sanctum Palace Hall (X: 180..844, Y: 140..860)
  const hallX = 180;
  const hallY = 140;
  const hallW = 664;
  const hallH = 720;

  // Outer Granite Fortress Walls
  fillRect(png, hallX - 16, hallY - 16, hallW + 32, hallH + 32, [30, 41, 59, 255]);
  fillRect(png, hallX - 10, hallY - 10, hallW + 20, hallH + 20, [51, 65, 85, 255]);
  drawRectOutline(png, hallX - 10, hallY - 10, hallW + 20, hallH + 20, C_GOLD_DARK, 3);

  // Interior Floor: Checkered Polished Marble (Warm Ivory & Cool Slate)
  for (let fy = hallY; fy < hallY + hallH; fy += 28) {
    for (let fx = hallX; fx < hallX + hallW; fx += 28) {
      const isAlt = ((fx - hallX) / 28 + (fy - hallY) / 28) % 2 === 0;
      const tileCol: Color = isAlt ? [248, 250, 252, 255] : [226, 232, 240, 255];
      fillRect(png, fx, fy, 27, 27, tileCol);
      // Subtle 1px mortar line
      drawRectOutline(png, fx, fy, 28, 28, [203, 213, 225, 140], 1);
    }
  }

  // Grand Royal Crimson Runner Carpet (X: 456..568, Y: 260..860)
  fillRect(png, 456, 260, 112, 600, [136, 19, 55, 255]); // Rich wine border
  fillRect(png, 460, 260, 104, 600, C_CRIMSON); // Vibrant royal crimson
  fillRect(png, 462, 260, 4, 600, C_GOLD_MID); // Gold border trim
  fillRect(png, 558, 260, 4, 600, C_GOLD_MID);
  // Gold embroidered diamond accents along carpet
  for (let cy = 290; cy < 850; cy += 40) {
    fillCircle(png, 512, cy, 6, C_GOLD_LIGHT);
    fillCircle(png, 512, cy, 3, C_GOLD_MID);
  }

  // --- HIGH ALTAR DAIS & GRAND MASTER'S THRONE (X: 512, Y: 430 - Boss Zone) ---
  // Raised Dais Platform (Y: 340..460, X: 420..604)
  fillRect(png, 410, 340, 204, 120, C_STONE_DARK);
  fillRect(png, 414, 344, 196, 112, C_MARBLE_BASE);
  drawRectOutline(png, 414, 344, 196, 112, C_GOLD_MID, 2);

  // Triple Stained Glass Windows behind the Dais (Y: 170..310)
  // Left Window (Knight / Blue)
  fillRect(png, 430, 180, 44, 120, C_STONE_DARK);
  fillRect(png, 434, 184, 36, 112, C_ROYAL_BLUE);
  fillRect(png, 440, 200, 24, 80, C_CYAN_GLOW);
  // Center Window (Grand Impact Crest / Gold)
  fillRect(png, 490, 160, 44, 140, C_STONE_DARK);
  fillRect(png, 494, 164, 36, 132, C_GOLD_MID);
  fillRect(png, 500, 180, 24, 100, C_GOLD_LIGHT);
  // Right Window (Assassin / Crimson)
  fillRect(png, 550, 180, 44, 120, C_STONE_DARK);
  fillRect(png, 554, 184, 36, 112, C_CRIMSON);
  fillRect(png, 560, 200, 24, 80, C_AMBER_GLOW);

  // Grand Master's Throne at X: 512, Y: 380
  // Throne backrest (Gold & Crimson Velvet)
  fillRect(png, 494, 350, 36, 44, C_GOLD_DARK);
  fillRect(png, 498, 354, 28, 36, [159, 18, 57, 255]);
  // Throne seat & armrests
  fillRect(png, 490, 380, 44, 18, C_GOLD_MID);
  fillRect(png, 496, 384, 32, 14, C_CRIMSON);
  // Crown finials on throne
  fillCircle(png, 494, 348, 5, C_GOLD_LIGHT);
  fillCircle(png, 530, 348, 5, C_GOLD_LIGHT);
  fillCircle(png, 512, 342, 7, C_GOLD_LIGHT);

  // --- INTERIOR COLUMNS & BRAZIERS ---
  const interiorPillarX = [420, 604];
  const interiorPillarY = [500, 620, 740];
  interiorPillarX.forEach(px => {
    interiorPillarY.forEach(py => {
      drawMarblePillar(png, px, py, 96, C_GOLD_MID);
    });
  });

  // --- LEFT WING: ARCHIVE OF STRATEGY (X: 200..380, Y: 240..600) ---
  // Partition Arch
  fillRect(png, 380, 200, 14, 480, C_STONE_DARK);
  fillRect(png, 382, 202, 10, 476, C_MARBLE_BASE);
  // Large Oak Bookshelves
  for (let by = 260; by <= 480; by += 80) {
    fillRect(png, 220, by, 120, 24, [69, 26, 3, 255]); // Dark wood
    fillRect(png, 224, by + 4, 112, 16, [120, 53, 15, 255]); // Shelves
    // Books
    for (let bx = 228; bx < 330; bx += 8) {
      const bookCols: Color[] = [C_ROYAL_BLUE, C_GOLD_MID, C_EMERALD, C_CRIMSON];
      const colIdx = Math.floor(bx / 8) % bookCols.length;
      fillRect(png, bx, by + 6, 6, 12, bookCols[colIdx]);
    }
  }

  // --- RIGHT WING: VAULT OF INNOVATION (X: 644..824, Y: 240..600) ---
  // Partition Arch
  fillRect(png, 630, 200, 14, 480, C_STONE_DARK);
  fillRect(png, 632, 202, 10, 476, C_MARBLE_BASE);
  // Treasure Chests & Innovation Plinths
  for (let ty = 280; ty <= 500; ty += 80) {
    // Marble Pedestal
    fillRect(png, 690, ty, 80, 26, C_STONE_DARK);
    fillRect(png, 694, ty + 2, 72, 22, C_MARBLE_BASE);
    // Glowing Invention Sphere / Chest
    fillCircle(png, 730, ty - 6, 14, C_GOLD_LIGHT);
    fillCircle(png, 730, ty - 6, 9, C_AMBER_GLOW);
  }

  // South Exit Portal (X: 496..528, Y: 750..770)
  fillRect(png, 480, 800, 64, 40, C_STONE_DARK);
  fillRect(png, 484, 804, 56, 36, C_MARBLE_BASE);
  fillRect(png, 494, 810, 36, 26, [30, 58, 138, 255]);
  fillCircle(png, 512, 822, 8, C_CYAN_GLOW);

  console.log('Custom world generation complete.');
  return png;
}

// ==========================================
// BATTLE BACKGROUND GENERATOR
// ==========================================
export function generateBattleBackground(): PNG {
  const w = 800;
  const h = 450;
  const png = createPNG(w, h);

  console.log('Generating Battle Background (800 x 450)...');

  // Gradient Sky (Sunset / Twilight Gold to Azure)
  for (let y = 0; y < 280; y++) {
    const t = y / 280;
    const r = Math.round(30 * (1 - t) + 120 * t);
    const g = Math.round(58 * (1 - t) + 160 * t);
    const b = Math.round(138 * (1 - t) + 210 * t);
    fillRect(png, 0, y, w, 1, [r, g, b, 255]);
  }

  // Distant Floating Islands & Clouds
  fillEllipse(png, 200, 200, 140, 40, [255, 255, 255, 60]);
  fillEllipse(png, 600, 180, 160, 45, [255, 255, 255, 70]);
  fillEllipse(png, 400, 220, 200, 50, [255, 255, 255, 90]);

  // Distant Temple Spire Silhouettes
  fillRect(png, 380, 150, 40, 120, [71, 85, 105, 120]);
  fillRect(png, 395, 110, 10, 40, [71, 85, 105, 120]);

  // Battle Arena Platform Floor (Y: 280..450)
  fillRect(png, 0, 280, w, 170, C_STONE_DARK);
  fillRect(png, 0, 286, w, 164, C_MARBLE_SHADE);
  fillRect(png, 0, 292, w, 158, C_MARBLE_BASE);

  // Red & Gold Arena Runner in center
  fillRect(png, 100, 310, 600, 120, [159, 18, 57, 255]);
  fillRect(png, 106, 316, 588, 108, C_CRIMSON);
  fillRect(png, 106, 316, 588, 4, C_GOLD_MID);
  fillRect(png, 106, 420, 588, 4, C_GOLD_MID);

  // Left & Right Grand Marble Columns framing the battle arena
  drawMarblePillar(png, 60, 380, 240, C_ROYAL_BLUE);
  drawMarblePillar(png, w - 60, 380, 240, C_CRIMSON);

  // Glowing Torch Braziers
  const brazierX = [140, w - 140];
  brazierX.forEach(bx => {
    fillRect(png, bx - 10, 290, 20, 40, C_STONE_DARK);
    fillCircle(png, bx, 285, 14, [245, 158, 11, 255]);
    fillCircle(png, bx, 285, 8, [253, 224, 71, 255]);
  });

  return png;
}

// ==========================================
// EXECUTION & FILE SAVING
// ==========================================
async function main() {
  const worldPNG = generateCustomWorld();
  const battlePNG = generateBattleBackground();

  const outDir = path.resolve(process.cwd(), 'public/assets/dungeon');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const worldPath = path.join(outDir, 'custom_unified_world.png');
  const battlePath = path.join(outDir, 'custom_battle_bg.png');

  await new Promise<void>((resolve, reject) => {
    worldPNG
      .pack()
      .pipe(fs.createWriteStream(worldPath))
      .on('finish', () => {
        console.log(`Saved custom world map to: ${worldPath}`);
        resolve();
      })
      .on('error', reject);
  });

  await new Promise<void>((resolve, reject) => {
    battlePNG
      .pack()
      .pipe(fs.createWriteStream(battlePath))
      .on('finish', () => {
        console.log(`Saved battle background to: ${battlePath}`);
        resolve();
      })
      .on('error', reject);
  });
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
