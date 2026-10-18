#!/usr/bin/env python3
"""Selecteert beginnerspuzzels uit de Lichess-puzzeldatabase (CC0).

Gebruik:  zstd -dc lichess_db_puzzle.csv.zst | python3 tools/build_puzzles.py > data/puzzles.json

Kolommen in de CSV:
PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
"""
import csv
import json
import random
import sys

MIN_RATING = 400
MAX_RATING = 1700
BUCKET = 100            # puzzels worden per 100 ratingpunten gegroepeerd
PER_BUCKET = 500        # maximaal aantal puzzels per groep
MAX_PLIES = 8           # eerste zet tegenstander + maximaal 4 eigen zetten (incl. antwoorden)

# Thema's die niets zeggen over het motief laten we weg om de data klein te houden.
SKIP_THEMES = {
    "short", "long", "veryLong", "oneMove", "master", "masterVsMaster", "superGM",
    "crushing", "advantage", "equality", "mate",
}


def main():
    random.seed(42)
    reservoirs = {}
    seen = {}
    reader = csv.reader(sys.stdin)
    header = next(reader)
    assert header[0] == "PuzzleId", header
    for row in reader:
        pid, fen, moves, rating, rd, popularity, plays, themes = row[:8]
        rating = int(rating)
        if not (MIN_RATING <= rating < MAX_RATING):
            continue
        if int(rd) > 85 or int(popularity) < 85 or int(plays) < 300:
            continue
        move_list = moves.split()
        if len(move_list) > MAX_PLIES:
            continue
        theme_list = [t for t in themes.split() if t not in SKIP_THEMES]
        item = [pid, fen, moves, rating, " ".join(theme_list)]
        bucket = rating // BUCKET
        n = seen.get(bucket, 0) + 1
        seen[bucket] = n
        res = reservoirs.setdefault(bucket, [])
        if len(res) < PER_BUCKET:
            res.append(item)
        else:
            j = random.randrange(n)
            if j < PER_BUCKET:
                res[j] = item

    puzzles = [p for b in sorted(reservoirs) for p in reservoirs[b]]
    puzzles.sort(key=lambda p: p[3])
    for b in sorted(reservoirs):
        print(f"rating {b * BUCKET}-{b * BUCKET + BUCKET - 1}: {len(reservoirs[b])} van {seen[b]}", file=sys.stderr)
    json.dump({
        "source": "Lichess puzzle database (CC0), https://database.lichess.org/#puzzles",
        "fields": ["id", "fen", "moves", "rating", "themes"],
        "puzzles": puzzles,
    }, sys.stdout, separators=(",", ":"))


if __name__ == "__main__":
    main()
