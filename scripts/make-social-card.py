#!/usr/bin/env python3
"""Generate assets/city-card.png (1200x630) — the public social-card image.

Deterministic, dependency-light (Pillow only, installed ephemerally via uv).
Usage: uv run --with pillow python scripts/make-social-card.py
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1200, 630
BG = (5, 7, 11)
CYAN = (35, 231, 255)
RED = (255, 43, 79)
TEXT = (238, 247, 255)
MUTED = (159, 180, 200)


def load_font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\bahnschrift.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # grid
    for x in range(0, W, 52):
        draw.line([(x, 0), (x, H)], fill=(35, 231, 255, 24), width=1)
    for y in range(0, H, 52):
        draw.line([(0, y), (W, y)], fill=(35, 231, 255, 24), width=1)

    # glow accents
    draw.ellipse([-120, -160, 420, 380], outline=CYAN, width=2)
    draw.ellipse([900, 420, 1340, 860], outline=RED, width=2)

    # border
    draw.rectangle([28, 28, W - 28, H - 28], outline=CYAN, width=3)

    # monogram
    draw.rounded_rectangle([72, 72, 216, 216], radius=28, outline=CYAN, width=3)
    mono = load_font(84, bold=True)
    draw.text((144, 144), "HC", font=mono, fill=CYAN, anchor="mm")

    title_font = load_font(92, bold=True)
    sub_font = load_font(40)
    url_font = load_font(30)

    draw.text((288, 140), "HERMES CITY", font=title_font, fill=TEXT)
    draw.text((288, 258), "PUBLIC AGENTROPOLIS CIVIC SHELL", font=sub_font, fill=MUTED)
    draw.text(
        (288, 340),
        "Community  /  Social Transit Grid  /  SUPER HERMES",
        font=sub_font,
        fill=CYAN,
    )
    draw.text((72, H - 96), "wiredchaos.github.io/HERMES-CITY", font=url_font, fill=MUTED)
    draw.text((W - 72, H - 96), "Apache-2.0", font=url_font, fill=MUTED, anchor="rm")

    out = os.path.join(ROOT, "assets", "city-card.png")
    img.save(out)
    print("wrote", out, img.size)


if __name__ == "__main__":
    main()
