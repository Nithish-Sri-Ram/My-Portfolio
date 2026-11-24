"""
Turn a raster (rendered from SimFabric's SVG art) into a density grid in the same format as
simfabric/frontend/src/lib/asciiMark.js: one string per row, 0 for nothing to 5 for the darkest.

  python3 tools/ascii.py <png> <cols> [gamma] [cut]

Prints a JS array literal. The renderer in src/ascii/render.js maps densities through the ramp " .·:+*".
"""
import sys
from PIL import Image, ImageOps

CELL_ASPECT = 0.5  # a mono cell is about half as wide as it is tall


def grid(path, cols, gamma=1.0, cut=0.07):
    src = Image.open(path)
    if src.mode in ("RGBA", "LA", "P"):
        # transparent PNGs: put them on white, so empty space reads as nothing, not as black
        src = src.convert("RGBA")
        bg = Image.new("RGBA", src.size, (255, 255, 255, 255))
        src = Image.alpha_composite(bg, src)
    im = src.convert("L")
    inv = ImageOps.invert(im)  # dark ink -> high values
    bbox = inv.point(lambda v: 255 if v > cut * 255 else 0).getbbox()
    if bbox:
        inv = inv.crop(bbox)
    w, h = inv.size
    rows = max(1, round(cols * (h / w) * CELL_ASPECT))
    small = inv.resize((cols, rows), Image.LANCZOS)
    px = list(small.getdata())
    hi = sorted(px)[int(len(px) * 0.985)] or 1
    out = []
    for y in range(rows):
        row = ""
        for x in range(cols):
            v = min(1.0, px[y * cols + x] / hi)
            if v < cut:
                row += "0"
                continue
            v = v ** gamma
            row += str(max(1, min(5, round(v * 5 + 0.3))))
        out.append(row.rstrip("0"))
    # trim empty rows top and bottom
    while out and not out[0]:
        out.pop(0)
    while out and not out[-1]:
        out.pop()
    return out


if __name__ == "__main__":
    path, cols = sys.argv[1], int(sys.argv[2])
    gamma = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    cut = float(sys.argv[4]) if len(sys.argv) > 4 else 0.07
    rows = grid(path, cols, gamma, cut)
    print("[\n" + ",\n".join(f'  "{r}"' for r in rows) + ",\n]")
