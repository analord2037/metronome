#!/usr/bin/env python3
"""Render the app icon as PNG with no dependencies (stdlib only).

Usage: python3 tools/make_icons.py public/icons
Writes icon-512.png; smaller sizes are made with macOS `sips`.
"""
import os
import struct
import subprocess
import sys
import zlib

SIZE = 512
SS = 3  # supersampling per axis


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


BG_TOP, BG_BOTTOM = hex_rgb('#262b3b'), hex_rgb('#111318')
ORANGE, ORANGE_DARK = hex_rgb('#ff8a3d'), hex_rgb('#d9652a')
FACE, WHITE = hex_rgb('#2a1a12'), hex_rgb('#f5f2ee')

BODY = [(0.40, 0.15), (0.60, 0.15), (0.76, 0.80), (0.24, 0.80)]
FACE_POLY = [(0.455, 0.24), (0.545, 0.24), (0.645, 0.72), (0.355, 0.72)]
BASE = (0.20, 0.78, 0.80, 0.86)  # x0, y0, x1, y1
PIVOT = (0.5, 0.70)
TIP = (0.635, 0.21)
WEIGHT = (PIVOT[0] + (TIP[0] - PIVOT[0]) * 0.55, PIVOT[1] + (TIP[1] - PIVOT[1]) * 0.55)


def in_poly(x, y, poly):
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def seg_dist2(px, py, a, b):
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    cx, cy = ax + t * dx - px, ay + t * dy - py
    return cx * cx + cy * cy


def color_at(x, y):
    if (x - WEIGHT[0]) ** 2 + (y - WEIGHT[1]) ** 2 < 0.047 ** 2:
        return WHITE
    if seg_dist2(x, y, PIVOT, TIP) < 0.019 ** 2:
        return WHITE
    if (x - PIVOT[0]) ** 2 + (y - PIVOT[1]) ** 2 < 0.03 ** 2:
        return WHITE
    if BASE[0] <= x <= BASE[2] and BASE[1] <= y <= BASE[3]:
        return ORANGE_DARK
    if in_poly(x, y, FACE_POLY):
        return FACE
    if in_poly(x, y, BODY):
        return ORANGE
    return tuple(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * y for i in range(3))


def write_png(path, size, rows):
    raw = b''.join(b'\x00' + bytes(r) for r in rows)

    def chunk(kind, data):
        return (struct.pack('>I', len(data)) + kind + data +
                struct.pack('>I', zlib.crc32(kind + data) & 0xFFFFFFFF))

    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)))
        f.write(chunk(b'IDAT', zlib.compress(raw, 9)))
        f.write(chunk(b'IEND', b''))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'public/icons'
    os.makedirs(out, exist_ok=True)
    rows = []
    n = SS * SS
    for py in range(SIZE):
        row = []
        for px in range(SIZE):
            r = g = b = 0.0
            for sy in range(SS):
                for sx in range(SS):
                    c = color_at((px + (sx + 0.5) / SS) / SIZE, (py + (sy + 0.5) / SS) / SIZE)
                    r += c[0]; g += c[1]; b += c[2]
            row += [round(r / n), round(g / n), round(b / n)]
        rows.append(row)
    big = os.path.join(out, 'icon-512.png')
    write_png(big, SIZE, rows)
    for s in (192, 180):
        subprocess.run(['sips', '-z', str(s), str(s), big, '--out',
                        os.path.join(out, f'icon-{s}.png')], check=True, capture_output=True)
    print('icons written to', out)


if __name__ == '__main__':
    main()
