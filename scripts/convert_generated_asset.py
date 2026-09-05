"""Resize a generated transparent PNG into a web-ready transparent WebP."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def main() -> None:
    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    max_side = int(sys.argv[3]) if len(sys.argv) > 3 else 768
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        converted = image.convert("RGBA")
        converted.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        converted.save(destination, "WEBP", quality=91, method=6, lossless=False)

    print(f"{source.name} -> {destination} ({destination.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
