from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "assets"
FONT = Path("C:/Windows/Fonts/arialbd.ttf")

for size in (192, 512):
    image = Image.new("RGB", (size, size), "#252d30")
    draw = ImageDraw.Draw(image)
    s = size / 512
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(65 * s), fill="#252d30")
    colors = ("#f4574e", "#ffd83f", "#12b9eb", "#bb80d4")
    for index, color in enumerate(colors):
        x = (82 + index * 91) * s
        draw.rounded_rectangle((x, 115 * s, x + 57 * s, 275 * s), radius=int(9 * s), fill=color)
    font = ImageFont.truetype(str(FONT), int(123 * s))
    draw.text((57 * s, 285 * s), "IEQT", font=font, fill="#ffffff", stroke_width=0)
    image.save(ROOT / f"icon-{size}.png", optimize=True)

og = Image.new("RGB", (1200, 630), "#252d30")
draw = ImageDraw.Draw(og)
for index, color in enumerate(("#f4574e", "#ffd83f", "#12b9eb", "#bb80d4")):
    draw.rectangle((index * 300, 580, (index + 1) * 300, 630), fill=color)
large = ImageFont.truetype(str(FONT), 94)
medium = ImageFont.truetype(str(FONT), 76)
small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 29)
draw.text((75, 76), "IEQ TAPAJÓS", font=large, fill="white")
draw.text((75, 238), "Uma casa para", font=medium, fill="white")
draw.text((75, 324), "viver a fé.", font=medium, fill="#f4574e")
draw.text((78, 505), "Conjunto Tapajós · Belém, PA", font=small, fill="#d1d8d9")
og.save(ROOT / "og-image.png", optimize=True)
