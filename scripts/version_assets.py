"""Give published frontend files content-based URLs so old scripts are not reused."""
import argparse
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def version_assets(check=False):
    index = ROOT / "index.html"
    html = index.read_text(encoding="utf-8")
    updated = html
    for filename in ("app.js", "style.css"):
        source = ROOT / filename
        content = source.read_bytes()
        digest = hashlib.sha256(content).hexdigest()[:12]
        output = ROOT / "assets" / f"{source.stem}.{digest}{source.suffix}"
        relative = output.relative_to(ROOT).as_posix()
        pattern = rf'((?:src|href)=")(?:{re.escape(filename)}|assets/{source.stem}\.[0-9a-f]{{12}}{re.escape(source.suffix)})(?:\?[^\"]*)?(\")'
        updated, count = re.subn(pattern, lambda match: match[1] + relative + match[2], updated)
        assert count == 1, f"Expected one frontend reference for {filename}, found {count}"
        if check:
            assert output.is_file() and output.read_bytes() == content, f"Run python3 scripts/version_assets.py: {relative} is missing or stale"
        else:
            output.parent.mkdir(exist_ok=True)
            output.write_bytes(content)
        print(relative)
    if check:
        assert html == updated, "index.html has stale asset URLs; run python3 scripts/version_assets.py"
    else:
        index.write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    version_assets(check=parser.parse_args().check)
