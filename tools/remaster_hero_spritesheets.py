import os
from PIL import Image

def get_base_templates():
    return {
        'knight': Image.open('/tmp/orig_knight.png').convert('RGBA'),
        'mage': Image.open('/tmp/orig_mage.png').convert('RGBA'),
        'assassin': Image.open('/tmp/orig_assassin.png').convert('RGBA'),
    }

# Authentic game palette colors
C_DARK_OUTLINE = (15, 23, 42, 255)
C_STEEL_DEEP   = (30, 41, 59, 255)
C_STEEL_DARK   = (71, 85, 105, 255)
C_STEEL_MID    = (148, 163, 184, 255)
C_STEEL_LIGHT  = (226, 232, 240, 255)
C_STEEL_WHITE  = (248, 250, 252, 255)

C_BLUE_DARK    = (30, 58, 138, 255)
C_BLUE_MID     = (37, 99, 235, 255)
C_BLUE_LIGHT   = (96, 165, 250, 255)

C_GOLD_DARK    = (120, 53, 15, 255)
C_GOLD_MID     = (245, 158, 11, 255)
C_GOLD_LIGHT   = (253, 224, 71, 255)

C_EMERALD_DEEP = (2, 44, 34, 255)
C_EMERALD_DARK = (4, 120, 87, 255)
C_EMERALD_MID  = (16, 185, 129, 255)
C_EMERALD_LGT  = (52, 211, 153, 255)

C_AMBER_DARK   = (136, 19, 55, 255)
C_AMBER_MID    = (217, 119, 6, 255)
C_AMBER_LIGHT  = (245, 158, 11, 255)
C_LEATHER_DARK = (24, 24, 27, 255)
C_LEATHER_MID  = (39, 39, 42, 255)

# Skin Tones matching the game art
SKIN_HIGHLIGHT = (254, 238, 220, 255)
SKIN_LIGHT     = (246, 215, 182, 255)
SKIN_MID       = (232, 184, 142, 255)
SKIN_SHADOW    = (194, 138, 98, 255)
SKIN_OUTLINE   = (138, 86, 54, 255)

# Eye colors
EYE_WHITE = (250, 250, 250, 255)
EYE_BLUE  = (37, 99, 235, 255)
EYE_CYAN  = (56, 189, 248, 255)
EYE_GREEN = (16, 185, 129, 255)
EYE_AMBER = (245, 158, 11, 255)
LIP_PINK  = (225, 112, 130, 255)
LIP_ROSE  = (190, 75, 95, 255)

# Hair Palettes
# Male Knight: Spiky Chestnut FF Hair
HAIR_KNIGHT_M_HL = (205, 133, 63, 255)
HAIR_KNIGHT_M_MID = (150, 75, 25, 255)
HAIR_KNIGHT_M_SHD = (90, 40, 15, 255)
HAIR_KNIGHT_M_OUT = (45, 18, 5, 255)

# Female Knight: Golden Blonde
HAIR_KNIGHT_F_HL = (254, 240, 138, 255)
HAIR_KNIGHT_F_MID = (250, 204, 21, 255)
HAIR_KNIGHT_F_SHD = (202, 138, 4, 255)
HAIR_KNIGHT_F_OUT = (113, 63, 18, 255)

# Male Mage: Dark Teal Scholar
HAIR_MAGE_M_HL = (45, 212, 191, 255)
HAIR_MAGE_M_MID = (15, 118, 110, 255)
HAIR_MAGE_M_SHD = (17, 94, 89, 255)
HAIR_MAGE_M_OUT = (4, 47, 46, 255)

# Female Mage: Raven Hair with Emerald Ribbons
HAIR_MAGE_F_HL = (71, 85, 105, 255)
HAIR_MAGE_F_MID = (30, 41, 59, 255)
HAIR_MAGE_F_SHD = (15, 23, 42, 255)
HAIR_MAGE_F_OUT = (5, 10, 20, 255)

# Male Assassin: Dark Spiky Amber Tipped
HAIR_ASSASSIN_M_HL = (245, 158, 11, 255)
HAIR_ASSASSIN_M_MID = (68, 64, 60, 255)
HAIR_ASSASSIN_M_SHD = (28, 25, 23, 255)
HAIR_ASSASSIN_M_OUT = (12, 10, 9, 255)

# Female Assassin: Auburn Copper Twin Braids
HAIR_ASSASSIN_F_HL = (245, 158, 11, 255)
HAIR_ASSASSIN_F_MID = (217, 119, 6, 255)
HAIR_ASSASSIN_F_SHD = (180, 83, 9, 255)
HAIR_ASSASSIN_F_OUT = (100, 40, 5, 255)


def apply_pixel_map(im, x_off, y_off, dy, pixel_dict):
    """Applies a dictionary of (x, y): RGBA onto im relative to (x_off, y_off + dy)."""
    for (px, py), col in pixel_dict.items():
        gx = x_off + px
        gy = y_off + py + dy
        if 0 <= gx < im.width and 0 <= gy < im.height and col is not None:
            im.putpixel((gx, gy), col)

def build_head_knight_male():
    # Centered around x: 24, y: 5 to 20
    # Spiky anime hair (Chestnut Brown FF style), open handsome face, sapphire eyes
    H1, H2, H3, HO = HAIR_KNIGHT_M_HL, HAIR_KNIGHT_M_MID, HAIR_KNIGHT_M_SHD, HAIR_KNIGHT_M_OUT
    SH, SL, SM, SS, SO = SKIN_HIGHLIGHT, SKIN_LIGHT, SKIN_MID, SKIN_SHADOW, SKIN_OUTLINE
    p = {}

    # Hair Spikes (top y: 4 to 9)
    # Spike 1 (left)
    p[(19, 7)] = HO; p[(20, 6)] = H2; p[(20, 5)] = HO; p[(21, 6)] = H1; p[(21, 7)] = H2
    # Spike 2 (center tall Cloud-style spike)
    p[(22, 5)] = HO; p[(23, 4)] = HO; p[(24, 3)] = HO; p[(25, 4)] = HO; p[(24, 4)] = H1; p[(24, 5)] = H1; p[(23, 5)] = H1
    # Spike 3 (right)
    p[(26, 5)] = HO; p[(27, 6)] = H2; p[(28, 7)] = HO; p[(26, 6)] = H1; p[(27, 7)] = H3

    # Hair Crown / volume (y: 8 to 11)
    for x in range(18, 30):
        p[(x, 8)] = H2
        p[(x, 9)] = H1 if 21 <= x <= 26 else H2
        p[(x, 10)] = H2
    p[(17, 8)] = HO; p[(30, 8)] = HO
    p[(17, 9)] = HO; p[(30, 9)] = HO
    p[(17, 10)] = HO; p[(30, 10)] = HO

    # Sideburns & bangs (y: 11 to 14)
    p[(17, 11)] = HO; p[(18, 11)] = H3; p[(18, 12)] = H3; p[(18, 13)] = HO
    p[(30, 11)] = HO; p[(29, 11)] = H3; p[(29, 12)] = H3; p[(29, 13)] = HO
    # Front anime bangs cut into forehead
    p[(20, 11)] = H1; p[(21, 12)] = H2; p[(21, 13)] = HO
    p[(25, 11)] = H1; p[(26, 12)] = H2; p[(26, 13)] = HO

    # Forehead & Face (y: 11 to 18)
    for y in range(11, 19):
        for x in range(19, 29):
            if (x, y) not in p:
                p[(x, y)] = SL

    # Forehead highlights
    p[(22, 11)] = SH; p[(23, 11)] = SH; p[(24, 11)] = SH

    # Eyebrows (y: 13)
    p[(20, 13)] = H3; p[(21, 13)] = H2
    p[(26, 13)] = H2; p[(27, 13)] = H3

    # Eyes (y: 14) - Sapphire Eyes with white catchlight
    p[(20, 14)] = C_DARK_OUTLINE; p[(21, 14)] = EYE_BLUE; p[(22, 14)] = EYE_WHITE
    p[(25, 14)] = EYE_WHITE; p[(26, 14)] = EYE_BLUE; p[(27, 14)] = C_DARK_OUTLINE

    # Cheeks & Nose (y: 15 to 16)
    p[(19, 15)] = SM; p[(28, 15)] = SM
    p[(23, 15)] = SM # nose bridge
    p[(24, 15)] = SS # nose tip
    p[(20, 16)] = SM; p[(27, 16)] = SM

    # Confident Smile (y: 17)
    p[(22, 17)] = SKIN_SHADOW
    p[(23, 17)] = C_DARK_OUTLINE; p[(24, 17)] = C_DARK_OUTLINE; p[(25, 17)] = (180, 90, 70, 255)

    # Jawline & Chin (y: 18 to 19)
    p[(18, 17)] = SO; p[(29, 17)] = SO
    p[(19, 18)] = SO; p[(20, 18)] = SM; p[(21, 18)] = SM; p[(22, 18)] = SL
    p[(23, 18)] = SL; p[(24, 18)] = SL; p[(25, 18)] = SM; p[(26, 18)] = SM; p[(27, 18)] = SO
    p[(21, 19)] = SO; p[(22, 19)] = SS; p[(23, 19)] = SM; p[(24, 19)] = SS; p[(25, 19)] = SO

    # Neck & Gorget collar (y: 20)
    p[(22, 20)] = C_STEEL_LIGHT; p[(23, 20)] = C_STEEL_WHITE; p[(24, 20)] = C_STEEL_LIGHT
    p[(21, 20)] = C_STEEL_MID; p[(25, 20)] = C_STEEL_MID

    return p

def build_head_knight_female(cape_sway=0):
    # Centered around x: 24, high golden-blonde ponytail flowing on the side, feminine facial structure
    H1, H2, H3, HO = HAIR_KNIGHT_F_HL, HAIR_KNIGHT_F_MID, HAIR_KNIGHT_F_SHD, HAIR_KNIGHT_F_OUT
    SH, SL, SM, SS, SO = SKIN_HIGHLIGHT, SKIN_LIGHT, SKIN_MID, SKIN_SHADOW, SKIN_OUTLINE
    p = {}

    # High Ponytail Ribbon (left side, x: 15-18, y: 7-9)
    p[(16, 7)] = C_BLUE_MID; p[(17, 7)] = C_BLUE_LIGHT; p[(16, 8)] = C_GOLD_MID; p[(17, 8)] = C_BLUE_DARK
    # Flowing Ponytail (left side, waving with cape)
    px = 15 + cape_sway
    p[(px, 9)] = H1; p[(px - 1, 9)] = HO
    p[(px - 1, 10)] = H2; p[(px, 10)] = H1; p[(px + 1, 10)] = H3
    p[(px - 2, 11)] = HO; p[(px - 1, 11)] = H1; p[(px, 11)] = H2
    p[(px - 2, 12)] = H2; p[(px - 1, 12)] = H1; p[(px, 12)] = HO
    p[(px - 2, 13)] = H3; p[(px - 1, 13)] = HO

    # Hair Dome / Volume (y: 5 to 10)
    for x in range(18, 30):
        p[(x, 6)] = H2
        p[(x, 7)] = H1 if 21 <= x <= 26 else H2
        p[(x, 8)] = H1
        p[(x, 9)] = H2
    p[(18, 5)] = HO; p[(19, 5)] = HO; p[(28, 5)] = HO; p[(29, 5)] = HO
    p[(17, 6)] = HO; p[(30, 6)] = HO
    p[(17, 7)] = HO; p[(30, 7)] = HO

    # Side bangs framing face (y: 10 to 15)
    p[(18, 10)] = H2; p[(18, 11)] = H1; p[(18, 12)] = H2; p[(18, 13)] = H3; p[(18, 14)] = HO
    p[(29, 10)] = H2; p[(29, 11)] = H1; p[(29, 12)] = H2; p[(29, 13)] = H3; p[(29, 14)] = HO

    # Forehead bangs (y: 10 to 12)
    p[(20, 10)] = H1; p[(21, 11)] = H2; p[(21, 12)] = HO
    p[(26, 10)] = H1; p[(25, 11)] = H2; p[(25, 12)] = HO

    # Feminine Face Fill (y: 11 to 18)
    for y in range(11, 19):
        for x in range(19, 29):
            if (x, y) not in p:
                p[(x, y)] = SL

    # Highlights
    p[(22, 11)] = SH; p[(23, 11)] = SH; p[(24, 11)] = SH

    # Arched Eyebrows (y: 13)
    p[(20, 13)] = H3; p[(21, 13)] = H2
    p[(26, 13)] = H2; p[(27, 13)] = H3

    # Radiant Sapphire Eyes (y: 14) with catchlight
    p[(20, 14)] = C_DARK_OUTLINE; p[(21, 14)] = C_BLUE_MID; p[(22, 14)] = EYE_WHITE
    p[(25, 14)] = EYE_WHITE; p[(26, 14)] = C_BLUE_MID; p[(27, 14)] = C_DARK_OUTLINE

    # Soft Blush & Nose (y: 15 to 16)
    p[(19, 15)] = (250, 180, 180, 255); p[(28, 15)] = (250, 180, 180, 255) # soft blush
    p[(23, 15)] = SM; p[(24, 15)] = SS
    p[(20, 16)] = SM; p[(27, 16)] = SM

    # Gentle Feminine Smile (y: 17)
    p[(22, 17)] = LIP_PINK; p[(23, 17)] = LIP_ROSE; p[(24, 17)] = LIP_ROSE; p[(25, 17)] = LIP_PINK

    # Slender Jawline & Chin (y: 18 to 19)
    p[(19, 17)] = SO; p[(28, 17)] = SO
    p[(20, 18)] = SO; p[(21, 18)] = SM; p[(22, 18)] = SL; p[(23, 18)] = SL; p[(24, 18)] = SL; p[(25, 18)] = SM; p[(26, 18)] = SO
    p[(22, 19)] = SO; p[(23, 19)] = SM; p[(24, 19)] = SO

    # Elegant Gorget / Neck (y: 20)
    p[(22, 20)] = C_STEEL_LIGHT; p[(23, 20)] = C_STEEL_WHITE; p[(24, 20)] = C_STEEL_LIGHT

    return p

def build_head_mage_male():
    # Styled Dark Teal scholar hair, noble gentle face, emerald-cyan eyes
    H1, H2, H3, HO = HAIR_MAGE_M_HL, HAIR_MAGE_M_MID, HAIR_MAGE_M_SHD, HAIR_MAGE_M_OUT
    SH, SL, SM, SS, SO = SKIN_HIGHLIGHT, SKIN_LIGHT, SKIN_MID, SKIN_SHADOW, SKIN_OUTLINE
    p = {}

    # Draped Cowl behind head (y: 5 to 10)
    for x in range(16, 32):
        p[(x, 7)] = C_EMERALD_DARK
        p[(x, 8)] = C_EMERALD_MID
    p[(16, 9)] = C_EMERALD_DEEP; p[(31, 9)] = C_EMERALD_DEEP

    # Hair Crown (y: 7 to 11)
    for x in range(18, 30):
        p[(x, 8)] = H2
        p[(x, 9)] = H1 if 20 <= x <= 25 else H2
        p[(x, 10)] = H2
    p[(17, 8)] = HO; p[(30, 8)] = HO
    p[(17, 9)] = HO; p[(30, 9)] = HO

    # Scholar Bangs with center part (y: 11 to 13)
    p[(18, 11)] = H1; p[(19, 12)] = H2; p[(19, 13)] = HO
    p[(28, 11)] = H1; p[(27, 12)] = H2; p[(27, 13)] = HO
    p[(22, 11)] = H2; p[(22, 12)] = HO # left part
    p[(25, 11)] = H1; p[(25, 12)] = HO # right part

    # Face Fill (y: 11 to 18)
    for y in range(11, 19):
        for x in range(19, 29):
            if (x, y) not in p:
                p[(x, y)] = SL

    # Calm Dark-Teal Eyes (y: 14)
    p[(20, 14)] = C_DARK_OUTLINE; p[(21, 14)] = EYE_GREEN; p[(22, 14)] = EYE_WHITE
    p[(25, 14)] = EYE_WHITE; p[(26, 14)] = EYE_GREEN; p[(27, 14)] = C_DARK_OUTLINE

    # Nose & Scholar Expression (y: 15 to 17)
    p[(23, 15)] = SM; p[(24, 15)] = SS
    p[(22, 17)] = SM; p[(23, 17)] = C_DARK_OUTLINE; p[(24, 17)] = C_DARK_OUTLINE; p[(25, 17)] = SM

    # Jaw & Collar (y: 18 to 20)
    p[(20, 18)] = SO; p[(21, 18)] = SM; p[(22, 18)] = SL; p[(23, 18)] = SL; p[(24, 18)] = SL; p[(25, 18)] = SM; p[(26, 18)] = SO
    p[(22, 19)] = SO; p[(23, 19)] = SM; p[(24, 19)] = SO
    p[(21, 20)] = C_GOLD_MID; p[(22, 20)] = (254, 243, 199, 255); p[(23, 20)] = C_EMERALD_MID; p[(24, 20)] = (254, 243, 199, 255); p[(25, 20)] = C_GOLD_MID

    return p

def build_head_mage_female():
    # Long flowing dark hair, braided emerald ribbons, kind warm face
    H1, H2, H3, HO = HAIR_MAGE_F_HL, HAIR_MAGE_F_MID, HAIR_MAGE_F_SHD, HAIR_MAGE_F_OUT
    SH, SL, SM, SS, SO = SKIN_HIGHLIGHT, SKIN_LIGHT, SKIN_MID, SKIN_SHADOW, SKIN_OUTLINE
    p = {}

    # Draped Cowl behind head (y: 5 to 8)
    for x in range(16, 32):
        p[(x, 7)] = C_EMERALD_MID
        p[(x, 8)] = C_EMERALD_DARK

    # Hair Dome (y: 7 to 11)
    for x in range(18, 30):
        p[(x, 8)] = H2
        p[(x, 9)] = H1 if 21 <= x <= 26 else H2
        p[(x, 10)] = H2
    p[(17, 8)] = HO; p[(30, 8)] = HO

    # Long Side locks with Emerald Ribbon Ties (y: 10 to 16)
    p[(17, 10)] = HO; p[(17, 11)] = H2; p[(17, 12)] = C_EMERALD_LGT; p[(17, 13)] = H3; p[(17, 14)] = HO
    p[(30, 10)] = HO; p[(30, 11)] = H2; p[(30, 12)] = C_EMERALD_LGT; p[(30, 13)] = H3; p[(30, 14)] = HO
    p[(18, 12)] = H2; p[(18, 13)] = H1; p[(18, 14)] = H3; p[(18, 15)] = HO
    p[(29, 12)] = H2; p[(29, 13)] = H1; p[(29, 14)] = H3; p[(29, 15)] = HO

    # Forehead bangs (y: 11 to 12)
    p[(20, 11)] = H1; p[(21, 12)] = HO
    p[(26, 11)] = H1; p[(25, 12)] = HO

    # Feminine Face Fill (y: 11 to 18)
    for y in range(11, 19):
        for x in range(19, 29):
            if (x, y) not in p:
                p[(x, y)] = SL

    # Emerald Green Eyes with White Sparkle (y: 14)
    p[(20, 14)] = C_DARK_OUTLINE; p[(21, 14)] = EYE_GREEN; p[(22, 14)] = EYE_WHITE
    p[(25, 14)] = EYE_WHITE; p[(26, 14)] = EYE_GREEN; p[(27, 14)] = C_DARK_OUTLINE

    # Soft Blush & Warm Lips (y: 15 to 17)
    p[(19, 15)] = (252, 190, 190, 255); p[(28, 15)] = (252, 190, 190, 255)
    p[(23, 15)] = SM; p[(24, 15)] = SS
    p[(22, 17)] = LIP_PINK; p[(23, 17)] = LIP_ROSE; p[(24, 17)] = LIP_ROSE; p[(25, 17)] = LIP_PINK

    # Slender Chin & Collar (y: 18 to 20)
    p[(20, 18)] = SO; p[(21, 18)] = SM; p[(22, 18)] = SL; p[(23, 18)] = SL; p[(24, 18)] = SL; p[(25, 18)] = SM; p[(26, 18)] = SO
    p[(22, 19)] = SO; p[(23, 19)] = SM; p[(24, 19)] = SO
    p[(21, 20)] = C_GOLD_MID; p[(22, 20)] = (254, 243, 199, 255); p[(23, 20)] = C_EMERALD_MID; p[(24, 20)] = (254, 243, 199, 255); p[(25, 20)] = C_GOLD_MID

    return p

def build_head_assassin_male():
    # Spiky dark hair with amber tips, amber bandana, sharp roguish smirk
    H1, H2, H3, HO = HAIR_ASSASSIN_M_HL, HAIR_ASSASSIN_M_MID, HAIR_ASSASSIN_M_SHD, HAIR_ASSASSIN_M_OUT
    SH, SL, SM, SS, SO = SKIN_HIGHLIGHT, SKIN_LIGHT, SKIN_MID, SKIN_SHADOW, SKIN_OUTLINE
    p = {}

    # Amber-tipped Spikes (y: 6 to 9)
    p[(19, 8)] = HO; p[(20, 7)] = H1; p[(20, 6)] = HO; p[(21, 7)] = H2
    p[(23, 5)] = HO; p[(24, 4)] = HO; p[(25, 5)] = HO; p[(24, 5)] = H1; p[(24, 6)] = H2
    p[(27, 6)] = HO; p[(28, 7)] = H1; p[(29, 8)] = HO; p[(27, 7)] = H2

    # Hair Crown (y: 8 to 10)
    for x in range(18, 30):
        p[(x, 8)] = H3
        p[(x, 9)] = H2
    p[(17, 9)] = HO; p[(30, 9)] = HO

    # Amber Rogue Bandana (y: 10 to 11)
    for x in range(17, 31):
        p[(x, 10)] = C_AMBER_LIGHT if 21 <= x <= 26 else C_AMBER_MID
        p[(x, 11)] = C_AMBER_MID if 21 <= x <= 26 else C_AMBER_DARK
    p[(16, 10)] = C_DARK_OUTLINE; p[(31, 10)] = C_DARK_OUTLINE

    # Hair bangs under bandana (y: 12 to 13)
    p[(19, 12)] = H2; p[(20, 13)] = HO
    p[(27, 12)] = H2; p[(28, 13)] = HO

    # Face Fill (y: 12 to 18)
    for y in range(12, 19):
        for x in range(19, 29):
            if (x, y) not in p:
                p[(x, y)] = SL

    # Sharp Amber Eyes (y: 14)
    p[(20, 14)] = C_DARK_OUTLINE; p[(21, 14)] = EYE_AMBER; p[(22, 14)] = EYE_WHITE
    p[(25, 14)] = EYE_WHITE; p[(26, 14)] = EYE_AMBER; p[(27, 14)] = C_DARK_OUTLINE

    # Roguish Smirk (y: 16 to 17)
    p[(23, 15)] = SM; p[(24, 15)] = SS
    p[(22, 17)] = SM; p[(23, 17)] = C_DARK_OUTLINE; p[(24, 17)] = C_DARK_OUTLINE; p[(25, 16)] = C_DARK_OUTLINE

    # Jaw & Leather Collar (y: 18 to 20)
    p[(20, 18)] = SO; p[(21, 18)] = SM; p[(22, 18)] = SL; p[(23, 18)] = SL; p[(24, 18)] = SL; p[(25, 18)] = SM; p[(26, 18)] = SO
    p[(22, 19)] = SO; p[(23, 19)] = SM; p[(24, 19)] = SO
    p[(21, 20)] = C_LEATHER_DARK; p[(22, 20)] = C_AMBER_MID; p[(23, 20)] = C_LEATHER_DARK; p[(24, 20)] = C_AMBER_MID; p[(25, 20)] = C_LEATHER_DARK

    return p

def build_head_assassin_female():
    # Auburn twin side braids, agile feline amber eyes, confident rogue grin
    H1, H2, H3, HO = HAIR_ASSASSIN_F_HL, HAIR_ASSASSIN_F_MID, HAIR_ASSASSIN_F_SHD, HAIR_ASSASSIN_F_OUT
    SH, SL, SM, SS, SO = SKIN_HIGHLIGHT, SKIN_LIGHT, SKIN_MID, SKIN_SHADOW, SKIN_OUTLINE
    p = {}

    # Hair Dome (y: 6 to 10)
    for x in range(18, 30):
        p[(x, 7)] = H2
        p[(x, 8)] = H1 if 21 <= x <= 26 else H2
        p[(x, 9)] = H2
    p[(17, 7)] = HO; p[(30, 7)] = HO; p[(17, 8)] = HO; p[(30, 8)] = HO

    # Twin Side Braids with dark leather ties (y: 9 to 16)
    p[(16, 9)] = HO; p[(16, 10)] = H2; p[(16, 11)] = H1; p[(16, 12)] = H2; p[(16, 13)] = C_LEATHER_DARK; p[(16, 14)] = H3; p[(16, 15)] = HO
    p[(31, 9)] = HO; p[(31, 10)] = H2; p[(31, 11)] = H1; p[(31, 12)] = H2; p[(31, 13)] = C_LEATHER_DARK; p[(31, 14)] = H3; p[(31, 15)] = HO
    p[(17, 11)] = H2; p[(17, 12)] = H1; p[(17, 13)] = H3
    p[(30, 11)] = H2; p[(30, 12)] = H1; p[(30, 13)] = H3

    # Bangs (y: 10 to 12)
    p[(20, 10)] = H1; p[(21, 11)] = H2; p[(21, 12)] = HO
    p[(26, 10)] = H1; p[(25, 11)] = H2; p[(25, 12)] = HO

    # Face Fill (y: 11 to 18)
    for y in range(11, 19):
        for x in range(19, 29):
            if (x, y) not in p:
                p[(x, y)] = SL

    # Feline Amber Eyes (y: 14)
    p[(20, 14)] = C_DARK_OUTLINE; p[(21, 14)] = EYE_AMBER; p[(22, 14)] = EYE_WHITE
    p[(25, 14)] = EYE_WHITE; p[(26, 14)] = EYE_AMBER; p[(27, 14)] = C_DARK_OUTLINE

    # Subtle Blush & Smile (y: 15 to 17)
    p[(19, 15)] = (250, 185, 180, 255); p[(28, 15)] = (250, 185, 180, 255)
    p[(23, 15)] = SM; p[(24, 15)] = SS
    p[(22, 17)] = LIP_PINK; p[(23, 17)] = LIP_ROSE; p[(24, 17)] = LIP_ROSE; p[(25, 17)] = LIP_PINK

    # Slender Jawline & Collar (y: 18 to 20)
    p[(20, 18)] = SO; p[(21, 18)] = SM; p[(22, 18)] = SL; p[(23, 18)] = SL; p[(24, 18)] = SL; p[(25, 18)] = SM; p[(26, 18)] = SO
    p[(22, 19)] = SO; p[(23, 19)] = SM; p[(24, 19)] = SO
    p[(21, 20)] = C_AMBER_MID; p[(22, 20)] = C_LEATHER_DARK; p[(23, 20)] = C_AMBER_MID; p[(24, 20)] = C_LEATHER_DARK; p[(25, 20)] = C_AMBER_MID

    return p


def remaster_spritesheet(base_img, role, gender):
    out = base_img.copy()

    # Determine head builder
    if role == 'knight':
        head_builder = build_head_knight_male if gender == 'male' else build_head_knight_female
    elif role == 'mage':
        head_builder = build_head_mage_male if gender == 'male' else build_head_mage_female
    else:
        head_builder = build_head_assassin_male if gender == 'male' else build_head_assassin_female

    # Apply head to all 12 frames
    for row in range(3):
        for col in range(4):
            x_off = col * 48
            y_off = row * 48

            # Determine dy offset matching authentic base
            dy = 0
            if role == 'knight':
                if row == 0: dy = [0, -1, -1, 0][col]
                elif row == 1: dy = [0, -1, 0, -1][col]
                elif row == 2: dy = [-3, 1, 0, -1][col]
            elif role == 'mage':
                if row == 0: dy = [0, -3, -6, -2][col]
                elif row == 1: dy = [-2, -6, -2, -6][col]
                elif row == 2: dy = [-6, -6, -6, -3][col]
            elif role == 'assassin':
                if row == 0: dy = [0, 1, 0, 1][col]
                elif row == 1: dy = [1, 0, 1, 0][col]
                elif row == 2: dy = [2, 1, 0, 1][col]

            # Clear old helmet in head box (x: 16 to 32, y: 3 to 20 + dy)
            for gy in range(y_off + 2 + dy, y_off + 21 + dy):
                for gx in range(x_off + 15, x_off + 33):
                    # Keep armor at bottom (y >= 21)
                    if gy < y_off + 21 + dy:
                        out.putpixel((gx, gy), (0, 0, 0, 0))

            # Build and apply head pixels
            if role == 'knight' and gender == 'female':
                cape_sway = [-1, 0, 1, 0][col] if row != 2 else [0, -2, 2, 1][col]
                head_pixels = head_builder(cape_sway)
            else:
                head_pixels = head_builder()

            apply_pixel_map(out, x_off, y_off, dy, head_pixels)

            # For female knight, taper waist slightly for an authentic heroic female warrior look
            if role == 'knight' and gender == 'female':
                # shave 1 px on edges of waist (lines 24 to 28)
                for wy in range(y_off + 24 + dy, y_off + 29 + dy):
                    if wy < out.height:
                        # left edge waist
                        out.putpixel((x_off + 18, wy), (0, 0, 0, 0))
                        # right edge waist
                        out.putpixel((x_off + 30, wy), (0, 0, 0, 0))

    return out

def main():
    templates = get_base_templates()

    configs = [
        ('hero_knight_male_spritesheet.png', templates['knight'], 'knight', 'male'),
        ('hero_knight_female_spritesheet.png', templates['knight'], 'knight', 'female'),
        ('hero_mage_male_spritesheet.png', templates['mage'], 'mage', 'male'),
        ('hero_mage_female_spritesheet.png', templates['mage'], 'mage', 'female'),
        ('hero_assassin_male_spritesheet.png', templates['assassin'], 'assassin', 'male'),
        ('hero_assassin_female_spritesheet.png', templates['assassin'], 'assassin', 'female'),
    ]

    os.makedirs('public/assets/heroes/sprites', exist_ok=True)

    for fname, tpl, role, gender in configs:
        res = remaster_spritesheet(tpl, role, gender)
        path = os.path.join('public/assets/heroes/sprites', fname)
        res.save(path)
        print(f'Remastered: {path} ({res.size})')

    # Also update fallbacks
    remaster_spritesheet(templates['knight'], 'knight', 'male').save('public/assets/dungeon/hero_knight_spritesheet.png')
    remaster_spritesheet(templates['mage'], 'mage', 'female').save('public/assets/dungeon/hero_mage_spritesheet.png')
    remaster_spritesheet(templates['assassin'], 'assassin', 'male').save('public/assets/dungeon/hero_assassin_spritesheet.png')
    print('Updated dungeon fallback sprites!')

if __name__ == '__main__':
    main()
