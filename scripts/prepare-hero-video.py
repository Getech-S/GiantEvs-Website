"""
Prepares the hero background clip.

  python scripts/prepare-hero-video.py <source.mp4>

Two jobs:

1. Erases the generator watermark — a 45x43 four-point star burned into the
   bottom-right of the source, 98px in from the right edge and 99px up from the
   bottom. It is removed with an OpenCV Telea inpaint over an elliptical mask
   (star + 7px, to catch the anti-aliased halo) rather than by cropping, so no
   resolution is lost and the framing is untouched.

2. Regenerates the inline placeholder (LQIP) — a 40px-wide JPEG of a frame two
   seconds in, printed as a data URI to paste into `hero.video.lqip`
   in src/lib/site.ts.

Output is re-encoded at CRF 17 / preset veryslow so the pass is visually
lossless, and the audio track is dropped (the hero video is always muted).

Requires: opencv-python, imageio-ffmpeg  (pip install opencv-python imageio-ffmpeg)
"""

import base64
import subprocess
import sys
from pathlib import Path

import cv2
import imageio_ffmpeg
import numpy as np

DST = Path(__file__).resolve().parent.parent / "public" / "media" / "hero-charging.mp4"

# Watermark position, found by taking the per-pixel temporal minimum across all
# frames: a blended-on overlay never lets its pixels reach the scene's darkest
# value, so it stands out as a bright, static blob.
STAR = (1137, 578, 45, 43)  # x, y, w, h
MARGIN = 7


def main(src: str) -> None:
    cap = cv2.VideoCapture(src)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frames.append(frame)
    cap.release()

    if not frames:
        sys.exit(f"could not read any frames from {src}")

    height, width = frames[0].shape[:2]
    print(f"source: {width}x{height} @ {fps}fps, {len(frames)} frames")

    x, y, w, h = STAR
    mask = np.zeros((height, width), np.uint8)
    cv2.ellipse(mask, (x + w // 2, y + h // 2), (w // 2 + MARGIN, h // 2 + MARGIN),
                0, 0, 360, 255, -1)

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    proc = subprocess.Popen(
        [ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{width}x{height}",
         "-r", str(fps), "-i", "pipe:0",
         "-c:v", "libx264", "-preset", "veryslow", "-crf", "17",
         "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.0",
         "-movflags", "+faststart", "-an", str(DST)],
        stdin=subprocess.PIPE,
    )
    for frame in frames:
        proc.stdin.write(cv2.inpaint(frame, mask, MARGIN, cv2.INPAINT_TELEA).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        sys.exit("ffmpeg failed")
    print(f"wrote {DST} ({DST.stat().st_size:,} bytes)")

    # --- placeholder -----------------------------------------------------
    frame = cv2.inpaint(frames[min(int(fps * 2), len(frames) - 1)], mask, MARGIN, cv2.INPAINT_TELEA)
    small = cv2.resize(frame, (40, round(40 * height / width)), interpolation=cv2.INTER_AREA)
    ok, buf = cv2.imencode(".jpg", small, [cv2.IMWRITE_JPEG_QUALITY, 62])
    assert ok
    print(f"\nLQIP ({small.shape[1]}x{small.shape[0]}, {len(buf):,} bytes) — "
          f"paste into hero.video.lqip in src/lib/site.ts:\n")
    print("data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode())


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
