"""
4K versions of the three site renders + the share card.

  python -P -E scripts/media/upscale-renders.py <RealESRGAN_x4plus.pth> <rendersDir> <projectRoot>

<rendersDir> holds the architect's renders as 3.jpg (outdoor canopy),
4.jpg (indoor bay) and 6.jpg (garage).

Same crops and grade as the approved 1280px versions; the only change is
that each crop is upscaled 4x with Real-ESRGAN first, then sized to 4K.

Requires: torch, numpy, opencv-python, imageio-ffmpeg (pip install ...), and the
Real-ESRGAN weights from the official release (pass the path; not committed):
  RealESRGAN_x4plus.pth      github.com/xinntao/Real-ESRGAN/releases/tag/v0.1.0
  realesr-general-x4v3.pth   github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
"""

import sys

sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))  # own helpers only
import time
from pathlib import Path

import cv2
import numpy as np

from esrgan import load, upscale

weights, renders, root = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
net = load(weights)

JOBS = [
    # (source render, crop x, y, w, h, output path, output size)
    ("3.jpg", 140, 70, 1140, 650, "public/media/home/host-promo-canopy-4k.jpg", (3840, 2189)),
    ("6.jpg", 0, 0, 1280, 720, "public/media/partner/partner-garage-4k.jpg", (3840, 2160)),
    ("4.jpg", 96, 0, 720, 720, "public/media/contact/contact-garage-4k.jpg", (2160, 2160)),
]


def grade(rgb: np.ndarray) -> np.ndarray:
    """Slight darken/desaturate + soft edge vignette — identical to the 1280px versions."""
    img = rgb.astype(np.float32)
    # modulate(brightness 0.92, saturation 0.94)
    img *= 0.92
    grey = img.mean(axis=2, keepdims=True)
    img = grey + (img - grey) * 0.94
    # linear contrast 1.05, offset -5
    img = img * 1.05 - 5
    # radial vignette: transparent to 55% of the 75% radius, then up to 32% black at the edge
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / w) ** 2 + ((yy - h / 2) / h) ** 2) / 0.75
    alpha = np.clip((r - 0.55) / 0.45, 0, 1) * 0.32
    img *= (1 - alpha)[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)


for name, x, y, w, h, out, size in JOBS:
    t = time.time()
    bgr = cv2.imread(str(renders / name), cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(bgr[y : y + h, x : x + w], cv2.COLOR_BGR2RGB)
    big = upscale(net, rgb, tile=256)
    big = cv2.resize(big, size, interpolation=cv2.INTER_AREA)
    graded = grade(big)
    dst = root / out
    dst.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(dst), cv2.cvtColor(graded, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(f"{out}  {size[0]}x{size[1]}  {dst.stat().st_size / 1e6:.1f} MB  ({time.time() - t:.0f}s)", flush=True)
