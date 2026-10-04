import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_base_logo(size=1024, is_foreground_only=False, is_round=False, corner_radius_pct=0.22):
    """
    Creates a high-resolution KlikPDF brand icon.
    - if is_foreground_only=True: transparent background, sized within safe zone for Android Adaptive Icon.
    - if is_foreground_only=False: rich gradient background, full app icon.
    """
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    if not is_foreground_only:
        # 1. Background Gradient (Crimson #EB322D to Deep Ruby #881337)
        bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        bg_draw = ImageDraw.Draw(bg)
        
        c1 = (235, 50, 45)    # #EB322D vibrant crimson
        c2 = (184, 0, 53)     # #B80035 deep ruby
        c3 = (136, 19, 55)    # #881337 dark berry
        
        for y in range(size):
            t = y / size
            if t < 0.5:
                sub_t = t / 0.5
                r = int(c1[0] + (c2[0] - c1[0]) * sub_t)
                g = int(c1[1] + (c2[1] - c1[1]) * sub_t)
                b = int(c1[2] + (c2[2] - c1[2]) * sub_t)
            else:
                sub_t = (t - 0.5) / 0.5
                r = int(c2[0] + (c3[0] - c2[0]) * sub_t)
                g = int(c2[1] + (c3[1] - c2[1]) * sub_t)
                b = int(c2[2] + (c3[2] - c2[2]) * sub_t)
            bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
            
        # Top-left radial specular highlight
        highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        h_draw = ImageDraw.Draw(highlight)
        center_x, center_y = int(size * 0.25), int(size * 0.2)
        max_r = int(size * 0.6)
        for r_step in range(max_r, 0, -4):
            alpha = int(35 * (1 - r_step / max_r))
            h_draw.ellipse(
                [center_x - r_step, center_y - r_step, center_x + r_step, center_y + r_step],
                fill=(255, 255, 255, alpha)
            )
        bg = Image.alpha_composite(bg, highlight)
        
        # Mask with squircle or round
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        if is_round:
            mask_draw.ellipse([0, 0, size, size], fill=255)
        elif corner_radius_pct > 0:
            rad = int(size * corner_radius_pct)
            mask_draw.rounded_rectangle([0, 0, size, size], radius=rad, fill=255)
        else:
            mask_draw.rectangle([0, 0, size, size], fill=255)
            
        canvas.paste(bg, (0, 0), mask)

    # Scale factor for content
    if is_foreground_only:
        # Safe zone in Android adaptive icons is 66dp / 108dp ≈ 61%
        content_scale = 0.60
    else:
        content_scale = 0.68

    cx, cy = size // 2, size // 2
    doc_w = int(size * content_scale * 0.82)
    doc_h = int(size * content_scale * 1.05)
    corner_r = int(size * 0.055)
    
    # 2. Back Document Sheet (Tilted ~ -6 degrees)
    back_sheet = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bs_draw = ImageDraw.Draw(back_sheet)
    bx0 = cx - doc_w // 2 - int(size * 0.04)
    by0 = cy - doc_h // 2 - int(size * 0.03)
    bx1 = bx0 + doc_w
    by1 = by0 + doc_h
    bs_draw.rounded_rectangle([bx0, by0, bx1, by1], radius=corner_r, fill=(255, 255, 255, 120))
    back_sheet_rot = back_sheet.rotate(7, resample=Image.BICUBIC, center=(cx, cy))
    canvas = Image.alpha_composite(canvas, back_sheet_rot)

    # 3. Drop Shadow for Front Sheet
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(shadow)
    fx0 = cx - doc_w // 2
    fy0 = cy - doc_h // 2
    fx1 = fx0 + doc_w
    fy1 = fy0 + doc_h
    sh_offset = int(size * 0.02)
    sh_draw.rounded_rectangle([fx0 + sh_offset, fy0 + sh_offset + int(size * 0.015), fx1 + sh_offset, fy1 + sh_offset + int(size * 0.015)], radius=corner_r, fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(size * 0.025)))
    canvas = Image.alpha_composite(canvas, shadow)

    # 4. Front Document Sheet (Crisp White Card with Folded Top-Right Corner)
    front_sheet = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fs_draw = ImageDraw.Draw(front_sheet)
    
    fold_size = int(doc_w * 0.32)
    fs_draw.rounded_rectangle([fx0, fy0, fx1, fy1], radius=corner_r, fill=(255, 255, 255, 255))
    
    # Cut off top right corner
    cut_mask = Image.new("L", (size, size), 255)
    cut_draw = ImageDraw.Draw(cut_mask)
    cut_draw.polygon([
        (fx1 - fold_size, fy0 - 2),
        (fx1 + 2, fy0 - 2),
        (fx1 + 2, fy0 + fold_size)
    ], fill=0)
    front_sheet.putalpha(Image.composite(front_sheet.getchannel('A'), cut_mask, cut_mask))
    
    # Draw Fold Flap
    flap = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    flap_draw = ImageDraw.Draw(flap)
    flap_points = [
        (fx1 - fold_size, fy0),
        (fx1 - fold_size, fy0 + fold_size - int(corner_r * 0.4)),
        (fx1, fy0 + fold_size)
    ]
    # Subtle flap shadow
    flap_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fsh_draw = ImageDraw.Draw(flap_shadow)
    fsh_draw.polygon(flap_points, fill=(0, 0, 0, 70))
    flap_shadow = flap_shadow.filter(ImageFilter.GaussianBlur(int(size * 0.01)))
    canvas = Image.alpha_composite(canvas, flap_shadow)
    
    # Flap body (warm red accent)
    flap_draw.polygon(flap_points, fill=(225, 29, 72, 240)) # #E11D48
    canvas = Image.alpha_composite(canvas, front_sheet)
    canvas = Image.alpha_composite(canvas, flap)

    # 5. Document Badge & Emblem (PDF text & icon lines)
    decor = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d_draw = ImageDraw.Draw(decor)
    
    # Prominent PDF Badge (Crimson Pill with "PDF" white text)
    badge_w = int(doc_w * 0.72)
    badge_h = int(doc_h * 0.28)
    badge_x0 = cx - badge_w // 2
    badge_y0 = cy - badge_h // 2 - int(doc_h * 0.05)
    badge_x1 = badge_x0 + badge_w
    badge_y1 = badge_y0 + badge_h
    badge_r = int(badge_h * 0.35)
    
    # Badge subtle shadow
    d_draw.rounded_rectangle(
        [badge_x0, badge_y0 + int(size * 0.008), badge_x1, badge_y1 + int(size * 0.008)],
        radius=badge_r,
        fill=(180, 0, 50, 60)
    )
    # Badge background
    d_draw.rounded_rectangle([badge_x0, badge_y0, badge_x1, badge_y1], radius=badge_r, fill=(229, 50, 45, 255))
    
    # Draw "PDF" Text
    font_path = r"C:\Windows\Fonts\segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = r"C:\Windows\Fonts\arialbd.ttf"
        
    font_size = int(badge_h * 0.62)
    font = ImageFont.truetype(font_path, font_size)
    text = "PDF"
    
    # Center text in badge
    t_box = font.getbbox(text)
    tw = t_box[2] - t_box[0]
    th = t_box[3] - t_box[1]
    tx = badge_x0 + (badge_w - tw) // 2 - t_box[0]
    ty = badge_y0 + (badge_h - th) // 2 - t_box[1]
    d_draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    # Bottom Document Lines (Stylized document preview)
    line_y1 = badge_y1 + int(doc_h * 0.09)
    line_w1 = int(doc_w * 0.68)
    line_h = int(doc_h * 0.045)
    line_r = line_h // 2
    d_draw.rounded_rectangle([cx - line_w1 // 2, line_y1, cx - line_w1 // 2 + line_w1, line_y1 + line_h], radius=line_r, fill=(226, 232, 240, 255))

    line_y2 = line_y1 + int(doc_h * 0.08)
    line_w2 = int(doc_w * 0.46)
    d_draw.rounded_rectangle([cx - line_w1 // 2, line_y2, cx - line_w1 // 2 + line_w2, line_y2 + line_h], radius=line_r, fill=(226, 232, 240, 255))

    canvas = Image.alpha_composite(canvas, decor)
    return canvas

def create_splash_screen(w, h):
    """
    Creates a sleek, dark obsidian/slate (#0F172A) splash screen with glowing KlikPDF branding.
    """
    splash = Image.new("RGBA", (w, h), (15, 23, 42, 255)) # #0F172A matching Capacitor & App theme
    draw = ImageDraw.Draw(splash)
    
    # Central crimson glow
    glow_size = min(w, h)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    cx, cy = w // 2, int(h * 0.44)
    max_gr = int(glow_size * 0.42)
    for gr in range(max_gr, 0, -6):
        alpha = int(28 * (1 - gr / max_gr))
        g_draw.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], fill=(229, 50, 45, alpha))
    splash = Image.alpha_composite(splash, glow)
    
    # Place scaled logo
    logo_size = int(min(w, h) * 0.32)
    logo_img = create_base_logo(size=logo_size, is_foreground_only=False, is_round=False, corner_radius_pct=0.22)
    lx = cx - logo_size // 2
    ly = cy - logo_size // 2
    splash.paste(logo_img, (lx, ly), logo_img)
    
    # Brand Typography
    font_path = r"C:\Windows\Fonts\segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = r"C:\Windows\Fonts\arialbd.ttf"
        
    title_font_size = max(24, int(min(w, h) * 0.065))
    title_font = ImageFont.truetype(font_path, title_font_size)
    title_text = "KlikPDF"
    
    draw = ImageDraw.Draw(splash)
    t_box = title_font.getbbox(title_text)
    tw = t_box[2] - t_box[0]
    th = t_box[3] - t_box[1]
    title_y = ly + logo_size + int(min(w, h) * 0.04)
    draw.text((cx - tw // 2 - t_box[0], title_y), title_text, font=title_font, fill=(255, 255, 255, 255))
    
    # Subtitle
    sub_font_size = max(12, int(title_font_size * 0.42))
    sub_font = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", sub_font_size) if os.path.exists(r"C:\Windows\Fonts\segoeui.ttf") else ImageFont.truetype(font_path, sub_font_size)
    sub_text = "Solusi PDF Cepat, Mandiri & Gratis"
    st_box = sub_font.getbbox(sub_text)
    stw = st_box[2] - st_box[0]
    draw.text((cx - stw // 2 - st_box[0], title_y + th + int(min(w, h) * 0.02)), sub_text, font=sub_font, fill=(148, 163, 184, 255))
    
    return splash.convert("RGB")

def generate_all_assets():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    android_res = os.path.join(project_root, "android", "app", "src", "main", "res")
    frontend_public = os.path.join(project_root, "frontend", "public")
    frontend_dist = os.path.join(project_root, "frontend", "dist")

    print(f"Generating Android Launcher Icons & Splash Screens...")
    
    # High-resolution master icons
    master_logo = create_base_logo(size=1024, is_foreground_only=False, is_round=False, corner_radius_pct=0.22)
    master_round = create_base_logo(size=1024, is_foreground_only=False, is_round=True)
    master_fg = create_base_logo(size=1024, is_foreground_only=True)

    # 1. Android Mipmap Icons
    mipmap_configs = {
        "mipmap-mdpi": {"icon": 48, "fg": 108},
        "mipmap-hdpi": {"icon": 72, "fg": 162},
        "mipmap-xhdpi": {"icon": 96, "fg": 216},
        "mipmap-xxhdpi": {"icon": 144, "fg": 324},
        "mipmap-xxxhdpi": {"icon": 192, "fg": 432}
    }

    for folder, cfg in mipmap_configs.items():
        folder_path = os.path.join(android_res, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # ic_launcher.png
        icon_size = cfg["icon"]
        master_logo.resize((icon_size, icon_size), Image.Resampling.LANCZOS).save(
            os.path.join(folder_path, "ic_launcher.png"), "PNG"
        )
        
        # ic_launcher_round.png
        master_round.resize((icon_size, icon_size), Image.Resampling.LANCZOS).save(
            os.path.join(folder_path, "ic_launcher_round.png"), "PNG"
        )
        
        # ic_launcher_foreground.png
        fg_size = cfg["fg"]
        master_fg.resize((fg_size, fg_size), Image.Resampling.LANCZOS).save(
            os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG"
        )
        print(f"  [OK] Generated {folder} (icon: {icon_size}px, fg: {fg_size}px)")

    # 2. Android Splash Screens
    splash_configs = {
        "drawable": (480, 800),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280)
    }

    for folder, (w, h) in splash_configs.items():
        folder_path = os.path.join(android_res, folder)
        os.makedirs(folder_path, exist_ok=True)
        splash_img = create_splash_screen(w, h)
        splash_img.save(os.path.join(folder_path, "splash.png"), "PNG")
        print(f"  [OK] Generated splash for {folder} ({w}x{h})")

    # 3. Web & PWA Favicons
    print("Generating Web & PWA Favicons...")
    target_dirs = [frontend_public]
    if os.path.exists(frontend_dist):
        target_dirs.append(frontend_dist)

    for out_dir in target_dirs:
        os.makedirs(out_dir, exist_ok=True)
        master_logo.resize((48, 48), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon-48x48.png"), "PNG")
        master_logo.resize((96, 96), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon-96x96.png"), "PNG")
        master_logo.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "apple-touch-icon.png"), "PNG")
        master_logo.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon-192x192.png"), "PNG")
        master_logo.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon-512x512.png"), "PNG")
        
        # Favicon ICO
        ico_img = master_logo.resize((48, 48), Image.Resampling.LANCZOS)
        ico_img.save(
            os.path.join(out_dir, "favicon.ico"),
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48)]
        )
        print(f"  [OK] Favicons saved to {out_dir}")

    print("\nAll brand icons & splash screens generated successfully!")

if __name__ == "__main__":
    generate_all_assets()
