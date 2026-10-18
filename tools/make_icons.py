#!/usr/bin/env python3
"""Maakt de app-iconen (paard op groene achtergrond)."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def icon(size, rounded):
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    bg = (47, 93, 80, 255)
    if rounded:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=bg)
    else:
        d.rectangle([0, 0, s, s], fill=bg)
    font = ImageFont.truetype(FONT, int(s * 0.62))
    glyph = "♞"
    box = d.textbbox((0, 0), glyph, font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text(((s - w) / 2 - box[0], (s - h) / 2 - box[1]), glyph, font=font, fill=(255, 255, 255, 255))
    return img.resize((size, size), Image.LANCZOS)


os.makedirs(os.path.join(ROOT, "icons"), exist_ok=True)
icon(180, False).convert("RGB").save(os.path.join(ROOT, "icons", "apple-touch-icon.png"))
icon(192, True).save(os.path.join(ROOT, "icons", "icon-192.png"))
icon(512, False).save(os.path.join(ROOT, "icons", "icon-512.png"))
