#!/usr/bin/env python3
"""Generate 3 StyleSync VS Code screenshot mockups (PNG) using Pillow."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = r"C:\Users\ThinkPad\.dsh\bot\workspace\build_B4\materials"
os.makedirs(OUT, exist_ok=True)

def rgb(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

def load_font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()

FONT_TITLE   = load_font(14)
FONT_BODY    = load_font(12)
FONT_LABEL   = load_font(11)
FONT_SMALL   = load_font(10)

# ── Screenshot 1: Config file list panel ─────────────────────────────────────
W, H = 1366, 768
img1 = Image.new("RGB", (W, H), rgb("#1e1e1e"))
d1 = ImageDraw.Draw(img1)

# Title bar
d1.rectangle([0, 0, W, 35], fill=rgb("#3c3c3c"))
d1.text((12, 9), "StyleSync — Config Files", font=FONT_TITLE, fill=rgb("#cccccc"))

# Activity bar strip (left edge)
d1.rectangle([0, 35, 48, H], fill=rgb("#252526"))
# Sync icon placeholder
d1.rectangle([10, 300, 38, 328], fill=rgb("#007acc"))

# File list area
y_start = 55
files = [
    ("settings.json",      "settings",   "12.4 KB", rgb("#4ec9b0")),
    ("keybindings.json",   "keybindings","3.8 KB",  rgb("#4ec9b0")),
    ("default.code-snippets","snippets", "1.2 KB",  rgb("#858585")),
    ("extensions.json",    "extensions","0.5 KB",  rgb("#858585")),
    ("tasks.json",         "tasks",      "0.9 KB",  rgb("#858585")),
    ("launch.json",        "launch",     "0.6 KB",  rgb("#858585")),
]
for i, (name, typ, size, status_col) in enumerate(files):
    y = y_start + i * 52
    bg = rgb("#252526") if i % 2 == 0 else rgb("#1e1e1e")
    d1.rectangle([50, y, W, y+50], fill=bg)
    # File icon placeholder
    d1.rectangle([55, y+12, 70, y+28], fill=rgb("#007acc"))
    d1.text((78, y+12), name, font=FONT_BODY, fill=rgb("#cccccc"))
    d1.text((420, y+12), typ, font=FONT_LABEL, fill=rgb("#858585"))
    d1.text((700, y+12), size, font=FONT_LABEL, fill=status_col)
    d1.text((1180, y+12), "Export", font=FONT_LABEL, fill=rgb("#007acc"))

# Status bar at bottom
d1.rectangle([0, H-28, W, H], fill=rgb("#007acc"))
d1.text((12, H-22), "Free plan  ·  2/3 types available", font=FONT_SMALL, fill=rgb("#ffffff"))

img1.save(os.path.join(OUT, "screenshot-01-config-list.png"), "PNG")
print("OK screenshot-01-config-list.png")

# ── Screenshot 2: Password prompt dialog ─────────────────────────────────────
img2 = Image.new("RGB", (W, H), rgb("#1e1e1e"))
d2 = ImageDraw.Draw(img2)

dx, dy, dw, dh = 420, 250, 520, 280
# Dialog box
d2.rectangle([dx, dy, dx+dw, dy+dh], fill=rgb("#2d2d2d"), outline=rgb("#858585"))
d2.text((dx+20, dy+16), "Enter encryption password (AES-256)", font=FONT_BODY, fill=rgb("#cccccc"))
d2.text((dx+20, dy+60), "Your strong password...", font=FONT_BODY, fill=rgb("#858585"))
# Input field
d2.rectangle([dx+20, dy+100, dx+dw-20, dy+150], fill=rgb("#3c3c3c"), outline=rgb("#858585"))
d2.text((dx+28, dy+108), "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", font=FONT_BODY, fill=rgb("#cccccc"))
# OK button
d2.rectangle([dx+dw-130, dy+200, dx+dw-20, dy+250], fill=rgb("#007acc"))
d2.text((dx+dw-118, dy+210), "OK", font=FONT_LABEL, fill=rgb("#ffffff"))
# Cancel button
d2.rectangle([dx+dw-270, dy+200, dx+dw-140, dy+250], fill=rgb("#3c3c3c"))
d2.text((dx+dw-258, dy+210), "Cancel", font=FONT_LABEL, fill=rgb("#cccccc"))

img2.save(os.path.join(OUT, "screenshot-02-password-prompt.png"), "PNG")
print("OK screenshot-02-password-prompt.png")

# ── Screenshot 3: Import result toast notification ───────────────────────────
img3 = Image.new("RGB", (W, H), rgb("#1e1e1e"))
d3 = ImageDraw.Draw(img3)

tx, ty, tw, th = 480, H-230, 600, 190
# Toast banner
d3.rectangle([tx, ty, tx+tw, ty+th], fill=rgb("#2d2d2d"), outline=rgb("#4ec9b0"), width=2)
d3.text((tx+20, ty+12), "\u2713  StyleSync: import complete.", font=FONT_BODY, fill=rgb("#4ec9b0"))
d3.text((tx+20, ty+50), "  \u2713 settings.json: written", font=FONT_LABEL, fill=rgb("#cccccc"))
d3.text((tx+20, ty+80), "  \u26a0 keybindings.json: conflict detected", font=FONT_LABEL, fill=rgb("#ce9178"))
d3.text((tx+40, ty+110), "\u2014 review manually", font=FONT_SMALL, fill=rgb("#858585"))
# Close button
cx = tx + tw - 70
d3.rectangle([cx, ty+12, cx+50, ty+52], fill=rgb("#3c3c3c"))
d3.text((cx+18, ty+20), "\u2715", font=FONT_LABEL, fill=rgb("#858585"))

img3.save(os.path.join(OUT, "screenshot-03-import-result.png"), "PNG")
print("OK screenshot-03-import-result.png")

print("\nAll 3 screenshots generated.")
