#!/usr/bin/env python3
"""
Antigravity 2D Map Editor
=========================
A local Python Pygame GUI application for creating and editing 16x16 2D tile maps.

Features:
- Load generated tile sheets (PNG, JPG, BMP, etc. via Pillow/Pygame).
- Quick switcher for project tilesets (Walls_floor, custom_unified_world, Tiles_exterior, etc.) or custom files.
- Interactive 16x16 Grid Canvas with coordinate guides.
- Drag-and-drop & stamp painting with selected tiles.
- 'Solid Collision Tile' mode: Left-click toggles a red rectangle overlay to manually define them as 'Solid Collision Tiles'.
- Save & Load maps to/from clean JSON files compatible with Phaser and 2D game engines.
- Fill border collisions, clear grid, toggle collision overlay visibility, zoom & palette navigation.

Usage:
    python tools/map_editor.py
"""

import sys
import os
import json
import subprocess
from datetime import datetime

# Image & Font handling via Pillow (avoids any missing SDL2_image or SDL2_ttf dependency issues)
from PIL import Image, ImageDraw, ImageFont
import pygame

# Initialize Pygame base
pygame.init()

# ----------------- TrueType Font Wrapper (Zero-Dependency) -----------------
SYSTEM_FONTS = {
    "sans_bold": "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
    "sans_regular": "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
    "mono_regular": "/usr/share/fonts/liberation/LiberationMono-Regular.ttf",
    "mono_bold": "/usr/share/fonts/liberation/LiberationMono-Bold.ttf"
}

class FontWrapper:
    def __init__(self, font_type="sans_regular", size=14):
        self.size = size
        font_path = SYSTEM_FONTS.get(font_type, "")
        if os.path.exists(font_path):
            self.font = ImageFont.truetype(font_path, size)
        else:
            try:
                self.font = ImageFont.load_default()
            except Exception:
                self.font = None
        self._cache = {}

    def render(self, text, antialias=True, color=(255, 255, 255)):
        key = (text, color)
        if key in self._cache:
            return self._cache[key]

        if not text:
            surf = pygame.Surface((1, 1), pygame.SRCALPHA)
            self._cache[key] = surf
            return surf

        bbox = self.font.getbbox(text) if hasattr(self.font, "getbbox") else (0, 0, len(text) * 8, self.size)
        w = max(1, bbox[2] - bbox[0] + 6)
        h = max(1, bbox[3] - bbox[1] + 6)

        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw.text((3 - bbox[0], 3 - bbox[1]), text, fill=color, font=self.font)

        surf = pygame.image.frombytes(img.tobytes(), (w, h), "RGBA")
        self._cache[key] = surf
        return surf


# ----------------- Configuration & Dimensions -----------------
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 820
GRID_SIZE = 16          # 16x16 grid
DEFAULT_TILE_SIZE = 16  # Default 16x16 pixels per tile for dungeon assets
CELL_DRAW_SIZE = 40     # On-screen pixel size for each cell in the 16x16 grid
GRID_PIXEL_SIZE = GRID_SIZE * CELL_DRAW_SIZE  # 640 x 640 px
GRID_OFFSET_X = 50
GRID_OFFSET_Y = 110

# Color Palette (Dark Slate Pro Theme)
COLOR_BG = (15, 23, 42)          # Slate-900
COLOR_PANEL_BG = (30, 41, 59)    # Slate-800
COLOR_PANEL_BORDER = (51, 65, 85)# Slate-700
COLOR_HEADER_BG = (11, 17, 32)
COLOR_GRID_BG_A = (24, 32, 47)
COLOR_GRID_BG_B = (19, 26, 38)
COLOR_GRID_LINES = (51, 65, 85)
COLOR_GRID_COORD = (148, 163, 184)
COLOR_TEXT_MAIN = (248, 250, 252)
COLOR_TEXT_MUTED = (148, 163, 184)
COLOR_ACCENT_BLUE = (59, 130, 246)
COLOR_ACCENT_GREEN = (34, 197, 94)
COLOR_ACCENT_GOLD = (234, 179, 8)
COLOR_DANGER_RED = (239, 68, 68)

# Collision Overlay Colors
COLOR_COLLISION_FILL = (220, 38, 38, 140)   # Semi-transparent red
COLOR_COLLISION_BORDER = (248, 113, 113)    # Bright red border

# Asset paths
WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(WORKSPACE_DIR, "public", "assets", "dungeon")
DEFAULT_MAPS_DIR = os.path.join(WORKSPACE_DIR, "public", "assets", "maps")
os.makedirs(DEFAULT_MAPS_DIR, exist_ok=True)

DEFAULT_TILESETS = [
    {"name": "Walls_floor.png", "size": 16},
    {"name": "custom_unified_world.png", "size": 32},
    {"name": "Tiles_exterior.png", "size": 16},
    {"name": "Objects_interior.png", "size": 16},
    {"name": "Exterior_objects.png", "size": 16},
    {"name": "Trees_grass_alternative_fit.png", "size": 16},
    {"name": "Water_coasts.png", "size": 16}
]


def load_surface_universal(filepath):
    """Loads any image file into a Pygame Surface using Pillow."""
    if not os.path.exists(filepath):
        print(f"[Error] File not found: {filepath}")
        return None
    try:
        img = Image.open(filepath).convert("RGBA")
        data = img.tobytes()
        size = img.size
        return pygame.image.frombytes(data, size, "RGBA")
    except Exception as e:
        print(f"[Error] Could not load image {filepath}: {e}")
        return None


def open_native_file_dialog(title="Choose File", file_filter="*.*", save=False):
    """Uses zenity for native file selection dialog if available."""
    try:
        cmd = ["zenity", "--file-selection", f"--title={title}"]
        if save:
            cmd.append("--save")
            cmd.append("--confirm-overwrite")
        if file_filter:
            cmd.append(f"--file-filter={file_filter}")
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None


class MapEditor:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.RESIZABLE)
        pygame.display.set_caption("2D Map Editor - 16x16 Grid with Collision Overlay")

        self.clock = pygame.time.Clock()
        self.running = True

        # TrueType Fonts
        self.font_title = FontWrapper("sans_bold", 20)
        self.font_bold = FontWrapper("sans_bold", 14)
        self.font_regular = FontWrapper("sans_regular", 13)
        self.font_small = FontWrapper("mono_regular", 11)
        self.font_tiny = FontWrapper("mono_bold", 10)

        # Editor State
        self.mode = "PAINT"  # "PAINT" or "COLLISION"
        self.show_collision = True
        self.show_grid_lines = True
        self.status_message = "Ready. Select a tile from the palette and click or drag on the 16x16 grid."
        self.status_time = pygame.time.get_ticks()

        # Grid Data: 16x16
        self.grid_tiles = [[None for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
        self.grid_solid = [[False for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]

        # Tileset Configuration
        self.current_tileset_idx = 0
        cfg = DEFAULT_TILESETS[0]
        self.tile_size = cfg["size"]
        self.tileset_filename = cfg["name"]
        self.tileset_path = os.path.join(ASSETS_DIR, self.tileset_filename)

        self.tileset_surface = None
        self.tiles = []            # list of extracted Pygame Surfaces
        self.tile_coords = []       # list of (col, row) coordinates in sheet
        self.selected_tile_idx = 0
        self.palette_page = 0
        self.palette_cols = 8
        self.palette_rows = 5
        self.palette_tile_draw_size = 46

        # Current save file path
        self.current_json_path = os.path.join(DEFAULT_MAPS_DIR, "map_16x16.json")

        # Load default tileset
        self.load_tileset(self.tileset_path, self.tile_size)

        # Mouse Tracking
        self.is_mouse_down = False
        self.mouse_button = 0

    def set_status(self, text, duration_ms=4000):
        self.status_message = text
        self.status_time = pygame.time.get_ticks() + duration_ms

    def load_tileset(self, filepath, tile_size=16):
        """Loads a tileset image and cuts it into a list of tile surfaces."""
        self.tile_size = tile_size
        self.tileset_path = filepath
        self.tileset_filename = os.path.basename(filepath)
        surf = load_surface_universal(filepath)
        if surf is None:
            self.set_status(f"Failed to load tileset: {os.path.basename(filepath)}")
            return False

        self.tileset_surface = surf
        ts_w, ts_h = surf.get_size()
        cols = ts_w // tile_size
        rows = ts_h // tile_size

        self.tiles = []
        self.tile_coords = []
        for r in range(rows):
            for c in range(cols):
                rect = pygame.Rect(c * tile_size, r * tile_size, tile_size, tile_size)
                tile_surf = pygame.Surface((tile_size, tile_size), pygame.SRCALPHA)
                tile_surf.blit(surf, (0, 0), rect)
                self.tiles.append(tile_surf)
                self.tile_coords.append((c, r))

        self.selected_tile_idx = 0 if self.tiles else None
        self.palette_page = 0
        self.set_status(f"Loaded tileset '{self.tileset_filename}' ({cols}x{rows} = {len(self.tiles)} tiles, size: {tile_size}px)")
        return True

    def get_palette_tiles_per_page(self):
        return self.palette_cols * self.palette_rows

    def save_map_json(self, filepath=None):
        """Saves the 16x16 map and solid collision flags to a clean JSON file."""
        if not filepath:
            filepath = self.current_json_path

        collision_tiles = []
        solid_count = 0
        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                if self.grid_solid[y][x]:
                    collision_tiles.append({"x": x, "y": y})
                    solid_count += 1

        ground_matrix = []
        collision_matrix = []
        tiles_list = []

        for y in range(GRID_SIZE):
            ground_row = []
            col_row = []
            for x in range(GRID_SIZE):
                t_idx = self.grid_tiles[y][x]
                is_solid = self.grid_solid[y][x]

                ground_row.append(t_idx if t_idx is not None else -1)
                col_row.append(1 if is_solid else 0)

                if t_idx is not None or is_solid:
                    tiles_list.append({
                        "x": x,
                        "y": y,
                        "tileIndex": t_idx,
                        "solid": is_solid
                    })
            ground_matrix.append(ground_row)
            collision_matrix.append(col_row)

        data = {
            "version": "1.0",
            "generator": "Antigravity 2D Map Editor",
            "timestamp": datetime.now().isoformat(),
            "mapWidth": GRID_SIZE,
            "mapHeight": GRID_SIZE,
            "tileSize": self.tile_size,
            "tilesheet": self.tileset_filename,
            "stats": {
                "totalCells": GRID_SIZE * GRID_SIZE,
                "solidTileCount": solid_count,
                "placedTileCount": sum(1 for y in range(GRID_SIZE) for x in range(GRID_SIZE) if self.grid_tiles[y][x] is not None)
            },
            "collisionTiles": collision_tiles,
            "layers": {
                "ground": ground_matrix,
                "collision": collision_matrix
            },
            "tiles": tiles_list
        }

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            self.current_json_path = filepath
            self.set_status(f"Saved to '{os.path.basename(filepath)}' ({solid_count} collision tiles)!")
            print(f"[MapEditor] Saved to {filepath}")
            return True
        except Exception as e:
            self.set_status(f"Error saving JSON: {e}")
            print(f"[MapEditor Error] {e}")
            return False

    def load_map_json(self, filepath):
        """Loads a saved map JSON file and updates the grid and collision overlays."""
        if not os.path.exists(filepath):
            self.set_status(f"File not found: {filepath}")
            return False

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            sheet_name = data.get("tilesheet", self.tileset_filename)
            t_size = data.get("tileSize", self.tile_size)
            target_sheet_path = os.path.join(ASSETS_DIR, sheet_name)
            if os.path.exists(target_sheet_path):
                self.load_tileset(target_sheet_path, t_size)

            self.grid_tiles = [[None for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
            self.grid_solid = [[False for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]

            layers = data.get("layers", {})
            if "ground" in layers:
                for y, row in enumerate(layers["ground"][:GRID_SIZE]):
                    for x, val in enumerate(row[:GRID_SIZE]):
                        self.grid_tiles[y][x] = val if val != -1 and val < len(self.tiles) else None

            if "collision" in layers:
                for y, row in enumerate(layers["collision"][:GRID_SIZE]):
                    for x, val in enumerate(row[:GRID_SIZE]):
                        self.grid_solid[y][x] = bool(val)
            elif "collisionTiles" in data:
                for ct in data["collisionTiles"]:
                    x, y = ct.get("x", 0), ct.get("y", 0)
                    if 0 <= x < GRID_SIZE and 0 <= y < GRID_SIZE:
                        self.grid_solid[y][x] = True

            self.current_json_path = filepath
            solid_count = sum(sum(1 for val in row if val) for row in self.grid_solid)
            self.set_status(f"Loaded '{os.path.basename(filepath)}' ({solid_count} collision tiles)!")
            return True
        except Exception as e:
            self.set_status(f"Error loading JSON: {e}")
            print(f"[MapEditor Error] {e}")
            return False

    def get_grid_cell_under_mouse(self, mouse_pos):
        mx, my = mouse_pos
        gx = (mx - GRID_OFFSET_X) // CELL_DRAW_SIZE
        gy = (my - GRID_OFFSET_Y) // CELL_DRAW_SIZE
        if 0 <= gx < GRID_SIZE and 0 <= gy < GRID_SIZE:
            return gx, gy
        return None, None

    def apply_tool(self, gx, gy, button):
        """Applies painting or collision toggle based on active mode."""
        if not (0 <= gx < GRID_SIZE and 0 <= gy < GRID_SIZE):
            return

        if self.mode == "PAINT":
            if button == 1:  # Left Click: Paint tile
                self.grid_tiles[gy][gx] = self.selected_tile_idx
            elif button == 3:  # Right Click: Erase tile
                self.grid_tiles[gy][gx] = None

        elif self.mode == "COLLISION":
            if button == 1:  # Left Click: Toggle Solid Collision
                self.grid_solid[gy][gx] = not self.grid_solid[gy][gx]
            elif button == 3:  # Right Click: Unset Solid Collision
                self.grid_solid[gy][gx] = False

    def fill_all_tiles(self):
        if self.selected_tile_idx is None:
            return
        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                self.grid_tiles[y][x] = self.selected_tile_idx
        self.set_status(f"Filled all 16x16 cells with Tile #{self.selected_tile_idx}")

    def clear_all_tiles(self):
        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                self.grid_tiles[y][x] = None
        self.set_status("Cleared all tiles from grid.")

    def fill_border_collisions(self):
        count = 0
        for x in range(GRID_SIZE):
            self.grid_solid[0][x] = True
            self.grid_solid[GRID_SIZE - 1][x] = True
            count += 2
        for y in range(1, GRID_SIZE - 1):
            self.grid_solid[y][0] = True
            self.grid_solid[y][GRID_SIZE - 1] = True
            count += 2
        self.set_status(f"Added perimeter collision boundary ({count} solid tiles)!")

    def clear_all_collisions(self):
        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                self.grid_solid[y][x] = False
        self.set_status("Cleared all collision markers.")

    def draw_button(self, rect, text, is_active=False, is_danger=False, is_accent=False, tooltip=""):
        mouse_pos = pygame.mouse.get_pos()
        hovered = rect.collidepoint(mouse_pos)

        if is_danger:
            base_col = (220, 38, 38) if is_active else (153, 27, 27)
            hover_col = (239, 68, 68)
            text_col = (255, 255, 255)
        elif is_accent:
            base_col = (22, 101, 52) if is_active else (21, 128, 61)
            hover_col = (34, 197, 94)
            text_col = (255, 255, 255)
        elif is_active:
            base_col = (37, 99, 235)
            hover_col = (59, 130, 246)
            text_col = (255, 255, 255)
        else:
            base_col = (51, 65, 85)
            hover_col = (71, 85, 105)
            text_col = (248, 250, 252)

        bg_col = hover_col if hovered else base_col
        border_col = (255, 255, 255) if is_active else (100, 116, 139)

        pygame.draw.rect(self.screen, bg_col, rect, border_radius=6)
        pygame.draw.rect(self.screen, border_col, rect, width=2 if is_active else 1, border_radius=6)

        label_surf = self.font_bold.render(text, True, text_col)
        lx = rect.x + (rect.width - label_surf.get_width()) // 2
        ly = rect.y + (rect.height - label_surf.get_height()) // 2
        self.screen.blit(label_surf, (lx, ly))

        return hovered

    def render(self):
        self.screen.fill(COLOR_BG)
        mouse_pos = pygame.mouse.get_pos()

        # =========================================================
        # 1. TOP HEADER BAR
        # =========================================================
        header_rect = pygame.Rect(0, 0, WINDOW_WIDTH, 60)
        pygame.draw.rect(self.screen, COLOR_HEADER_BG, header_rect)
        pygame.draw.line(self.screen, COLOR_PANEL_BORDER, (0, 60), (WINDOW_WIDTH, 60), 2)

        title_surf = self.font_title.render("ANTIGRAVITY 2D MAP EDITOR", True, COLOR_TEXT_MAIN)
        self.screen.blit(title_surf, (24, 18))

        sub_surf = self.font_small.render("16x16 Grid  •  Solid Collision Overlay  •  Phaser JSON Exporter", True, COLOR_TEXT_MUTED)
        self.screen.blit(sub_surf, (360, 24))

        # Mode Indicator Pill in Header
        mode_pill_rect = pygame.Rect(WINDOW_WIDTH - 380, 14, 350, 32)
        pygame.draw.rect(self.screen, (24, 32, 47), mode_pill_rect, border_radius=16)

        if self.mode == "PAINT":
            m_text = "CURRENT: PAINT TILES [Key 1]"
            m_col = COLOR_ACCENT_GREEN
        else:
            m_text = "CURRENT: SOLID COLLISION [Key 2]"
            m_col = COLOR_DANGER_RED

        pygame.draw.circle(self.screen, m_col, (mode_pill_rect.x + 18, mode_pill_rect.y + 16), 6)
        pill_txt = self.font_bold.render(m_text, True, COLOR_TEXT_MAIN)
        self.screen.blit(pill_txt, (mode_pill_rect.x + 32, mode_pill_rect.y + 8))

        # =========================================================
        # 2. LEFT PANEL: 16x16 GRID CANVAS
        # =========================================================
        for i in range(GRID_SIZE):
            cx = GRID_OFFSET_X + i * CELL_DRAW_SIZE + CELL_DRAW_SIZE // 2
            cy = GRID_OFFSET_Y - 20
            num_surf = self.font_small.render(str(i), True, COLOR_GRID_COORD)
            self.screen.blit(num_surf, (cx - num_surf.get_width() // 2, cy))

            rx = GRID_OFFSET_X - 25
            ry = GRID_OFFSET_Y + i * CELL_DRAW_SIZE + CELL_DRAW_SIZE // 2 - 8
            num_surf_y = self.font_small.render(str(i), True, COLOR_GRID_COORD)
            self.screen.blit(num_surf_y, (rx, ry))

        grid_bounds = pygame.Rect(GRID_OFFSET_X, GRID_OFFSET_Y, GRID_PIXEL_SIZE, GRID_PIXEL_SIZE)
        pygame.draw.rect(self.screen, (10, 15, 29), grid_bounds)

        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                cell_rect = pygame.Rect(
                    GRID_OFFSET_X + x * CELL_DRAW_SIZE,
                    GRID_OFFSET_Y + y * CELL_DRAW_SIZE,
                    CELL_DRAW_SIZE,
                    CELL_DRAW_SIZE
                )

                chk_col = COLOR_GRID_BG_A if (x + y) % 2 == 0 else COLOR_GRID_BG_B
                pygame.draw.rect(self.screen, chk_col, cell_rect)

                # Placed Tile
                t_idx = self.grid_tiles[y][x]
                if t_idx is not None and 0 <= t_idx < len(self.tiles):
                    tile_surf = self.tiles[t_idx]
                    scaled_tile = pygame.transform.scale(tile_surf, (CELL_DRAW_SIZE, CELL_DRAW_SIZE))
                    self.screen.blit(scaled_tile, cell_rect.topleft)

                # SOLID COLLISION OVERLAY (User's specific requirement)
                # "left-click on tiles to toggle a red rectangle overlay to manually define them as 'Solid Collision Tiles'"
                if self.grid_solid[y][x] and self.show_collision:
                    col_overlay = pygame.Surface((CELL_DRAW_SIZE, CELL_DRAW_SIZE), pygame.SRCALPHA)
                    col_overlay.fill(COLOR_COLLISION_FILL)

                    pygame.draw.rect(col_overlay, COLOR_COLLISION_BORDER, (0, 0, CELL_DRAW_SIZE, CELL_DRAW_SIZE), width=2)
                    pygame.draw.line(col_overlay, (248, 113, 113, 140), (0, 0), (CELL_DRAW_SIZE, CELL_DRAW_SIZE), 2)
                    pygame.draw.line(col_overlay, (248, 113, 113, 140), (0, CELL_DRAW_SIZE), (CELL_DRAW_SIZE, 0), 2)

                    self.screen.blit(col_overlay, cell_rect.topleft)

                    lbl = self.font_tiny.render("COL", True, (255, 255, 255))
                    self.screen.blit(lbl, (cell_rect.x + 3, cell_rect.y + 2))

                if self.show_grid_lines:
                    pygame.draw.rect(self.screen, COLOR_GRID_LINES, cell_rect, width=1)

        pygame.draw.rect(self.screen, COLOR_ACCENT_BLUE, grid_bounds, width=2)

        # Hover Cursor on Grid
        gx, gy = self.get_grid_cell_under_mouse(mouse_pos)
        if gx is not None and gy is not None:
            hover_rect = pygame.Rect(
                GRID_OFFSET_X + gx * CELL_DRAW_SIZE,
                GRID_OFFSET_Y + gy * CELL_DRAW_SIZE,
                CELL_DRAW_SIZE,
                CELL_DRAW_SIZE
            )

            if self.mode == "PAINT":
                if self.selected_tile_idx is not None and self.selected_tile_idx < len(self.tiles):
                    preview_surf = pygame.transform.scale(self.tiles[self.selected_tile_idx], (CELL_DRAW_SIZE, CELL_DRAW_SIZE))
                    preview_surf.set_alpha(190)
                    self.screen.blit(preview_surf, hover_rect.topleft)
                pygame.draw.rect(self.screen, COLOR_ACCENT_GREEN, hover_rect, width=2)
            else:
                preview_col = pygame.Surface((CELL_DRAW_SIZE, CELL_DRAW_SIZE), pygame.SRCALPHA)
                preview_col.fill((239, 68, 68, 110))
                self.screen.blit(preview_col, hover_rect.topleft)
                pygame.draw.rect(self.screen, COLOR_DANGER_RED, hover_rect, width=2)

        # =========================================================
        # 3. RIGHT PANEL: TOOLS, CONTROLS & PALETTE
        # =========================================================
        panel_x = 720
        panel_width = WINDOW_WIDTH - panel_x - 30
        panel_rect = pygame.Rect(panel_x, 75, panel_width, WINDOW_HEIGHT - 125)
        pygame.draw.rect(self.screen, COLOR_PANEL_BG, panel_rect, border_radius=10)
        pygame.draw.rect(self.screen, COLOR_PANEL_BORDER, panel_rect, width=1, border_radius=10)

        # --- A. MODE SELECTOR BUTTONS ---
        sec_y = panel_rect.y + 14
        sec_title = self.font_bold.render("1. SELECT EDITING MODE", True, COLOR_TEXT_MAIN)
        self.screen.blit(sec_title, (panel_x + 16, sec_y))

        btn_w = (panel_width - 44) // 2
        self.btn_paint_rect = pygame.Rect(panel_x + 16, sec_y + 22, btn_w, 36)
        self.btn_col_rect = pygame.Rect(panel_x + 28 + btn_w, sec_y + 22, btn_w, 36)

        self.draw_button(self.btn_paint_rect, "Paint Tiles (1)", is_active=(self.mode == "PAINT"), is_accent=(self.mode == "PAINT"))
        self.draw_button(self.btn_col_rect, "Solid Collision (2)", is_active=(self.mode == "COLLISION"), is_danger=(self.mode == "COLLISION"))

        # --- B. TILESET SWITCHER & PALETTE ---
        sec_y += 68
        sec_title2 = self.font_bold.render(f"2. TILESET: {self.tileset_filename} ({self.tile_size}px)", True, COLOR_TEXT_MAIN)
        self.screen.blit(sec_title2, (panel_x + 16, sec_y))

        self.btn_load_custom = pygame.Rect(panel_x + 16, sec_y + 22, 130, 26)
        self.btn_switch_sheet = pygame.Rect(panel_x + 152, sec_y + 22, 150, 26)
        self.btn_tile_size = pygame.Rect(panel_x + 308, sec_y + 22, 140, 26)

        self.draw_button(self.btn_load_custom, "Custom PNG...")
        self.draw_button(self.btn_switch_sheet, "Next Tileset")
        self.draw_button(self.btn_tile_size, f"Tile Size: {self.tile_size}px")

        # Palette Viewport (Fits 5 rows of 8 tiles = 40 tiles per page cleanly)
        sec_y += 56
        palette_box_h = 265
        palette_box = pygame.Rect(panel_x + 16, sec_y, panel_width - 32, palette_box_h)
        pygame.draw.rect(self.screen, (15, 23, 42), palette_box, border_radius=6)
        pygame.draw.rect(self.screen, COLOR_PANEL_BORDER, palette_box, width=1, border_radius=6)

        tiles_per_page = self.get_palette_tiles_per_page()
        start_idx = self.palette_page * tiles_per_page
        end_idx = min(start_idx + tiles_per_page, len(self.tiles))
        total_pages = max(1, (len(self.tiles) + tiles_per_page - 1) // tiles_per_page)

        self.palette_tile_rects = []
        cell_gap = 5
        margin_x = 12
        margin_y = 10

        for i, idx in enumerate(range(start_idx, end_idx)):
            row = i // self.palette_cols
            col = i % self.palette_cols

            tx = palette_box.x + margin_x + col * (self.palette_tile_draw_size + cell_gap)
            ty = palette_box.y + margin_y + row * (self.palette_tile_draw_size + cell_gap)

            t_rect = pygame.Rect(tx, ty, self.palette_tile_draw_size, self.palette_tile_draw_size)
            self.palette_tile_rects.append((t_rect, idx))

            pygame.draw.rect(self.screen, (24, 32, 47), t_rect)

            tile_img = pygame.transform.scale(self.tiles[idx], (self.palette_tile_draw_size, self.palette_tile_draw_size))
            self.screen.blit(tile_img, (tx, ty))

            if idx == self.selected_tile_idx:
                pygame.draw.rect(self.screen, COLOR_ACCENT_GOLD, t_rect, width=3)
            else:
                pygame.draw.rect(self.screen, (40, 50, 70), t_rect, width=1)

        # Palette Page Controls
        sec_y += palette_box_h + 8
        page_str = f"Page {self.palette_page + 1}/{total_pages} (Total: {len(self.tiles)} tiles) | Tile #{self.selected_tile_idx if self.selected_tile_idx is not None else 0}"
        page_surf = self.font_small.render(page_str, True, COLOR_TEXT_MUTED)
        self.screen.blit(page_surf, (panel_x + 16, sec_y + 4))

        self.btn_prev_page = pygame.Rect(panel_x + panel_width - 150, sec_y, 60, 24)
        self.btn_next_page = pygame.Rect(panel_x + panel_width - 80, sec_y, 60, 24)
        self.draw_button(self.btn_prev_page, "< Prev")
        self.draw_button(self.btn_next_page, "Next >")

        # --- C. QUICK ACTIONS ---
        sec_y += 36
        sec_title3 = self.font_bold.render("3. MAP ACTIONS", True, COLOR_TEXT_MAIN)
        self.screen.blit(sec_title3, (panel_x + 16, sec_y))

        sec_y += 20
        action_btn_w = (panel_width - 44) // 3
        self.btn_fill_all = pygame.Rect(panel_x + 16, sec_y, action_btn_w, 28)
        self.btn_clear_grid = pygame.Rect(panel_x + 22 + action_btn_w, sec_y, action_btn_w, 28)
        self.btn_border_col = pygame.Rect(panel_x + 28 + action_btn_w * 2, sec_y, action_btn_w, 28)

        self.draw_button(self.btn_fill_all, "Fill Grid")
        self.draw_button(self.btn_clear_grid, "Clear Grid")
        self.draw_button(self.btn_border_col, "Border Walls", is_danger=True)

        sec_y += 34
        self.btn_toggle_col_vis = pygame.Rect(panel_x + 16, sec_y, (panel_width - 38) // 2, 28)
        self.btn_clear_col = pygame.Rect(panel_x + 22 + (panel_width - 38) // 2, sec_y, (panel_width - 38) // 2, 28)

        col_vis_txt = "Hide Collisions" if self.show_collision else "Show Collisions"
        self.draw_button(self.btn_toggle_col_vis, col_vis_txt)
        self.draw_button(self.btn_clear_col, "Reset Collisions")

        # --- D. SAVE / LOAD JSON ---
        sec_y += 40
        sec_title4 = self.font_bold.render("4. EXPORT & SAVE (JSON)", True, COLOR_TEXT_MAIN)
        self.screen.blit(sec_title4, (panel_x + 16, sec_y))

        sec_y += 20
        io_btn_w = (panel_width - 38) // 2
        self.btn_save_json = pygame.Rect(panel_x + 16, sec_y, io_btn_w, 36)
        self.btn_load_json = pygame.Rect(panel_x + 22 + io_btn_w, sec_y, io_btn_w, 36)

        self.draw_button(self.btn_save_json, "Save JSON (Ctrl+S)", is_accent=True)
        self.draw_button(self.btn_load_json, "Load JSON (Ctrl+O)")

        sec_y += 42
        target_file_str = f"Target File: {os.path.basename(self.current_json_path)}"
        f_surf = self.font_small.render(target_file_str, True, COLOR_TEXT_MUTED)
        self.screen.blit(f_surf, (panel_x + 16, sec_y))

        # =========================================================
        # 4. BOTTOM STATUS BAR
        # =========================================================
        status_rect = pygame.Rect(0, WINDOW_HEIGHT - 38, WINDOW_WIDTH, 38)
        pygame.draw.rect(self.screen, (10, 15, 29), status_rect)
        pygame.draw.line(self.screen, COLOR_PANEL_BORDER, (0, WINDOW_HEIGHT - 38), (WINDOW_WIDTH, WINDOW_HEIGHT - 38), 1)

        st_surf = self.font_regular.render(self.status_message, True, COLOR_ACCENT_GOLD)
        self.screen.blit(st_surf, (20, WINDOW_HEIGHT - 28))

        solid_count = sum(sum(1 for val in row if val) for row in self.grid_solid)
        placed_count = sum(sum(1 for val in row if val is not None) for row in self.grid_tiles)
        stat_str = f"Placed: {placed_count}/256 | Solid: {solid_count} | Keys: [1] Paint [2] Collision [G] Grid [H] Overlay"
        stat_surf = self.font_small.render(stat_str, True, COLOR_TEXT_MUTED)
        self.screen.blit(stat_surf, (WINDOW_WIDTH - stat_surf.get_width() - 20, WINDOW_HEIGHT - 26))

        pygame.display.flip()

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_1 or event.key == pygame.K_p:
                    self.mode = "PAINT"
                    self.set_status("Switched to [PAINT TILES] mode.")
                elif event.key == pygame.K_2 or event.key == pygame.K_c:
                    self.mode = "COLLISION"
                    self.set_status("Switched to [SOLID COLLISION] mode. Left-click tiles to toggle red rectangle.")
                elif event.key == pygame.K_g:
                    self.show_grid_lines = not self.show_grid_lines
                    self.set_status(f"Grid lines {'enabled' if self.show_grid_lines else 'disabled'}.")
                elif event.key == pygame.K_h:
                    self.show_collision = not self.show_collision
                    self.set_status(f"Collision overlay {'visible' if self.show_collision else 'hidden'}.")
                elif event.key == pygame.K_s and (event.mod & pygame.KMOD_CTRL):
                    self.save_map_json()
                elif event.key == pygame.K_o and (event.mod & pygame.KMOD_CTRL):
                    chosen = open_native_file_dialog("Open Map JSON", file_filter="*.json")
                    if chosen:
                        self.load_map_json(chosen)

            elif event.type == pygame.MOUSEBUTTONDOWN:
                self.is_mouse_down = True
                self.mouse_button = event.button

                gx, gy = self.get_grid_cell_under_mouse(event.pos)
                if gx is not None and gy is not None:
                    self.apply_tool(gx, gy, event.button)
                    continue

                if event.button == 1:
                    clicked_palette_tile = False
                    for t_rect, idx in self.palette_tile_rects:
                        if t_rect.collidepoint(event.pos):
                            self.selected_tile_idx = idx
                            self.mode = "PAINT"
                            self.set_status(f"Selected Tile #{idx} (coords: {self.tile_coords[idx] if idx < len(self.tile_coords) else '?'})")
                            clicked_palette_tile = True
                            break
                    if clicked_palette_tile:
                        continue

                    if self.btn_paint_rect.collidepoint(event.pos):
                        self.mode = "PAINT"
                        self.set_status("Switched to [PAINT TILES] mode.")
                    elif self.btn_col_rect.collidepoint(event.pos):
                        self.mode = "COLLISION"
                        self.set_status("Switched to [SOLID COLLISION] mode. Left-click on tiles to toggle red overlay.")
                    elif self.btn_prev_page.collidepoint(event.pos):
                        if self.palette_page > 0:
                            self.palette_page -= 1
                    elif self.btn_next_page.collidepoint(event.pos):
                        total_pages = max(1, (len(self.tiles) + self.get_palette_tiles_per_page() - 1) // self.get_palette_tiles_per_page())
                        if self.palette_page < total_pages - 1:
                            self.palette_page += 1
                    elif self.btn_load_custom.collidepoint(event.pos):
                        chosen = open_native_file_dialog("Choose Tileset Image", file_filter="*.png *.jpg *.bmp")
                        if chosen:
                            self.load_tileset(chosen, self.tile_size)
                    elif self.btn_switch_sheet.collidepoint(event.pos):
                        self.current_tileset_idx = (self.current_tileset_idx + 1) % len(DEFAULT_TILESETS)
                        cfg = DEFAULT_TILESETS[self.current_tileset_idx]
                        next_path = os.path.join(ASSETS_DIR, cfg["name"])
                        if os.path.exists(next_path):
                            self.load_tileset(next_path, cfg["size"])
                    elif self.btn_tile_size.collidepoint(event.pos):
                        next_size = 32 if self.tile_size == 16 else (64 if self.tile_size == 32 else 16)
                        self.load_tileset(self.tileset_path, next_size)
                    elif self.btn_fill_all.collidepoint(event.pos):
                        self.fill_all_tiles()
                    elif self.btn_clear_grid.collidepoint(event.pos):
                        self.clear_all_tiles()
                    elif self.btn_border_col.collidepoint(event.pos):
                        self.fill_border_collisions()
                    elif self.btn_toggle_col_vis.collidepoint(event.pos):
                        self.show_collision = not self.show_collision
                        self.set_status(f"Collision overlay {'visible' if self.show_collision else 'hidden'}.")
                    elif self.btn_clear_col.collidepoint(event.pos):
                        self.clear_all_collisions()
                    elif self.btn_save_json.collidepoint(event.pos):
                        self.save_map_json()
                    elif self.btn_load_json.collidepoint(event.pos):
                        chosen = open_native_file_dialog("Load Map JSON", file_filter="*.json")
                        if chosen:
                            self.load_map_json(chosen)

                elif event.button == 4:  # Wheel Up
                    if self.palette_page > 0:
                        self.palette_page -= 1
                elif event.button == 5:  # Wheel Down
                    total_pages = max(1, (len(self.tiles) + self.get_palette_tiles_per_page() - 1) // self.get_palette_tiles_per_page())
                    if self.palette_page < total_pages - 1:
                        self.palette_page += 1

            elif event.type == pygame.MOUSEBUTTONUP:
                self.is_mouse_down = False

            elif event.type == pygame.MOUSEMOTION:
                if self.is_mouse_down and self.mouse_button in (1, 3):
                    gx, gy = self.get_grid_cell_under_mouse(event.pos)
                    if gx is not None and gy is not None:
                        if self.mode == "COLLISION":
                            self.grid_solid[gy][gx] = (self.mouse_button == 1)
                        elif self.mode == "PAINT":
                            self.apply_tool(gx, gy, self.mouse_button)

    def run(self):
        while self.running:
            self.handle_events()
            self.render()
            self.clock.tick(60)

        pygame.quit()


if __name__ == "__main__":
    print("[Starting] Antigravity 2D Map Editor...")
    editor = MapEditor()
    editor.run()
