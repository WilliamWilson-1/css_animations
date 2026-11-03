"""Keep the file://-compatible catalogue in sync with catalog.json."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
data = json.loads((root / "catalog.json").read_text())
(root / "assets/catalog.js").write_text(
    "/* Generated catalogue; edit catalog.json, then run scripts/sync_catalog.py. */\n"
    "window.ANIMATION_CATALOG = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
)
