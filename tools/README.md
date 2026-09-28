# 2D Map Editor (Pygame GUI)

A local 2D Map Editor with a **16x16 Grid**, tile sheet palette, **Solid Collision Overlay**, and **JSON save/load**.

![Map Editor Preview](file:///home/fauzan/.gemini/antigravity-ide/brain/c5c324ac-e1de-455e-852d-89a48a7fa6bd/map_editor_preview.png)

## Quick Start

Run the editor directly from your terminal:
```bash
python tools/map_editor.py
```
*(or `./tools/map_editor.py`)*

---

## Key Features

1. **Tilesheet Loader & Palette**:
   - Loads PNG/JPG/BMP tilesets cleanly using Pillow/Pygame.
   - Slices tilesets into selectable tile swatches.
   - Quick switcher for project tilesets (`Walls_floor.png`, `custom_unified_world.png`, `Tiles_exterior.png`, `Objects_interior.png`).
   - "Custom PNG..." button opens native file chooser (Zenity) to load any image.
   - Toggle slicing size: `16x16`, `32x32`, `64x64`.

2. **16x16 Grid Canvas**:
   - Interactive 16x16 grid with column/row coordinate guides (0 to 15).
   - Drag-and-drop or click-stamp painting.
   - Right-click to erase tiles.

3. **Solid Collision Tiles**:
   - Toggle to **Solid Collision Mode** (`Key 2` or button).
   - Left-click on any tile to toggle the **Red Rectangle Overlay** (`rgba(220, 38, 38, 0.55)` with bold red borders and collision badge).
   - Click & drag to quickly mark corridors, walls, or rooms.
   - Right-click or drag to clear collisions.
   - "Border Walls" button instantly sets outer boundary walls (perimeter) as solid!

4. **JSON Save & Load**:
   - **Save JSON (`Ctrl+S` / Button)**: Saves output to `public/assets/maps/map_16x16.json` (or custom name).
   - **Load JSON (`Ctrl+O` / Button)**: Reloads existing maps for quick re-editing.

---

## JSON Format

The exported JSON file looks like this:

```json
{
  "version": "1.0",
  "generator": "Antigravity 2D Map Editor",
  "timestamp": "2026-09-26T12:55:12.943142",
  "mapWidth": 16,
  "mapHeight": 16,
  "tileSize": 16,
  "tilesheet": "Walls_floor.png",
  "stats": {
    "totalCells": 256,
    "solidTileCount": 64,
    "placedTileCount": 256
  },
  "collisionTiles": [
    { "x": 0, "y": 0 },
    { "x": 1, "y": 0 },
    ...
  ],
  "layers": {
    "ground": [
      [0, 0, 0, ...],
      ...
    ],
    "collision": [
      [1, 1, 1, ...],
      ...
    ]
  },
  "tiles": [
    { "x": 0, "y": 0, "tileIndex": 0, "solid": true },
    ...
  ]
}
```

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `1` or `P` | Switch to **Paint Mode** |
| `2` or `C` | Switch to **Solid Collision Mode** |
| `G` | Toggle grid lines |
| `H` | Toggle collision overlay visibility |
| `Ctrl + S` | Save map to JSON |
| `Ctrl + O` | Open / Load map from JSON |
| `Mouse Wheel` | Scroll through palette pages |
