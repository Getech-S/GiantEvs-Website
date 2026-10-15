"""
Real-ESRGAN inference, CPU, no extra packages beyond torch + numpy.

Network definitions follow the official Real-ESRGAN / BasicSR architectures;
weights load with strict=True (so a mismatch fails loudly) and
weights_only=True (so the checkpoint can only contain tensors, never code).

Shared by upscale-renders.py and prepare-hero-video.py. Speed check:
  python -P -E scripts/media/esrgan.py bench <weights.pth>
"""

import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

torch.set_num_threads(10)


# --- RealESRGAN_x4plus (RRDBNet, 23 blocks) --------------------------------
class ResidualDenseBlock(nn.Module):
    def __init__(self, num_feat=64, num_grow_ch=32):
        super().__init__()
        self.conv1 = nn.Conv2d(num_feat, num_grow_ch, 3, 1, 1)
        self.conv2 = nn.Conv2d(num_feat + num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv3 = nn.Conv2d(num_feat + 2 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv4 = nn.Conv2d(num_feat + 3 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv5 = nn.Conv2d(num_feat + 4 * num_grow_ch, num_feat, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, num_feat, num_grow_ch=32):
        super().__init__()
        self.rdb1 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb2 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb3 = ResidualDenseBlock(num_feat, num_grow_ch)

    def forward(self, x):
        out = self.rdb3(self.rdb2(self.rdb1(x)))
        return out * 0.2 + x


class RRDBNet(nn.Module):
    scale = 4

    def __init__(self, num_feat=64, num_block=23, num_grow_ch=32):
        super().__init__()
        self.conv_first = nn.Conv2d(3, num_feat, 3, 1, 1)
        self.body = nn.Sequential(*[RRDB(num_feat, num_grow_ch) for _ in range(num_block)])
        self.conv_body = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_hr = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_last = nn.Conv2d(num_feat, 3, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

    def forward(self, x):
        feat = self.conv_first(x)
        feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))


# --- realesr-general-x4v3 (SRVGGNetCompact) ---------------------------------
class SRVGGNetCompact(nn.Module):
    scale = 4

    def __init__(self, num_feat=64, num_conv=32):
        super().__init__()
        self.body = nn.ModuleList()
        self.body.append(nn.Conv2d(3, num_feat, 3, 1, 1))
        self.body.append(nn.PReLU(num_parameters=num_feat))
        for _ in range(num_conv):
            self.body.append(nn.Conv2d(num_feat, num_feat, 3, 1, 1))
            self.body.append(nn.PReLU(num_parameters=num_feat))
        self.body.append(nn.Conv2d(num_feat, 3 * self.scale * self.scale, 3, 1, 1))
        self.upsampler = nn.PixelShuffle(self.scale)

    def forward(self, x):
        out = x
        for layer in self.body:
            out = layer(out)
        out = self.upsampler(out)
        return out + F.interpolate(x, scale_factor=self.scale, mode="nearest")


def load(weights_path: str) -> nn.Module:
    ckpt = torch.load(weights_path, map_location="cpu", weights_only=True)
    state = ckpt.get("params_ema") or ckpt.get("params") or ckpt
    net = RRDBNet() if any(k.startswith("rrdb") or k.startswith("conv_first") for k in state) else SRVGGNetCompact()
    net.load_state_dict(state, strict=True)
    return net.eval()


@torch.inference_mode()
def upscale(net: nn.Module, rgb: np.ndarray, tile: int = 0, pad: int = 16) -> np.ndarray:
    """rgb: HxWx3 uint8 -> (H*4)x(W*4)x3 uint8. tile=0 runs the whole frame at once."""
    # Frames from a pipe are read-only buffers; .float() copies before anything is modified.
    x = torch.from_numpy(np.array(rgb, copy=True)).permute(2, 0, 1).float().div_(255).unsqueeze(0)
    s = net.scale
    _, _, h, w = x.shape
    if not tile:
        out = net(x)
    else:
        out = torch.zeros((1, 3, h * s, w * s))
        for y0 in range(0, h, tile):
            for x0 in range(0, w, tile):
                y1, x1 = min(y0 + tile, h), min(x0 + tile, w)
                py0, px0 = max(y0 - pad, 0), max(x0 - pad, 0)
                py1, px1 = min(y1 + pad, h), min(x1 + pad, w)
                piece = net(x[:, :, py0:py1, px0:px1])
                oy, ox = (y0 - py0) * s, (x0 - px0) * s
                out[:, :, y0 * s : y1 * s, x0 * s : x1 * s] = piece[
                    :, :, oy : oy + (y1 - y0) * s, ox : ox + (x1 - x0) * s
                ]
    return out.squeeze(0).clamp_(0, 1).mul_(255).round_().byte().permute(1, 2, 0).numpy()


if __name__ == "__main__" and sys.argv[1:2] == ["bench"]:
    net = load(sys.argv[2])
    print(type(net).__name__, "loaded (strict)")
    frame = (np.random.default_rng(0).random((464, 824, 3)) * 255).astype(np.uint8)
    probe = frame[:116, :206] if isinstance(net, RRDBNet) else frame
    t = time.time()
    upscale(net, probe, tile=0)
    dt = time.time() - t
    area = probe.shape[0] * probe.shape[1]
    print(f"{probe.shape[1]}x{probe.shape[0]} in {dt:.2f}s -> {dt / area * 1e6:.2f}s per megapixel of input")
