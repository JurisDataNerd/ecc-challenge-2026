"""Build directional map and combat sheets from the six approved pixel poses."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tools' / 'assets' / 'hero_sprite_sources'
OUTPUT = ROOT / 'public' / 'assets' / 'heroes' / 'sprites'
MAP_FRAME = 96
COMBAT_WIDTH = 160


def place_pose(pose: Image.Image, width: int, dy: int = 0) -> Image.Image:
    frame = Image.new('RGBA', (width, MAP_FRAME))
    frame.alpha_composite(pose, ((width - pose.width) // 2, dy))
    return frame


def hit_tint(frame: Image.Image) -> Image.Image:
    red, green, blue, alpha = frame.split()
    return Image.merge('RGBA', (
        red.point(lambda value: min(255, int(value * .7 + 75))),
        green.point(lambda value: int(value * .65)),
        blue.point(lambda value: int(value * .65)),
        alpha,
    ))


def build_map_sheet(idle_poses: Image.Image, walk: Image.Image) -> Image.Image:
    sheet = Image.new('RGBA', (MAP_FRAME * 4, MAP_FRAME * 8))
    for direction in range(4):
        standing = idle_poses.crop((direction * MAP_FRAME, 0, (direction + 1) * MAP_FRAME, MAP_FRAME))
        walk_heights = []
        for index in range(4):
            box = (index * MAP_FRAME, direction * MAP_FRAME, (index + 1) * MAP_FRAME, (direction + 1) * MAP_FRAME)
            bounds = walk.crop(box).getchannel('A').getbbox()
            walk_heights.append(bounds[3] - bounds[1])
        target_height = sorted(walk_heights)[2]
        bounds = standing.getchannel('A').getbbox()
        standing = standing.crop(bounds)
        target_width = round(standing.width * target_height / standing.height)
        standing = standing.resize((target_width, target_height), Image.Resampling.LANCZOS)
        standing = place_pose(standing, MAP_FRAME, MAP_FRAME - target_height)
        for index, dy in enumerate((0, -1, -1, 0)):
            sheet.alpha_composite(place_pose(standing, MAP_FRAME, dy), (index * MAP_FRAME, direction * MAP_FRAME))
        for index in range(4):
            box = (index * MAP_FRAME, direction * MAP_FRAME, (index + 1) * MAP_FRAME, (direction + 1) * MAP_FRAME)
            sheet.alpha_composite(walk.crop(box), (index * MAP_FRAME, (direction + 4) * MAP_FRAME))
    return sheet


def build_combat_sheet(attack: Image.Image) -> Image.Image:
    sheet = Image.new('RGBA', (COMBAT_WIDTH * 4, MAP_FRAME * 4))
    facing_enemy = attack.crop((0, 0, COMBAT_WIDTH, MAP_FRAME))
    for index, dy in enumerate((0, -1, -1, 0)):
        sheet.alpha_composite(place_pose(facing_enemy, COMBAT_WIDTH, dy), (index * COMBAT_WIDTH, 0))
        strike = attack.crop((index * COMBAT_WIDTH, 0, (index + 1) * COMBAT_WIDTH, MAP_FRAME))
        sheet.alpha_composite(strike, (index * COMBAT_WIDTH, MAP_FRAME))
        hit = place_pose(facing_enemy, COMBAT_WIDTH, (0, 1, 2, 0)[index])
        sheet.alpha_composite(hit_tint(hit) if index in (1, 2) else hit, (index * COMBAT_WIDTH, MAP_FRAME * 2))
        celebrate = attack.crop((COMBAT_WIDTH, 0, COMBAT_WIDTH * 2, MAP_FRAME))
        victory = Image.new('RGBA', (COMBAT_WIDTH, MAP_FRAME))
        victory.alpha_composite(celebrate, (0, dy))
        draw = ImageDraw.Draw(victory)
        for x, y in ((27 + index * 2, 24), (135 - index * 2, 39)):
            draw.line((x - 2, y, x + 2, y), fill=(255, 215, 93, 255), width=1)
            draw.line((x, y - 2, x, y + 2), fill=(255, 215, 93, 255), width=1)
        sheet.alpha_composite(victory, (index * COMBAT_WIDTH, MAP_FRAME * 3))
    return sheet


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for role in ('knight', 'mage', 'assassin'):
        for gender in ('male', 'female'):
            name = f'{role}_{gender}'
            idle_poses = Image.open(SOURCE / f'{name}_idle_poses.png').convert('RGBA')
            walk = Image.open(SOURCE / f'{name}_walk.png').convert('RGBA')
            attack = Image.open(SOURCE / f'{name}_attack.png').convert('RGBA')
            build_map_sheet(idle_poses, walk).save(OUTPUT / f'hero_{name}_spritesheet.png')
            build_combat_sheet(attack).save(OUTPUT / f'hero_{name}_combat.png')


if __name__ == '__main__':
    main()
