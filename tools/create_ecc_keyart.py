import os
from PIL import Image, ImageFilter, ImageOps, ImageEnhance, ImageDraw, ImageFont

def create_watercolor_paper(width, height):
    # Base parchment paper with soft gradient from cerulean to ivory-cream
    base = Image.new('RGBA', (width, height), (246, 248, 252, 255))
    draw = ImageDraw.Draw(base)
    
    # Soft watercolor sky wash on top and right
    for y in range(height):
        # subtle gradient: cooler cyan-blue at top-right, warm cream at bottom-left
        alpha = int(80 * (1 - y / height))
        draw.line([(0, y), (width, y)], fill=(205, 230, 248, alpha))
        
    return base

def extract_character(sheet, bbox, bg_threshold=70):
    crop = sheet.crop(bbox).convert('RGBA')
    w, h = crop.size
    
    # Advanced color-distance background mask
    mask = Image.new('L', (w, h), 255)
    
    # Background samples around border
    for y in range(h):
        for x in range(w):
            r, g, b, a = crop.getpixel((x, y))
            # Stone wall / floor detection: dark desaturated stone or bottom floor tile
            # Most background pixels have r,g,b close to each other and dark, or warm floor grey
            diff = max(abs(r-g), abs(g-b), abs(r-b))
            is_dark_stone = (r < 75 and g < 75 and b < 80 and diff < 22)
            is_floor_edge = (y > h - 45 and diff < 20 and r < 140 and g < 135 and b < 135)
            is_top_corner = (y < 20 and (x < 15 or x > w - 15) and r < 90 and g < 90)
            
            if is_dark_stone or is_floor_edge or is_top_corner:
                mask.putpixel((x, y), 0)
                
    # Smooth edges slightly for watercolor feel
    mask = mask.filter(ImageFilter.GaussianBlur(radius=0.7))
    crop.putalpha(mask)
    return crop

def apply_watercolor_sketch_look(img, opacity=1.0, is_background_ethereal=False):
    # Converts crisp pixels into a soft watercolor & ink wash
    w, h = img.size
    
    if is_background_ethereal:
        # Soft pencil sketch effect with pastel watercolor wash
        gray = img.convert('L')
        # Soft pencil edges
        edges = gray.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(radius=0.5))
        edges = ImageOps.invert(edges)
        
        # Color wash: pastel, lightened, soft
        color_wash = img.filter(ImageFilter.GaussianBlur(radius=1.5))
        color_wash = ImageEnhance.Color(color_wash).enhance(0.65)
        color_wash = ImageEnhance.Brightness(color_wash).enhance(1.4)
        
        # Blend edges and color
        res = Image.blend(color_wash.convert('RGB'), edges.convert('RGB'), 0.18).convert('RGBA')
        
        # Soft alpha mask with ethereal radial fade
        alpha = img.split()[3]
        fade_mask = Image.new('L', (w, h), 255)
        f_draw = ImageDraw.Draw(fade_mask)
        # Vignette fade around edges
        for y in range(h):
            for x in range(w):
                dist = ((x - w/2)**2 / (w/2)**2 + (y - h/2)**2 / (h/2)**2) ** 0.5
                if dist > 0.6:
                    val = max(0, int(255 * (1 - (dist - 0.6) / 0.4)))
                    fade_mask.putpixel((x, y), min(fade_mask.getpixel((x, y)), val))
                    
        # Combine alphas
        final_alpha = ImageChops_multiply(alpha, fade_mask) if 'ImageChops_multiply' in globals() else alpha
        # Reduce overall opacity for background figure
        final_alpha = ImageEnhance.Brightness(final_alpha).enhance(0.45 * opacity)
        res.putalpha(final_alpha)
        return res
    else:
        # Foreground hero: rich watercolor with pencil contours
        res = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=2))
        return res

def ImageChops_multiply(im1, im2):
    from PIL import ImageChops
    return ImageChops.multiply(im1, im2)

def main():
    W, H = 1000, 600
    
    # 1. Base watercolor paper & celestial atmosphere
    canvas = create_watercolor_paper(W, H)
    
    # Celestial cloud sky background
    celestial_path = '/home/fauzan/.gemini/antigravity-ide/brain/a4adcff8-1666-4dce-b640-01b87881ace6/stage4_celestial_sanctuary_1790937699128.jpg'
    if os.path.exists(celestial_path):
        sky = Image.open(celestial_path).resize((W, H), Image.Resampling.LANCZOS)
        sky = sky.convert('RGBA').filter(ImageFilter.GaussianBlur(radius=6))
        sky = ImageEnhance.Color(sky).enhance(0.45)
        sky = ImageEnhance.Brightness(sky).enhance(1.35)
        # Blend sky onto canvas with soft watercolor wash
        canvas = Image.blend(canvas, sky, 0.42)

    # 2. Extract high-res characters from the roster
    roster_path = '/home/fauzan/.gemini/antigravity-ide/brain/a4adcff8-1666-4dce-b640-01b87881ace6/ff_roster_lineup_1790943243133.jpg'
    roster = Image.open(roster_path)
    
    # Characters:
    # Sylvia (Female Mage / Ethereal Maiden for background)
    sylvia_raw = extract_character(roster, (695, 220, 930, 715))
    # Valen (Male Knight in front)
    valen_raw = extract_character(roster, (15, 220, 235, 715))
    # Aria (Female Knight)
    aria_raw = extract_character(roster, (235, 220, 445, 715))
    # Rowan (Male Mage)
    rowan_raw = extract_character(roster, (470, 220, 695, 715))
    # Ren (Male Assassin)
    ren_raw = extract_character(roster, (925, 220, 1145, 715))

    # 3. Background Ethereal Guardian / Maiden (Matching the user reference image!)
    # In the reference image, a large serene maiden's bust overlooks the scene from the clouds
    # We use Sylvia's portrait magnified and softly faded into the celestial clouds!
    guardian = sylvia_raw.crop((10, 0, sylvia_raw.width - 10, int(sylvia_raw.height * 0.65)))
    gw = int(guardian.width * 1.55)
    gh = int(guardian.height * 1.55)
    guardian = guardian.resize((gw, gh), Image.Resampling.LANCZOS)
    guardian_wash = apply_watercolor_sketch_look(guardian, opacity=0.75, is_background_ethereal=True)
    # Paste guardian in upper-middle background (x: 240, y: 30)
    canvas.paste(guardian_wash, (220, 20), guardian_wash)

    # 4. Foreground Hero Grouping
    # Scale heroes gracefully
    # Rowan (Mage) on the left-back
    r_w = int(rowan_raw.width * 0.88); r_h = int(rowan_raw.height * 0.88)
    rowan_fg = rowan_raw.resize((r_w, r_h), Image.Resampling.LANCZOS)
    canvas.paste(rowan_fg, (40, H - r_h - 20), rowan_fg)

    # Ren (Rogue Assassin) on mid-back
    ren_w = int(ren_raw.width * 0.84); ren_h = int(ren_raw.height * 0.84)
    ren_fg = ren_raw.resize((ren_w, ren_h), Image.Resampling.LANCZOS)
    canvas.paste(ren_fg, (220, H - ren_h - 25), ren_fg)

    # Aria (Female Knight) on mid-front
    aria_w = int(aria_raw.width * 0.94); aria_h = int(aria_raw.height * 0.94)
    aria_fg = aria_raw.resize((aria_w, aria_h), Image.Resampling.LANCZOS)
    canvas.paste(aria_fg, (130, H - aria_h - 10), aria_fg)

    # Valen (Male Knight - Heroic Lead in front, sword & shield ready!)
    valen_w = int(valen_raw.width * 1.02); valen_h = int(valen_raw.height * 1.02)
    valen_fg = valen_raw.resize((valen_w, valen_h), Image.Resampling.LANCZOS)
    canvas.paste(valen_fg, (290, H - valen_h - 5), valen_fg)

    # 5. Right Side: Elegant JRPG Typography & Logo
    # Draw artistic parchment banner, title, and gold flourish
    draw = ImageDraw.Draw(canvas)
    
    # Official ECC Logo (tasteful badge at top right)
    logo_path = 'public/assets/ecc-logo.png'
    if os.path.exists(logo_path):
        ecc_logo = Image.open(logo_path).convert('RGBA')
        logo_w = 64
        logo_h = int(ecc_logo.height * (logo_w / ecc_logo.width))
        ecc_logo = ecc_logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        canvas.paste(ecc_logo, (W - 120, 45), ecc_logo)

    # Typography: Try to load system fonts or fallback cleanly
    font_title = None
    font_sub = None
    font_kicker = None
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf"
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            font_title = ImageFont.truetype(fp, 46)
            font_sub = ImageFont.truetype(fp, 18)
            font_kicker = ImageFont.truetype(fp, 13)
            break
            
    if font_title is None:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_kicker = ImageFont.load_default()

    # Right side text block (x: 520 to 940)
    tx = 530
    ty = 160

    # Kicker line
    draw.text((tx, ty), "SIAP IMPACT 2026 · LEARNING SAGA", fill=(120, 75, 25, 255), font=font_kicker)
    draw.line([(tx, ty + 24), (tx + 360, ty + 24)], fill=(200, 160, 90, 200), width=1)

    # Main Title: ECC FUTURE QUEST
    # Subtle drop shadow
    draw.text((tx + 2, ty + 38), "ECC", fill=(210, 180, 140, 120), font=font_title)
    draw.text((tx, ty + 36), "ECC", fill=(30, 41, 59, 255), font=font_title)

    draw.text((tx + 2, ty + 92), "FUTURE QUEST", fill=(210, 180, 140, 120), font=font_title)
    draw.text((tx, ty + 90), "FUTURE QUEST", fill=(15, 23, 42, 255), font=font_title)

    # Subtitle with gold filigree ornaments
    draw.line([(tx, ty + 158), (tx + 120, ty + 158)], fill=(217, 119, 6, 255), width=2)
    draw.point((tx + 126, ty + 158), fill=(245, 158, 11, 255))
    draw.line([(tx + 132, ty + 158), (tx + 360, ty + 158)], fill=(217, 119, 6, 255), width=2)

    draw.text((tx + 30, ty + 172), "THE JOURNEY OF IMPACT", fill=(180, 83, 9, 255), font=font_sub)
    draw.text((tx, ty + 208), "PILIH PERAN · VALIDASI MASALAH · CIPTAKAN DAMPAK", fill=(71, 85, 105, 255), font=font_kicker)

    # 3 Role Badges on the bottom right (Knight / Mage / Assassin)
    badge_y = ty + 250
    roles = [
        ("KSATRIA (KNIGHT)", "Professional Track", (37, 99, 235)),
        ("MISTIKUS (MAGE)", "Social Impact Track", (16, 185, 129)),
        ("ASSASSIN (ROGUE)", "Business Track", (217, 119, 6))
    ]
    for idx, (r_name, r_track, r_col) in enumerate(roles):
        by = badge_y + idx * 44
        # decorative dot
        draw.ellipse([tx, by + 4, tx + 8, by + 12], fill=r_col)
        draw.text((tx + 18, by), r_name, fill=(15, 23, 42, 255), font=font_kicker)
        draw.text((tx + 160, by + 1), f"·  {r_track}", fill=(100, 116, 139, 255), font=font_kicker)

    # 6. Soft Watercolor Border Vignette
    # A gentle inner frame simulating classic storybook JRPG box art
    draw.rectangle([8, 8, W - 9, H - 9], outline=(200, 175, 135, 180), width=1)
    draw.rectangle([12, 12, W - 13, H - 13], outline=(220, 205, 175, 100), width=1)

    os.makedirs('public/assets/landing', exist_ok=True)
    out_path = 'public/assets/landing/ecc_future_quest_keyart.png'
    canvas.save(out_path, format='PNG', optimize=True)
    print(f'Successfully saved ECC Future Quest Key Art to {out_path} ({canvas.size})')

if __name__ == '__main__':
    main()
