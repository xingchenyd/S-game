"""Build small, locally hosted theater webfonts from official upstream TTFs.

python -m pip install fonttools brotli
python scripts/build_story_fonts.py .cache/story-fonts
Keep the corresponding OFL license files with the resulting webfonts.
"""
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
sources = Path(sys.argv[1])
characters = set(chr(value) for value in range(32, 127))
for path in (root / "src").rglob("*"):
    if path.suffix in {".ts", ".tsx", ".css"}:
        characters.update(path.read_text(encoding="utf-8"))

for original, target, family in [
    ("MaShanZheng-Regular.ttf", "story-brush.woff2", "SGame Story Brush"),
    ("LXGWWenKai-Regular.ttf", "story-kai.woff2", "SGame Story Kai"),
]:
    font = TTFont(sources / original)
    options = subset.Options()
    options.flavor = "woff2"
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    options.name_legacy = True
    options.name_languages = ["*"]
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text="".join(sorted(characters)))
    subsetter.subset(font)
    # Give modified subsets their own family names; preserve copyright/licenses.
    for record in font["name"].names:
        if record.nameID in {1, 3, 4, 6, 16}:
            value = family.replace(" ", "") if record.nameID == 6 else family
            record.string = value.encode(record.getEncoding(), errors="replace")
    font.flavor = "woff2"
    destination = root / "public" / "fonts" / target
    font.save(destination)
    print(f"{target}: {destination.stat().st_size / 1024:.0f} KiB; {len(font.getBestCmap())} glyphs")
