import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// Setup dimensions: 4 frames wide (4 * 48 = 192), 3 rows high (3 * 48 = 144)
// Matches Discoverer1_idle.png dimensions exactly (192 x 144)
// Row 0: Idle (frames 0..3)
// Row 1: Walk (frames 4..7)
// Row 2: Attack / Action (frames 8..11)
const FRAME_W = 48;
const FRAME_H = 48;
const SHEET_W = FRAME_W * 4; // 192
const SHEET_H = FRAME_H * 3; // 144

type Color = [number, number, number, number]; // r, g, b, a

function createSheet(): PNG {
  return new PNG({ width: SHEET_W, height: SHEET_H });
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

function fillEllipse(png: PNG, cx: number, cy: number, rx: number, ry: number, color: Color) {
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        setPixel(png, Math.round(cx + dx), Math.round(cy + dy), color);
      }
    }
  }
}

function drawShadow(png: PNG, frameX: number, frameY: number, width = 16, height = 5) {
  const cx = frameX + 24;
  const cy = frameY + 43;
  fillEllipse(png, cx, cy, width, height, [15, 23, 42, 90]);
  fillEllipse(png, cx, cy, width - 4, height - 2, [15, 23, 42, 140]);
}

// ==========================================
// 1. KNIGHT GENERATOR (Professional Track)
// ==========================================
function generateKnight(): PNG {
  const png = createSheet();

  const C_DARK: Color = [30, 41, 59, 255];
  const C_STEEL_DARK: Color = [71, 85, 105, 255];
  const C_STEEL_MID: Color = [148, 163, 184, 255];
  const C_STEEL_LIGHT: Color = [226, 232, 240, 255];
  const C_BLUE_DARK: Color = [30, 58, 138, 255];
  const C_BLUE_MID: Color = [37, 99, 235, 255];
  const C_BLUE_LIGHT: Color = [96, 165, 250, 255];
  const C_GOLD: Color = [245, 158, 11, 255];
  const C_GOLD_LIGHT: Color = [253, 224, 71, 255];
  const C_SWORD: Color = [248, 250, 252, 255];
  const C_SLASH: Color = [186, 230, 253, 220];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const fx = col * FRAME_W;
      const fy = row * FRAME_H;

      let bobY = 0;
      let legOffset = 0;
      let capeFlutter = 0;
      let swordAngle = 0; // 0 = upright, 1 = raised, 2 = slash down, 3 = follow through

      if (row === 0) {
        // Idle
        if (col === 1) { bobY = -1; capeFlutter = 1; }
        else if (col === 2) { bobY = -1; capeFlutter = 2; }
        else if (col === 3) { bobY = 0; capeFlutter = 1; }
      } else if (row === 1) {
        // Walk
        if (col === 0) { legOffset = -2; bobY = 0; capeFlutter = 2; }
        else if (col === 1) { legOffset = 0; bobY = -1; capeFlutter = 1; }
        else if (col === 2) { legOffset = 2; bobY = 0; capeFlutter = 2; }
        else if (col === 3) { legOffset = 0; bobY = -1; capeFlutter = 1; }
      } else if (row === 2) {
        // Attack
        if (col === 0) { swordAngle = 1; bobY = -2; capeFlutter = 2; }
        else if (col === 1) { swordAngle = 2; bobY = 1; capeFlutter = 4; legOffset = 3; }
        else if (col === 2) { swordAngle = 3; bobY = 0; capeFlutter = 3; legOffset = 1; }
        else if (col === 3) { swordAngle = 0; bobY = -1; capeFlutter = 1; }
      }

      drawShadow(png, fx, fy, 14, 4);

      // Cape
      const capeX = fx + 16 - capeFlutter;
      fillRect(png, capeX, fy + 22 + bobY, 14 + capeFlutter, 18, C_BLUE_DARK);
      fillRect(png, capeX + 2, fy + 24 + bobY, 10 + capeFlutter, 15, C_BLUE_MID);
      fillRect(png, capeX + 4, fy + 26 + bobY, 6, 12, C_BLUE_LIGHT);

      // Legs
      const legY = fy + 33 + bobY;
      fillRect(png, fx + 19, legY + (legOffset < 0 ? -1 : 0), 4, 9, C_STEEL_MID);
      fillRect(png, fx + 18, legY + 7 + (legOffset < 0 ? -1 : 0), 5, 3, C_STEEL_DARK);
      fillRect(png, fx + 25, legY + (legOffset > 0 ? -1 : 0), 4, 9, C_STEEL_MID);
      fillRect(png, fx + 25, legY + 7 + (legOffset > 0 ? -1 : 0), 5, 3, C_STEEL_DARK);

      // Torso & Breastplate
      const torsoY = fy + 21 + bobY;
      fillRect(png, fx + 18, torsoY, 12, 13, C_DARK);
      fillRect(png, fx + 19, torsoY + 1, 10, 11, C_STEEL_MID);
      fillRect(png, fx + 20, torsoY + 2, 8, 5, C_STEEL_LIGHT);
      fillRect(png, fx + 23, torsoY + 4, 2, 4, C_GOLD);
      fillRect(png, fx + 22, torsoY + 5, 4, 2, C_GOLD_LIGHT);
      fillRect(png, fx + 19, torsoY + 10, 10, 2, C_DARK);
      setPixel(png, fx + 23, torsoY + 10, C_GOLD);
      setPixel(png, fx + 24, torsoY + 10, C_GOLD);

      // Shoulders
      fillRect(png, fx + 16, torsoY + 1, 4, 5, C_STEEL_LIGHT);
      fillRect(png, fx + 16, torsoY + 4, 4, 2, C_STEEL_DARK);
      fillRect(png, fx + 28, torsoY + 1, 4, 5, C_STEEL_LIGHT);
      fillRect(png, fx + 28, torsoY + 4, 4, 2, C_STEEL_DARK);

      // Helmet & Plume
      const headY = fy + 9 + bobY;
      fillRect(png, fx + 23, headY - 3, 3, 4, C_BLUE_MID);
      fillRect(png, fx + 24, headY - 4, 3, 3, C_BLUE_LIGHT);
      setPixel(png, fx + 25, headY - 5, C_BLUE_LIGHT);
      fillRect(png, fx + 19, headY, 10, 12, C_DARK);
      fillRect(png, fx + 20, headY + 1, 8, 10, C_STEEL_MID);
      fillRect(png, fx + 21, headY + 2, 6, 4, C_STEEL_LIGHT);
      fillRect(png, fx + 21, headY + 6, 6, 2, C_DARK);
      setPixel(png, fx + 22, headY + 6, [56, 189, 248, 255]);
      setPixel(png, fx + 25, headY + 6, [56, 189, 248, 255]);
      setPixel(png, fx + 23, headY + 4, C_GOLD);
      setPixel(png, fx + 24, headY + 4, C_GOLD);

      // Shield
      const shieldY = fy + 22 + bobY;
      fillRect(png, fx + 12, shieldY, 7, 12, C_GOLD);
      fillRect(png, fx + 13, shieldY + 1, 5, 10, C_BLUE_MID);
      fillRect(png, fx + 14, shieldY + 3, 3, 6, C_GOLD_LIGHT);
      setPixel(png, fx + 14, shieldY + 11, C_GOLD);

      // Sword & Arms based on swordAngle
      const swordY = fy + 12 + bobY;
      if (swordAngle === 0) {
        // Upright stance
        fillRect(png, fx + 32, swordY + 18, 2, 4, [120, 53, 15, 255]);
        setPixel(png, fx + 32, swordY + 22, C_GOLD);
        fillRect(png, fx + 30, swordY + 17, 6, 2, C_GOLD);
        fillRect(png, fx + 32, swordY + 2, 2, 15, C_SWORD);
        fillRect(png, fx + 33, swordY + 3, 1, 13, [203, 213, 225, 255]);
        setPixel(png, fx + 32, swordY + 1, C_SWORD);
        fillRect(png, fx + 29, swordY + 14, 3, 4, C_STEEL_MID);
      } else if (swordAngle === 1) {
        // Raised high ready to strike
        fillRect(png, fx + 30, swordY + 8, 2, 4, [120, 53, 15, 255]);
        fillRect(png, fx + 28, swordY + 7, 6, 2, C_GOLD);
        fillRect(png, fx + 30, swordY - 8, 2, 15, C_SWORD);
        setPixel(png, fx + 30, swordY - 9, C_SWORD);
        fillRect(png, fx + 28, swordY + 10, 4, 4, C_STEEL_MID);
      } else if (swordAngle === 2) {
        // Full slash horizontal arc!
        fillRect(png, fx + 31, swordY + 12, 4, 3, [120, 53, 15, 255]);
        fillRect(png, fx + 33, swordY + 10, 2, 6, C_GOLD);
        fillRect(png, fx + 35, swordY + 12, 12, 2, C_SWORD);
        fillRect(png, fx + 35, swordY + 11, 10, 1, [255, 255, 255, 255]);
        // Slash Trail
        fillRect(png, fx + 26, swordY + 5, 20, 3, C_SLASH);
        fillRect(png, fx + 32, swordY + 8, 14, 2, [255, 255, 255, 220]);
      } else if (swordAngle === 3) {
        // Follow-through down
        fillRect(png, fx + 32, swordY + 18, 2, 4, [120, 53, 15, 255]);
        fillRect(png, fx + 30, swordY + 17, 6, 2, C_GOLD);
        fillRect(png, fx + 32, swordY + 19, 2, 12, C_SWORD);
        fillRect(png, fx + 29, swordY + 14, 3, 4, C_STEEL_MID);
      }
    }
  }

  return png;
}

// ==========================================
// 2. MAGE GENERATOR (Social Impact Track)
// ==========================================
function generateMage(): PNG {
  const png = createSheet();

  const C_DARK: Color = [2, 44, 34, 255];
  const C_MAGE_DARK: Color = [4, 120, 87, 255];
  const C_MAGE_MID: Color = [16, 185, 129, 255];
  const C_MAGE_LIGHT: Color = [110, 231, 183, 255];
  const C_CREAM: Color = [254, 243, 199, 255];
  const C_STAFF: Color = [120, 53, 15, 255];
  const C_MANA_CORE: Color = [255, 255, 255, 255];
  const C_MANA_CYAN: Color = [56, 189, 248, 255];
  const C_MANA_GLOW: Color = [103, 232, 249, 180];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const fx = col * FRAME_W;
      const fy = row * FRAME_H;

      let bobY = 0;
      let robeFlow = 0;
      let manaPulse = 0;
      let isCasting = row === 2;

      if (row === 0) {
        if (col === 1) { bobY = -1; robeFlow = 1; manaPulse = 1; }
        else if (col === 2) { bobY = -1; robeFlow = 2; manaPulse = 2; }
        else if (col === 3) { bobY = 0; robeFlow = 1; manaPulse = 1; }
      } else if (row === 1) {
        if (col === 0) { robeFlow = -1; bobY = 0; manaPulse = 1; }
        else if (col === 1) { robeFlow = 1; bobY = -1; manaPulse = 2; }
        else if (col === 2) { robeFlow = 2; bobY = 0; manaPulse = 1; }
        else if (col === 3) { robeFlow = 0; bobY = -1; manaPulse = 2; }
      } else if (row === 2) {
        // Casting spell attack!
        if (col === 0) { bobY = -1; manaPulse = 2; robeFlow = 1; }
        else if (col === 1) { bobY = -2; manaPulse = 4; robeFlow = 3; }
        else if (col === 2) { bobY = 0; manaPulse = 3; robeFlow = 2; }
        else if (col === 3) { bobY = -1; manaPulse = 1; robeFlow = 1; }
      }

      drawShadow(png, fx, fy, 15, 5);

      // Robes
      const skirtY = fy + 27 + bobY;
      fillRect(png, fx + 16 - robeFlow, skirtY, 16 + Math.abs(robeFlow), 15, C_MAGE_DARK);
      fillRect(png, fx + 18, skirtY + 1, 12, 13, C_MAGE_MID);
      fillRect(png, fx + 22, skirtY + 2, 4, 12, C_CREAM);
      fillRect(png, fx + 23, skirtY + 3, 2, 10, [251, 191, 36, 255]);

      // Torso
      const torsoY = fy + 20 + bobY;
      fillRect(png, fx + 18, torsoY, 12, 8, C_DARK);
      fillRect(png, fx + 19, torsoY + 1, 10, 7, C_MAGE_MID);
      fillRect(png, fx + 22, torsoY + 1, 4, 7, C_CREAM);
      setPixel(png, fx + 23, torsoY + 4, C_MANA_CYAN);
      setPixel(png, fx + 24, torsoY + 4, C_MANA_CORE);

      // Hood & Glowing Eyes
      const headY = fy + 9 + bobY;
      fillRect(png, fx + 18, headY, 12, 12, C_DARK);
      fillRect(png, fx + 19, headY + 1, 10, 10, C_MAGE_DARK);
      fillRect(png, fx + 20, headY + 2, 8, 8, [6, 78, 59, 255]);
      fillRect(png, fx + 21, headY + 5, 6, 5, [15, 23, 42, 255]);
      setPixel(png, fx + 22, headY + 7, C_MANA_CYAN);
      setPixel(png, fx + 25, headY + 7, C_MANA_CYAN);
      setPixel(png, fx + 22, headY + 6, C_MANA_CORE);
      setPixel(png, fx + 25, headY + 6, C_MANA_CORE);

      // Book
      const bookY = fy + 24 + bobY - (manaPulse > 0 ? 1 : 0);
      fillRect(png, fx + 12, bookY, 5, 7, [3, 105, 161, 255]);
      fillRect(png, fx + 13, bookY + 1, 3, 5, C_CREAM);
      setPixel(png, fx + 14, bookY + 3, [217, 119, 6, 255]);
      if (manaPulse > 0) {
        setPixel(png, fx + 14, bookY - 2, C_MANA_CYAN);
        setPixel(png, fx + 13, bookY - 3, C_MANA_CORE);
      }

      // Staff & Spell effects
      const staffY = fy + 8 + bobY - (isCasting && col === 1 ? 4 : 0);
      fillRect(png, fx + 33, staffY + 8, 2, 28, C_STAFF);
      fillRect(png, fx + 32, staffY + 6, 4, 3, [146, 64, 14, 255]);
      fillRect(png, fx + 31, staffY + 4, 6, 2, [180, 83, 9, 255]);

      const orbY = staffY + (manaPulse >= 2 ? -2 : 0);
      const orbRadius = Math.min(6, 3 + manaPulse);
      fillEllipse(png, fx + 34, orbY, orbRadius + 1, orbRadius + 1, C_MANA_GLOW);
      fillEllipse(png, fx + 34, orbY, orbRadius, orbRadius, C_MANA_CYAN);
      fillRect(png, fx + 33, orbY - 1, 2, 2, C_MANA_CORE);

      // Burst rings during casting attack
      if (isCasting && col === 1) {
        fillEllipse(png, fx + 34, orbY, 9, 9, [103, 232, 249, 120]);
        fillEllipse(png, fx + 34, orbY, 6, 6, [255, 255, 255, 200]);
        // Magic ray blast forward
        fillRect(png, fx + 36, orbY - 2, 10, 4, C_MANA_CYAN);
        fillRect(png, fx + 38, orbY - 1, 8, 2, C_MANA_CORE);
      }
    }
  }

  return png;
}

// ==========================================
// 3. ASSASSIN GENERATOR (Business Track)
// ==========================================
function generateAssassin(): PNG {
  const png = createSheet();

  const C_DARK: Color = [24, 24, 27, 255];
  const C_LEATHER: Color = [39, 39, 42, 255];
  const C_CRIMSON_DARK: Color = [136, 19, 55, 255];
  const C_CRIMSON_MID: Color = [190, 18, 60, 255];
  const C_CRIMSON_LIGHT: Color = [244, 63, 94, 255];
  const C_GOLD: Color = [245, 158, 11, 255];
  const C_GOLD_LIGHT: Color = [253, 224, 71, 255];
  const C_STEEL: Color = [241, 245, 249, 255];
  const C_EYE: Color = [251, 191, 36, 255];
  const C_SLASH: Color = [254, 205, 211, 220];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const fx = col * FRAME_W;
      const fy = row * FRAME_H;

      let bobY = 0;
      let scarfFlutter = 0;
      let stride = 0;
      let isStrike = row === 2;

      if (row === 0) {
        if (col === 1) { bobY = 1; scarfFlutter = 1; }
        else if (col === 2) { bobY = 0; scarfFlutter = 2; }
        else if (col === 3) { bobY = 1; scarfFlutter = 1; }
      } else if (row === 1) {
        if (col === 0) { stride = -3; bobY = 1; scarfFlutter = 3; }
        else if (col === 1) { stride = 0; bobY = 0; scarfFlutter = 2; }
        else if (col === 2) { stride = 3; bobY = 1; scarfFlutter = 3; }
        else if (col === 3) { stride = 0; bobY = 0; scarfFlutter = 2; }
      } else if (row === 2) {
        // Dual dagger strike!
        if (col === 0) { bobY = 2; stride = -2; scarfFlutter = 3; }
        else if (col === 1) { bobY = 1; stride = 4; scarfFlutter = 5; } // lunging cross-slash
        else if (col === 2) { bobY = 0; stride = 1; scarfFlutter = 4; }
        else if (col === 3) { bobY = 1; stride = 0; scarfFlutter = 2; }
      }

      drawShadow(png, fx, fy, 13, 4);

      // Scarf
      const scarfX = fx + 15 - scarfFlutter;
      const scarfY = fy + 17 + bobY;
      fillRect(png, scarfX, scarfY, 6 + scarfFlutter, 4, C_CRIMSON_DARK);
      fillRect(png, scarfX + 1, scarfY + 1, 5 + scarfFlutter, 2, C_CRIMSON_MID);
      setPixel(png, scarfX + 2, scarfY + 2, C_CRIMSON_LIGHT);

      // Legs
      const legY = fy + 33 + bobY;
      fillRect(png, fx + 19 + stride, legY, 3, 9, C_DARK);
      fillRect(png, fx + 25 - stride, legY, 3, 9, C_DARK);
      fillRect(png, fx + 18 + stride, legY + 7, 4, 3, C_LEATHER);
      fillRect(png, fx + 25 - stride, legY + 7, 4, 3, C_LEATHER);

      // Cuirass
      const torsoY = fy + 21 + bobY;
      fillRect(png, fx + 18, torsoY, 11, 12, C_DARK);
      fillRect(png, fx + 19, torsoY + 1, 9, 10, C_CRIMSON_MID);
      fillRect(png, fx + 20, torsoY + 2, 7, 4, C_CRIMSON_LIGHT);
      fillRect(png, fx + 19, torsoY + 2, 2, 8, C_LEATHER);
      fillRect(png, fx + 25, torsoY + 4, 2, 6, C_LEATHER);
      fillRect(png, fx + 18, torsoY + 9, 11, 2, C_LEATHER);
      setPixel(png, fx + 23, torsoY + 9, C_GOLD);
      setPixel(png, fx + 24, torsoY + 9, C_GOLD_LIGHT);
      setPixel(png, fx + 18, torsoY + 11, C_GOLD);
      setPixel(png, fx + 19, torsoY + 11, C_GOLD);

      // Cowl / Mask
      const headY = fy + 10 + bobY;
      fillRect(png, fx + 19, headY, 10, 11, C_DARK);
      fillRect(png, fx + 20, headY + 1, 8, 9, C_CRIMSON_DARK);
      fillRect(png, fx + 21, headY + 5, 6, 5, C_DARK);
      setPixel(png, fx + 22, headY + 5, C_EYE);
      setPixel(png, fx + 25, headY + 5, C_EYE);
      setPixel(png, fx + 23, headY + 4, [254, 240, 138, 255]);

      // Daggers
      const rDaggerY = fy + 20 + bobY;
      const lDaggerY = fy + 22 + bobY;

      if (!isStrike || col !== 1) {
        // Normal ready pose
        fillRect(png, fx + 29, rDaggerY + 4, 3, 3, [240, 186, 126, 255]);
        fillRect(png, fx + 31, rDaggerY + 3, 3, 2, C_GOLD);
        fillRect(png, fx + 32, rDaggerY + 5, 2, 8, C_STEEL);
        setPixel(png, fx + 33, rDaggerY + 13, C_STEEL);
        setPixel(png, fx + 32, rDaggerY + 6, [255, 255, 255, 255]);

        fillRect(png, fx + 15, lDaggerY + 3, 3, 3, [240, 186, 126, 255]);
        fillRect(png, fx + 13, lDaggerY + 2, 3, 2, C_GOLD);
        fillRect(png, fx + 13, lDaggerY + 4, 2, 7, C_STEEL);
        setPixel(png, fx + 14, lDaggerY + 11, C_STEEL);
        setPixel(png, fx + 13, lDaggerY + 5, [255, 255, 255, 255]);
      } else {
        // Dual cross-strike lunge!
        fillRect(png, fx + 32, rDaggerY + 2, 3, 3, [240, 186, 126, 255]);
        fillRect(png, fx + 35, rDaggerY + 1, 2, 3, C_GOLD);
        fillRect(png, fx + 37, rDaggerY - 4, 8, 2, C_STEEL);
        // Left dagger thrust
        fillRect(png, fx + 29, lDaggerY + 6, 3, 3, [240, 186, 126, 255]);
        fillRect(png, fx + 32, lDaggerY + 6, 2, 3, C_GOLD);
        fillRect(png, fx + 34, lDaggerY + 8, 10, 2, C_STEEL);
        // Cross slash arcs
        fillRect(png, fx + 35, rDaggerY - 3, 11, 2, C_SLASH);
        fillRect(png, fx + 33, lDaggerY + 7, 12, 2, C_SLASH);
      }
    }
  }

  return png;
}

const outDir = path.resolve('public/assets/dungeon');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'hero_knight_spritesheet.png'), PNG.sync.write(generateKnight()));
console.log('Generated 192x144 hero_knight_spritesheet.png (Idle, Walk, Attack)');

fs.writeFileSync(path.join(outDir, 'hero_mage_spritesheet.png'), PNG.sync.write(generateMage()));
console.log('Generated 192x144 hero_mage_spritesheet.png (Idle, Walk, Attack)');

fs.writeFileSync(path.join(outDir, 'hero_assassin_spritesheet.png'), PNG.sync.write(generateAssassin()));
console.log('Generated 192x144 hero_assassin_spritesheet.png (Idle, Walk, Attack)');
