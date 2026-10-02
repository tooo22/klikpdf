import os
from PIL import Image, ImageDraw, ImageFont

def draw_klikpdf_icon(size):
    # High-quality RGBA canvas
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer red container with soft rounded corners
    radius = max(2, int(size * 0.22))
    draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=(229, 50, 45, 255))
    
    # White document sheet
    doc_margin_x = max(2, int(size * 0.20))
    doc_margin_top = max(2, int(size * 0.16))
    doc_margin_bottom = max(2, int(size * 0.16))
    doc_w = size - (2 * doc_margin_x)
    doc_h = size - doc_margin_top - doc_margin_bottom
    doc_radius = max(2, int(size * 0.08))
    
    doc_left = doc_margin_x
    doc_top = doc_margin_top
    doc_right = doc_left + doc_w
    doc_bottom = doc_top + doc_h
    
    # Draw white card
    draw.rounded_rectangle(
        [(doc_left, doc_top), (doc_right, doc_bottom)],
        radius=doc_radius,
        fill=(255, 255, 255, 255)
    )
    
    # Red folded corner top-right
    fold_size = max(2, int(doc_w * 0.40))
    draw.polygon([
        (doc_right - fold_size, doc_top),
        (doc_right, doc_top + fold_size),
        (doc_right, doc_top)
    ], fill=(229, 50, 45, 255))
    
    # Red fold shadow accent line
    draw.line([
        (doc_right - fold_size, doc_top),
        (doc_right - fold_size, doc_top + fold_size),
        (doc_right, doc_top + fold_size)
    ], fill=(200, 30, 25, 255), width=max(1, int(size * 0.02)))
    
    # Horizontal accent lines representing PDF content
    line_y1 = int(doc_top + doc_h * 0.46)
    line_y2 = int(doc_top + doc_h * 0.68)
    line_left = int(doc_left + doc_w * 0.18)
    line_right = int(doc_right - doc_w * 0.18)
    line_h = max(1, int(size * 0.05))
    
    draw.rounded_rectangle([(line_left, line_y1), (line_right, line_y1 + line_h)], radius=1, fill=(229, 50, 45, 255))
    draw.rounded_rectangle([(line_left, line_y2), (int(line_left + (line_right - line_left) * 0.65), line_y2 + line_h)], radius=1, fill=(229, 50, 45, 255))
    
    return img

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(script_dir, '..', 'public')
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. 48x48 PNG (Google Search Snippet minimum standard requirement)
    icon_48 = draw_klikpdf_icon(48)
    icon_48.save(os.path.join(out_dir, 'favicon-48x48.png'), 'PNG')
    
    # 2. 96x96 PNG (High DPI browser tabs)
    icon_96 = draw_klikpdf_icon(96)
    icon_96.save(os.path.join(out_dir, 'favicon-96x96.png'), 'PNG')
    
    # 3. 180x180 PNG (Apple touch icon for iOS / Safari)
    icon_180 = draw_klikpdf_icon(180)
    icon_180.save(os.path.join(out_dir, 'apple-touch-icon.png'), 'PNG')
    
    # 4. 192x192 PNG (PWA / Android standard)
    icon_192 = draw_klikpdf_icon(192)
    icon_192.save(os.path.join(out_dir, 'favicon-192x192.png'), 'PNG')
    
    # 5. 512x512 PNG (PWA splash & high-res asset)
    icon_512 = draw_klikpdf_icon(512)
    icon_512.save(os.path.join(out_dir, 'favicon-512x512.png'), 'PNG')
    
    # 6. Multi-resolution favicon.ico (16x16, 32x32, 48x48)
    icon_16 = draw_klikpdf_icon(16)
    icon_32 = draw_klikpdf_icon(32)
    icon_ico = draw_klikpdf_icon(48)
    icon_ico.save(
        os.path.join(out_dir, 'favicon.ico'),
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print("All favicon assets generated successfully in frontend/public.")

if __name__ == '__main__':
    main()
