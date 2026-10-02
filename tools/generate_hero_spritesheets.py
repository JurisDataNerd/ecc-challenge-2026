import os
from PIL import Image, ImageDraw

# Color palettes
SKIN_LIGHT = (255, 222, 194, 255)
SKIN_MID = (240, 192, 154, 255)
SKIN_SHADOW = (210, 152, 116, 255)

EYE_WHITE = (250, 250, 250, 255)
EYE_BLUE = (30, 64, 175, 255)
EYE_GREEN = (4, 120, 87, 255)
EYE_AMBER = (180, 83, 9, 255)
EYE_PUPIL = (15, 23, 42, 255)

OUTLINE = (15, 23, 42, 255)
SHADOW_GROUND = (15, 23, 42, 90)

GOLD_LIGHT = (253, 224, 71, 255)
GOLD_MID = (245, 158, 11, 255)
GOLD_DARK = (180, 83, 9, 255)

STEEL_WHITE = (248, 250, 252, 255)
STEEL_LIGHT = (226, 232, 240, 255)
STEEL_MID = (148, 163, 184, 255)
STEEL_DARK = (71, 85, 105, 255)
STEEL_DEEP = (30, 41, 59, 255)

BLUE_CAPE_LIGHT = (96, 165, 250, 255)
BLUE_CAPE_MID = (37, 99, 235, 255)
BLUE_CAPE_DARK = (30, 58, 138, 255)

MAGE_EMERALD_LIGHT = (52, 211, 153, 255)
MAGE_EMERALD_MID = (5, 150, 105, 255)
MAGE_EMERALD_DARK = (6, 95, 70, 255)
MAGE_IVORY = (241, 245, 249, 255)

ROGUE_AMBER_LIGHT = (251, 191, 36, 255)
ROGUE_AMBER_MID = (217, 119, 6, 255)
ROGUE_LEATHER_DARK = (38, 38, 38, 255)
ROGUE_LEATHER_MID = (68, 64, 60, 255)

def draw_ground_shadow(draw, cx, cy, rx, ry):
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=SHADOW_GROUND)

def draw_hair_knight_male(draw, cx, cy, dy):
    # Spiky chestnut brown FF hair
    hair_c1 = (180, 83, 9, 255)
    hair_c2 = (120, 53, 15, 255)
    hair_c3 = (69, 26, 3, 255)
    # top spikes
    draw.polygon([(cx - 7, cy + dy - 10), (cx - 5, cy + dy - 15), (cx - 2, cy + dy - 11)], fill=hair_c1)
    draw.polygon([(cx - 3, cy + dy - 11), (cx, cy + dy - 17), (cx + 4, cy + dy - 11)], fill=hair_c1)
    draw.polygon([(cx + 3, cy + dy - 11), (cx + 6, cy + dy - 15), (cx + 8, cy + dy - 9)], fill=hair_c2)
    # head cap
    draw.rectangle([cx - 7, cy + dy - 10, cx + 7, cy + dy - 5], fill=hair_c2)
    # side burns
    draw.rectangle([cx - 8, cy + dy - 6, cx - 7, cy + dy - 1], fill=hair_c3)
    draw.rectangle([cx + 7, cy + dy - 6, cx + 8, cy + dy - 1], fill=hair_c3)
    # front bangs
    draw.polygon([(cx - 5, cy + dy - 5), (cx - 3, cy + dy - 2), (cx - 1, cy + dy - 5)], fill=hair_c1)
    draw.polygon([(cx, cy + dy - 5), (cx + 2, cy + dy - 3), (cx + 4, cy + dy - 5)], fill=hair_c1)

def draw_hair_knight_female(draw, cx, cy, dy, pony_sway=0):
    # Golden blonde hair with high ponytail
    blonde_light = (254, 240, 138, 255)
    blonde_mid = (250, 204, 21, 255)
    blonde_dark = (202, 138, 4, 255)
    blonde_deep = (133, 77, 14, 255)
    # top hair volume
    draw.ellipse([cx - 7, cy + dy - 13, cx + 7, cy + dy - 4], fill=blonde_mid)
    draw.rectangle([cx - 6, cy + dy - 9, cx + 6, cy + dy - 5], fill=blonde_light)
    # elegant side bangs
    draw.rectangle([cx - 7, cy + dy - 7, cx - 6, cy + dy], fill=blonde_dark)
    draw.rectangle([cx + 6, cy + dy - 7, cx + 7, cy + dy], fill=blonde_dark)
    # front bangs
    draw.polygon([(cx - 4, cy + dy - 5), (cx - 2, cy + dy - 2), (cx, cy + dy - 5)], fill=blonde_light)
    draw.polygon([(cx + 1, cy + dy - 5), (cx + 3, cy + dy - 2), (cx + 5, cy + dy - 5)], fill=blonde_light)
    # high ponytail tie
    draw.rectangle([cx - 8, cy + dy - 11, cx - 6, cy + dy - 9], fill=BLUE_CAPE_MID)
    # flowing ponytail to the left
    px = cx - 8 + pony_sway
    draw.polygon([(px, cy + dy - 9), (px - 5, cy + dy - 4), (px - 3, cy + dy + 2), (px - 1, cy + dy - 2)], fill=blonde_mid)
    draw.line([(px - 4, cy + dy - 3), (px - 2, cy + dy + 3)], fill=blonde_light, width=1)

def draw_face(draw, cx, cy, dy, eye_color, gender='male'):
    # Base face shape
    draw.rectangle([cx - 5, cy + dy - 5, cx + 5, cy + dy + 2], fill=SKIN_MID)
    draw.rectangle([cx - 4, cy + dy - 4, cx + 4, cy + dy + 1], fill=SKIN_LIGHT)
    draw.rectangle([cx - 3, cy + dy + 2, cx + 3, cy + dy + 3], fill=SKIN_SHADOW) # chin
    # Eyes
    # Left eye
    draw.point((cx - 3, cy + dy - 2), fill=EYE_WHITE)
    draw.point((cx - 2, cy + dy - 2), fill=eye_color)
    draw.point((cx - 2, cy + dy - 3), fill=OUTLINE) # eyebrow
    # Right eye
    draw.point((cx + 2, cy + dy - 2), fill=eye_color)
    draw.point((cx + 3, cy + dy - 2), fill=EYE_WHITE)
    draw.point((cx + 2, cy + dy - 3), fill=OUTLINE) # eyebrow
    # Nose & smile
    draw.point((cx, cy + dy), fill=SKIN_SHADOW)
    if gender == 'female':
        draw.line([(cx - 1, cy + dy + 2), (cx + 1, cy + dy + 2)], fill=(225, 110, 120, 255)) # blush lips
    else:
        draw.line([(cx - 1, cy + dy + 2), (cx + 1, cy + dy + 2)], fill=(180, 100, 80, 255))

def create_knight_spritesheet(gender='male'):
    im = Image.new('RGBA', (192, 144), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    eye_col = EYE_BLUE
    for row in range(3): # 0: idle, 1: walk, 2: attack
        for col in range(4):
            x_off = col * 48
            y_off = row * 48
            cx = x_off + 24
            cy = y_off + 24

            # animation offsets
            dy = 0
            foot_dx = 0
            sword_angle = 0
            if row == 0: # Idle breathing
                dy = [0, -1, -1, 0][col]
            elif row == 1: # Walk bobbing & stepping
                dy = [0, -1, 0, -1][col]
                foot_dx = [-2, 0, 2, 0][col]
            elif row == 2: # Attack
                dy = [0, -1, 1, 0][col]

            # Ground Shadow
            draw_ground_shadow(draw, cx, y_off + 43, 10, 4)

            # Cape (Back)
            cape_sway = [-1, 0, 1, 0][col] if row != 2 else [0, -2, 3, 1][col]
            draw.polygon([(cx - 8, cy + dy + 1), (cx + 8, cy + dy + 1), 
                          (cx + 9 + cape_sway, cy + dy + 16), (cx - 9 + cape_sway, cy + dy + 16)], 
                         fill=BLUE_CAPE_MID)
            draw.line([(cx - 9 + cape_sway, cy + dy + 16), (cx + 9 + cape_sway, cy + dy + 16)], fill=GOLD_MID, width=1)

            # Legs / Boots
            leg_y = y_off + 35
            draw.rectangle([cx - 5 + foot_dx, leg_y, cx - 2 + foot_dx, leg_y + 6], fill=STEEL_MID)
            draw.rectangle([cx + 2 - foot_dx, leg_y, cx + 5 - foot_dx, leg_y + 6], fill=STEEL_DARK)
            draw.rectangle([cx - 6 + foot_dx, leg_y + 5, cx - 2 + foot_dx, leg_y + 7], fill=STEEL_DEEP)
            draw.rectangle([cx + 2 - foot_dx, leg_y + 5, cx + 6 - foot_dx, leg_y + 7], fill=STEEL_DEEP)

            # Torso & Plate Armor
            torso_y = cy + dy + 4
            draw.rectangle([cx - 6, torso_y, cx + 6, torso_y + 8], fill=STEEL_LIGHT)
            draw.rectangle([cx - 5, torso_y + 1, cx + 5, torso_y + 7], fill=STEEL_WHITE)
            # Gold cross / emblem on breastplate
            draw.line([(cx, torso_y + 2), (cx, torso_y + 6)], fill=GOLD_MID, width=1)
            draw.line([(cx - 2, torso_y + 4), (cx + 2, torso_y + 4)], fill=GOLD_MID, width=1)
            # Belt & faulds
            draw.rectangle([cx - 6, torso_y + 8, cx + 6, torso_y + 10], fill=GOLD_DARK)
            draw.rectangle([cx - 5, torso_y + 10, cx + 5, torso_y + 12], fill=BLUE_CAPE_DARK)

            # Pauldrons (Shoulders)
            draw.rectangle([cx - 9, torso_y, cx - 6, torso_y + 4], fill=STEEL_LIGHT)
            draw.rectangle([cx + 6, torso_y, cx + 9, torso_y + 4], fill=STEEL_LIGHT)

            # Head & Face
            draw_face(draw, cx, cy, dy, eye_col, gender)

            # Hair
            if gender == 'male':
                draw_hair_knight_male(draw, cx, cy, dy)
            else:
                draw_hair_knight_female(draw, cx, cy, dy, cape_sway)

            # Shield (Left Hand, user's left)
            shield_x = cx - 11
            shield_y = torso_y + 2
            draw.polygon([(shield_x - 3, shield_y - 2), (shield_x + 3, shield_y - 2),
                          (shield_x + 3, shield_y + 5), (shield_x, shield_y + 9),
                          (shield_x - 3, shield_y + 5)], fill=BLUE_CAPE_MID)
            draw.line([(shield_x - 3, shield_y - 2), (shield_x + 3, shield_y - 2),
                       (shield_x + 3, shield_y + 5), (shield_x, shield_y + 9),
                       (shield_x - 3, shield_y + 5), (shield_x - 3, shield_y - 2)], fill=GOLD_LIGHT)
            draw.point((shield_x, shield_y + 2), fill=GOLD_LIGHT)

            # Sword / Weapon (Right Hand, user's right)
            sw_x = cx + 9
            sw_y = torso_y + 3
            if row == 2 and col == 1: # Attack slash frame!
                # Extended sword slashing forward
                draw.line([(sw_x - 1, sw_y), (sw_x + 13, sw_y - 4)], fill=STEEL_WHITE, width=2)
                draw.line([(sw_x - 1, sw_y + 2), (sw_x - 1, sw_y - 2)], fill=GOLD_MID, width=2) # crossguard
                # Slash effect arc
                draw.arc([sw_x + 4, sw_y - 12, sw_x + 18, sw_y + 6], start=280, end=40, fill=(186, 230, 253, 220), width=2)
            elif row == 2 and col == 2: # Attack follow-through
                draw.line([(sw_x, sw_y - 2), (sw_x + 11, sw_y + 4)], fill=STEEL_WHITE, width=2)
                draw.line([(sw_x - 1, sw_y), (sw_x + 1, sw_y - 4)], fill=GOLD_MID, width=2)
            else: # Idle / Walk ready sword
                draw.line([(sw_x + 2, sw_y - 8), (sw_x + 2, sw_y + 3)], fill=STEEL_WHITE, width=2)
                draw.line([(sw_x, sw_y + 3), (sw_x + 4, sw_y + 3)], fill=GOLD_MID, width=2) # crossguard
                draw.point((sw_x + 2, sw_y + 5), fill=GOLD_DARK) # pommel

    return im

def draw_hair_mage_male(draw, cx, cy, dy):
    # Dark teal scholar hair with parted bangs
    c1 = (20, 184, 166, 255)
    c2 = (15, 118, 110, 255)
    c3 = (4, 47, 46, 255)
    draw.ellipse([cx - 7, cy + dy - 13, cx + 7, cy + dy - 4], fill=c2)
    draw.rectangle([cx - 6, cy + dy - 9, cx + 6, cy + dy - 5], fill=c1)
    draw.rectangle([cx - 8, cy + dy - 6, cx - 7, cy + dy], fill=c3)
    draw.rectangle([cx + 7, cy + dy - 6, cx + 8, cy + dy], fill=c3)
    # clean parted bangs
    draw.polygon([(cx - 5, cy + dy - 5), (cx - 2, cy + dy - 2), (cx - 1, cy + dy - 5)], fill=c1)
    draw.polygon([(cx + 1, cy + dy - 5), (cx + 3, cy + dy - 3), (cx + 5, cy + dy - 5)], fill=c1)

def draw_hair_mage_female(draw, cx, cy, dy):
    # Ebony hair with long emerald ribbon braid
    c1 = (71, 85, 105, 255)
    c2 = (30, 41, 59, 255)
    c3 = (15, 23, 42, 255)
    draw.ellipse([cx - 7, cy + dy - 13, cx + 7, cy + dy - 4], fill=c2)
    draw.rectangle([cx - 6, cy + dy - 9, cx + 6, cy + dy - 5], fill=c1)
    # long side hair
    draw.rectangle([cx - 8, cy + dy - 6, cx - 6, cy + dy + 5], fill=c2)
    draw.rectangle([cx + 6, cy + dy - 6, cx + 8, cy + dy + 5], fill=c2)
    # emerald hair ribbon & flowers
    draw.point((cx - 7, cy + dy - 7), fill=MAGE_EMERALD_LIGHT)
    draw.point((cx + 7, cy + dy - 7), fill=MAGE_EMERALD_LIGHT)
    draw.point((cx - 7, cy + dy + 2), fill=MAGE_EMERALD_LIGHT)
    # soft bangs
    draw.polygon([(cx - 4, cy + dy - 5), (cx - 2, cy + dy - 2), (cx, cy + dy - 5)], fill=c1)
    draw.polygon([(cx + 1, cy + dy - 5), (cx + 3, cy + dy - 2), (cx + 5, cy + dy - 5)], fill=c1)

def create_mage_spritesheet(gender='male'):
    im = Image.new('RGBA', (192, 144), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    eye_col = EYE_GREEN
    for row in range(3):
        for col in range(4):
            x_off = col * 48
            y_off = row * 48
            cx = x_off + 24
            cy = y_off + 24

            dy = 0
            foot_dx = 0
            if row == 0:
                dy = [0, -1, -1, 0][col]
            elif row == 1:
                dy = [0, -1, 0, -1][col]
                foot_dx = [-2, 0, 2, 0][col]
            elif row == 2:
                dy = [0, -1, 1, 0][col]

            # Ground Shadow
            draw_ground_shadow(draw, cx, y_off + 43, 10, 4)

            # Robe Bottom
            robe_y = cy + dy + 8
            draw.polygon([(cx - 7, robe_y), (cx + 7, robe_y),
                          (cx + 9, robe_y + 11), (cx - 9, robe_y + 11)], fill=MAGE_EMERALD_MID)
            draw.line([(cx - 9, robe_y + 11), (cx + 9, robe_y + 11)], fill=GOLD_MID, width=1)
            # Inner ivory skirt / pants
            draw.rectangle([cx - 3 + foot_dx, robe_y + 8, cx + 3 - foot_dx, robe_y + 12], fill=MAGE_IVORY)
            # Shoes
            draw.rectangle([cx - 5 + foot_dx, robe_y + 12, cx - 2 + foot_dx, robe_y + 13], fill=OUTLINE)
            draw.rectangle([cx + 2 - foot_dx, robe_y + 12, cx + 5 - foot_dx, robe_y + 13], fill=OUTLINE)

            # Torso / Scholar Coat
            draw.rectangle([cx - 6, cy + dy + 4, cx + 6, cy + dy + 9], fill=MAGE_EMERALD_MID)
            draw.rectangle([cx - 2, cy + dy + 4, cx + 2, cy + dy + 9], fill=MAGE_IVORY)
            # Gold embroidery trim
            draw.line([(cx - 3, cy + dy + 4), (cx - 3, cy + dy + 9)], fill=GOLD_MID)
            draw.line([(cx + 3, cy + dy + 4), (cx + 3, cy + dy + 9)], fill=GOLD_MID)

            # Head & Face
            draw_face(draw, cx, cy, dy, eye_col, gender)

            # Hair
            if gender == 'male':
                draw_hair_mage_male(draw, cx, cy, dy)
            else:
                draw_hair_mage_female(draw, cx, cy, dy)

            # Magic Staff (Right Hand)
            st_x = cx + 10
            st_y = cy + dy + 2
            # Staff pole
            draw.line([(st_x, st_y - 12), (st_x, st_y + 16)], fill=(120, 53, 15, 255), width=2)
            # Staff golden head & glowing crystal
            draw.polygon([(st_x - 3, st_y - 12), (st_x + 3, st_y - 12),
                          (st_x, st_y - 18)], fill=GOLD_LIGHT)
            # Crystal glow
            glow_c = (56, 189, 248, 255) if gender == 'male' else (52, 211, 153, 255)
            draw.ellipse([st_x - 2, st_y - 16, st_x + 2, st_y - 12], fill=glow_c)

            if row == 2 and col in [1, 2]: # Magic casting burst!
                draw.ellipse([st_x - 5, st_y - 20, st_x + 5, st_y - 10], outline=GOLD_LIGHT, width=1)
                draw.arc([st_x - 8, st_y - 23, st_x + 8, st_y - 7], start=0, end=360, fill=glow_c, width=1)

    return im

def draw_hair_assassin_male(draw, cx, cy, dy):
    # Spiky dark hair with amber highlights & rogue headband
    c1 = (245, 158, 11, 255) # amber tip
    c2 = (68, 64, 60, 255)
    c3 = (28, 25, 23, 255)
    # spikes
    draw.polygon([(cx - 7, cy + dy - 10), (cx - 5, cy + dy - 15), (cx - 2, cy + dy - 11)], fill=c1)
    draw.polygon([(cx - 3, cy + dy - 11), (cx + 1, cy + dy - 16), (cx + 4, cy + dy - 11)], fill=c1)
    draw.polygon([(cx + 3, cy + dy - 11), (cx + 7, cy + dy - 14), (cx + 8, cy + dy - 9)], fill=c2)
    # cap
    draw.rectangle([cx - 7, cy + dy - 10, cx + 7, cy + dy - 5], fill=c3)
    # rogue headband
    draw.line([(cx - 8, cy + dy - 6), (cx + 8, cy + dy - 6)], fill=GOLD_MID, width=2)
    # sideburns
    draw.rectangle([cx - 8, cy + dy - 5, cx - 7, cy + dy], fill=c3)
    draw.rectangle([cx + 7, cy + dy - 5, cx + 8, cy + dy], fill=c3)

def draw_hair_assassin_female(draw, cx, cy, dy):
    # Auburn twin side braids
    c1 = (245, 158, 11, 255)
    c2 = (217, 119, 6, 255)
    c3 = (180, 83, 9, 255)
    draw.ellipse([cx - 7, cy + dy - 13, cx + 7, cy + dy - 4], fill=c2)
    draw.rectangle([cx - 6, cy + dy - 9, cx + 6, cy + dy - 5], fill=c1)
    # twin braids
    draw.rectangle([cx - 8, cy + dy - 6, cx - 6, cy + dy + 4], fill=c2)
    draw.rectangle([cx + 6, cy + dy - 6, cx + 8, cy + dy + 4], fill=c2)
    draw.point((cx - 7, cy + dy + 5), fill=OUTLINE) # hair tie
    draw.point((cx + 7, cy + dy + 5), fill=OUTLINE)
    # front rogue bangs
    draw.polygon([(cx - 4, cy + dy - 5), (cx - 2, cy + dy - 2), (cx, cy + dy - 5)], fill=c1)
    draw.polygon([(cx + 1, cy + dy - 5), (cx + 3, cy + dy - 2), (cx + 5, cy + dy - 5)], fill=c1)

def create_assassin_spritesheet(gender='male'):
    im = Image.new('RGBA', (192, 144), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    eye_col = EYE_AMBER
    for row in range(3):
        for col in range(4):
            x_off = col * 48
            y_off = row * 48
            cx = x_off + 24
            cy = y_off + 24

            dy = 0
            foot_dx = 0
            if row == 0:
                dy = [0, -1, -1, 0][col]
            elif row == 1:
                dy = [0, -1, 0, -1][col]
                foot_dx = [-2, 0, 2, 0][col]
            elif row == 2:
                dy = [0, -1, 1, 0][col]

            # Ground Shadow
            draw_ground_shadow(draw, cx, y_off + 43, 9, 4)

            # Breeches & Stealth Boots
            leg_y = y_off + 35
            draw.rectangle([cx - 5 + foot_dx, leg_y, cx - 2 + foot_dx, leg_y + 6], fill=ROGUE_LEATHER_DARK)
            draw.rectangle([cx + 2 - foot_dx, leg_y, cx + 5 - foot_dx, leg_y + 6], fill=ROGUE_LEATHER_DARK)
            # Gold buckles on boots
            draw.point((cx - 3 + foot_dx, leg_y + 4), fill=GOLD_MID)
            draw.point((cx + 3 - foot_dx, leg_y + 4), fill=GOLD_MID)

            # Torso / Rogue Jerkin
            t_col = ROGUE_LEATHER_DARK if gender == 'male' else ROGUE_AMBER_MID
            draw.rectangle([cx - 6, cy + dy + 4, cx + 6, cy + dy + 9], fill=t_col)
            # Amber utility belt & harness
            draw.line([(cx - 5, cy + dy + 4), (cx + 5, cy + dy + 9)], fill=GOLD_MID, width=1) # sash
            draw.rectangle([cx - 6, cy + dy + 8, cx + 6, cy + dy + 10], fill=GOLD_DARK)

            # Head & Face
            draw_face(draw, cx, cy, dy, eye_col, gender)

            # Hair
            if gender == 'male':
                draw_hair_assassin_male(draw, cx, cy, dy)
            else:
                draw_hair_assassin_female(draw, cx, cy, dy)

            # Dual Daggers
            # Left dagger (sheathed or held)
            d1_x = cx - 8
            d1_y = cy + dy + 5
            draw.line([(d1_x, d1_y), (d1_x - 3, d1_y + 6)], fill=STEEL_LIGHT, width=1)
            draw.point((d1_x, d1_y), fill=GOLD_MID)

            # Right dagger (in hand)
            d2_x = cx + 8
            d2_y = cy + dy + 5
            if row == 2 and col == 1: # Rapid dagger thrust!
                draw.line([(d2_x - 1, d2_y), (d2_x + 11, d2_y - 2)], fill=STEEL_WHITE, width=2)
                draw.point((d2_x - 1, d2_y), fill=GOLD_MID)
                # Twin slash blur
                draw.line([(d2_x + 4, d2_y - 6), (d2_x + 14, d2_y - 2)], fill=(254, 240, 138, 200), width=1)
                draw.line([(d2_x + 4, d2_y + 2), (d2_x + 14, d2_y - 2)], fill=(254, 240, 138, 200), width=1)
            else:
                draw.line([(d2_x, d2_y - 4), (d2_x + 2, d2_y + 4)], fill=STEEL_WHITE, width=1)
                draw.point((d2_x + 1, d2_y), fill=GOLD_MID)

    return im

def main():
    os.makedirs('public/assets/heroes/sprites', exist_ok=True)

    sheets = [
        ('hero_knight_male_spritesheet.png', create_knight_spritesheet('male')),
        ('hero_knight_female_spritesheet.png', create_knight_spritesheet('female')),
        ('hero_mage_male_spritesheet.png', create_mage_spritesheet('male')),
        ('hero_mage_female_spritesheet.png', create_mage_spritesheet('female')),
        ('hero_assassin_male_spritesheet.png', create_assassin_spritesheet('male')),
        ('hero_assassin_female_spritesheet.png', create_assassin_spritesheet('female')),
    ]

    for fname, img in sheets:
        dst = os.path.join('public/assets/heroes/sprites', fname)
        img.save(dst)
        print(f'Saved {dst} ({img.size})')

    # Also update default hero spritesheets in public/assets/dungeon/
    # so by default they now use the new high-fidelity visible-face FF designs!
    create_knight_spritesheet('male').save('public/assets/dungeon/hero_knight_spritesheet.png')
    create_mage_spritesheet('female').save('public/assets/dungeon/hero_mage_spritesheet.png')
    create_assassin_spritesheet('male').save('public/assets/dungeon/hero_assassin_spritesheet.png')
    print('Updated default public/assets/dungeon/hero_*_spritesheet.png!')

if __name__ == '__main__':
    main()
