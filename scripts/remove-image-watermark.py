"""
Removes a generator watermark from a still image.

  python scripts/remove-image-watermark.py <src> <out> <cx> <cy> [rx] [ry]

The assets from the design tool arrive with a four-point star burned into them.
A plain inpaint smears whenever the star straddles a hard edge (a kerb, a
skyline), so this clones a patch from elsewhere in the same image instead:

1. Candidate source offsets are scored on the ANNULUS around the star — the
   ring of real pixels the clone has to line up with — so structures running
   through the frame stay continuous. Picking an offset by eye leaves a step.
2. The best patch is Poisson-blended in, which refits its colour to the
   surroundings and hides the seam.

Pass the star's centre in source pixels; find it by cropping the corner with a
coordinate grid drawn over it. rx/ry default to 62/60, which covers the ~103x97
star these assets carry.

Requires: opencv-python
"""

import sys

import cv2
import numpy as np


def main() -> None:
    if len(sys.argv) < 5:
        sys.exit(__doc__)

    src, out = sys.argv[1], sys.argv[2]
    cx, cy = int(sys.argv[3]), int(sys.argv[4])
    rx = int(sys.argv[5]) if len(sys.argv) > 5 else 62
    ry = int(sys.argv[6]) if len(sys.argv) > 6 else 60

    img = cv2.imread(src, cv2.IMREAD_COLOR)
    if img is None:
        sys.exit(f"could not read {src}")
    height, width = img.shape[:2]

    pw, ph = (rx + 30) * 2, (ry + 30) * 2
    ring = np.zeros((ph, pw), np.uint8)
    cv2.ellipse(ring, (pw // 2, ph // 2), (rx + 28, ry + 28), 0, 0, 360, 255, -1)
    cv2.ellipse(ring, (pw // 2, ph // 2), (rx + 2, ry + 2), 0, 0, 360, 0, -1)
    ring_mask = ring > 0

    frame = img.astype(np.float32)
    dest = frame[cy - ph // 2:cy + ph // 2, cx - pw // 2:cx + pw // 2]

    best = None
    for dx in list(range(-320, -55)) + list(range(56, 320)):
        for dy in range(-14, 15):
            sx, sy = cx + dx, cy + dy
            if sx - pw // 2 < 0 or sx + pw // 2 > width:
                continue
            if sy - ph // 2 < 0 or sy + ph // 2 > height:
                continue
            candidate = frame[sy - ph // 2:sy + ph // 2, sx - pw // 2:sx + pw // 2]
            err = np.abs(candidate[ring_mask] - dest[ring_mask]).mean()
            if best is None or err < best[0]:
                best = (err, dx, dy)

    if best is None:
        sys.exit("no usable source patch found — is the star too close to an edge?")

    err, dx, dy = best
    print(f"source offset dx={dx} dy={dy} (ring error {err:.2f})")

    sx, sy = cx + dx, cy + dy
    patch = img[sy - ph // 2:sy + ph // 2, sx - pw // 2:sx + pw // 2].copy()
    patch_mask = np.zeros((ph, pw), np.uint8)
    cv2.ellipse(patch_mask, (pw // 2, ph // 2), (rx, ry), 0, 0, 360, 255, -1)

    cv2.imwrite(out, cv2.seamlessClone(patch, img, patch_mask, (cx, cy), cv2.NORMAL_CLONE))
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
