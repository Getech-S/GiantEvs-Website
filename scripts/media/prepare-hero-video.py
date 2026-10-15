"""
4K hero video.

  python -P -E scripts/media/prepare-hero-video.py upscale <realesr-general-x4v3.pth> <source.mp4> <intermediate.mp4>
  python -P -E scripts/media/prepare-hero-video.py finish  <intermediate.mp4> <projectRoot>

Stage 1 (slow, ~40 min on CPU): 18s-30s of the walkthrough, cropped to 16:9
(824x464), every frame upscaled 4x by Real-ESRGAN's video-friendly compact
model, streamed through memory into one near-lossless intermediate — no
per-frame files on disk.

Stage 2 (fast): from the intermediate, size to 3840x2160 (and 1920x1080 for
small screens), apply the same light grade and 0.4s loop fades as before,
encode for the web, and print the LQIP placeholder.

New filenames on every regeneration, please: /media/* is served with a
one-year immutable cache header (next.config.ts).

Requires: torch, numpy, opencv-python, imageio-ffmpeg (pip install ...), and the
Real-ESRGAN weights from the official release (pass the path; not committed):
  RealESRGAN_x4plus.pth      github.com/xinntao/Real-ESRGAN/releases/tag/v0.1.0
  realesr-general-x4v3.pth   github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
"""

import base64
import subprocess
import sys

sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))  # own helpers only
import tempfile
import time
from pathlib import Path

import imageio_ffmpeg
import numpy as np

FF = imageio_ffmpeg.get_ffmpeg_exe()
START, END, FADE = 18.0, 30.0, 0.4
SRC_W, SRC_H = 824, 464  # 832x464 source, 4px trimmed each side -> 16:9
OUT_W, OUT_H = SRC_W * 4, SRC_H * 4


def upscale_stage(weights: str, src: str, intermediate: str) -> None:
    from esrgan import load, upscale

    net = load(weights)
    frame_bytes = SRC_W * SRC_H * 3
    total = int(round((END - START) * 30))

    decoder = subprocess.Popen(
        [FF, "-hide_banner", "-loglevel", "error", "-ss", str(START), "-to", str(END), "-i", src,
         "-vf", f"crop={SRC_W}:{SRC_H}:4:0", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    encoder = subprocess.Popen(
        [FF, "-hide_banner", "-loglevel", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OUT_W}x{OUT_H}", "-r", "30", "-i", "-",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "10", "-pix_fmt", "yuv420p", intermediate],
        stdin=subprocess.PIPE,
    )

    t0 = time.time()
    n = 0
    while True:
        buf = decoder.stdout.read(frame_bytes)
        if len(buf) < frame_bytes:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(SRC_H, SRC_W, 3)
        encoder.stdin.write(upscale(net, rgb).tobytes())
        n += 1
        if n % 10 == 0 or n == total:
            rate = (time.time() - t0) / n
            print(f"frame {n}/{total}  {rate:.1f}s/frame  ~{(total - n) * rate / 60:.0f} min left", flush=True)

    encoder.stdin.close()
    encoder.wait()
    decoder.wait()
    print(f"done: {n} frames -> {intermediate} ({Path(intermediate).stat().st_size / 1e6:.0f} MB)")


def finish_stage(intermediate: str, root: str) -> None:
    media = Path(root) / "public" / "media"
    length = END - START
    grade = (
        "eq=contrast=1.05:brightness=-0.03:saturation=0.94,"
        f"fade=t=in:st=0:d={FADE},fade=t=out:st={length - FADE:.2f}:d={FADE},format=yuv420p"
    )
    outputs = [
        # 4K for large screens; CRF 27 keeps the upscaled texture without ballooning the file.
        (media / "hero-remera-station-4k.mp4", 3840, 2160, "27", "5.1"),
        # 1080p for phones/tablets, which can't show 4K anyway.
        (media / "hero-remera-station-1080.mp4", 1920, 1080, "28", "4.1"),
    ]
    for dst, w, h, crf, level in outputs:
        subprocess.run(
            [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", intermediate,
             "-vf", f"scale={w}:{h}:flags=lanczos,{grade}",
             "-c:v", "libx264", "-profile:v", "high", "-level", level, "-preset", "slow", "-crf", crf,
             "-movflags", "+faststart", "-an", str(dst)],
            check=True,
        )
        print(f"{dst.name}  {w}x{h}  {dst.stat().st_size / 1e6:.1f} MB")

    with tempfile.TemporaryDirectory() as tmp:
        thumb = Path(tmp) / "lqip.jpg"
        subprocess.run(
            [FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", "1", "-i", str(outputs[1][0]),
             "-frames:v", "1", "-vf", "scale=40:-2", "-q:v", "6", str(thumb)],
            check=True,
        )
        print("lqip: data:image/jpeg;base64," + base64.b64encode(thumb.read_bytes()).decode())


if __name__ == "__main__":
    if sys.argv[1] == "upscale":
        upscale_stage(*sys.argv[2:5])
    elif sys.argv[1] == "finish":
        finish_stage(*sys.argv[2:4])
