"""Perf pass: JPG->WebP conversion + Persian/Latin subsetting of Vazir Matrix woff2.

Run from repo root:  python3 scripts/optimize-assets.py
Idempotent: skips work if outputs already exist and are newer than inputs.
"""

import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets"
FONTS = ASSETS / "fonts"

# ---------------------------------------------------------------- WebP ----
# Quality 78 keeps the photographic bento look at ~40% of the JPEG weight.
for jpg in ("hardware.jpg", "workflow.jpg", "llm.jpg"):
    src = ASSETS / jpg
    dst = src.with_suffix(".webp")
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        print(f"skip webp {dst.name}")
        continue
    im = Image.open(src).convert("RGB")
    im.save(dst, "WEBP", quality=78, method=6)
    print(f"webp {src.name} {src.stat().st_size//1024}KB -> {dst.name} {dst.stat().st_size//1024}KB")

# --------------------------------------------------------------- fonts ----
# The font is a Persian display face used site-wide (body text!). Full woff2
# carries glyph coverage the site never types. Subset to:
#   U+0020-007E  basic latin + digits + punctuation
#   U+00A0-00FF  latin-1 supplement (× « » ± · etc.)
#   U+0600-06FF  Arabic block incl. Persian letters + ۰-۹ digits
#   U+200C-2010  ZWNJ/ZWJ/LRM/RLM + dashes
#   U+2013-2026  quotes, ellipsis, primes, bullets
#   U+2212       minus sign
UNICODES = "U+0020-007E,U+00A0-00FF,U+0600-06FF,U+200C-2010,U+2013-2026,U+2212"

for weight in ("Regular", "Bold"):
    src = FONTS / f"VazirMatrix-{weight}.woff2"
    dst = FONTS / f"VazirMatrix-{weight}-sub.woff2"
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        print(f"skip font {dst.name}")
        continue
    subprocess.run(
        [
            "pyftsubset",
            str(src),
            f"--unicodes={UNICODES}",
            "--flavor=woff2",
            f"--output-file={dst}",
            "--layout-features=*",
            "--no-hinting",
            "--desubroutinize",
        ],
        check=True,
    )
    print(f"font {src.name} {src.stat().st_size//1024}KB -> {dst.name} {dst.stat().st_size//1024}KB")

print("done")
