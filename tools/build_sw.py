#!/usr/bin/env python3
"""Schrijft sw.js met de lijst van alle bestanden die offline beschikbaar moeten zijn.

Draai dit na elke wijziging aan de app:  python3 tools/build_sw.py
De cachenaam bevat een hash van alle bestanden, zodat telefoons automatisch de nieuwe versie krijgen.
"""
import hashlib
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INCLUDE_DIRS = ["css", "js", "icons", "vendor", "data"]
TOP_FILES = ["index.html", "manifest.webmanifest"]
SKIP_EXT = {".md", ".txt", ".scss", ".map"}
SKIP_NAMES = {"LICENSE", ".gitkeep"}

files = list(TOP_FILES)
for d in INCLUDE_DIRS:
    for dirpath, _, names in os.walk(os.path.join(ROOT, d)):
        for n in sorted(names):
            if os.path.splitext(n)[1] in SKIP_EXT or n in SKIP_NAMES:
                continue
            files.append(os.path.relpath(os.path.join(dirpath, n), ROOT).replace(os.sep, "/"))
files.sort()

h = hashlib.sha256()
for f in files:
    if f.startswith("data/"):
        continue  # puzzels worden apart ververst, zie sw.js
    with open(os.path.join(ROOT, f), "rb") as fh:
        h.update(f.encode())
        h.update(fh.read())
version = h.hexdigest()[:10]

template = open(os.path.join(ROOT, "tools", "sw.template.js")).read()
out = template.replace("__VERSION__", version).replace("__ASSETS__", json.dumps(["./"] + files, indent=4))
with open(os.path.join(ROOT, "sw.js"), "w") as fh:
    fh.write(out)
print(f"sw.js: versie {version}, {len(files)} bestanden")
