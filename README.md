# Schaaktrainer

Gratis schaaktrainings-app (PWA) voor de iPhone, in het Nederlands.

- **Dagelijkse puzzels**: 10 tactiekpuzzels op jouw niveau, met uitleg van het thema. Fout gemaakt? De puzzel komt terug na 1, 3, 7, 14 en 30 dagen.
- **Spelen tegen de computer**: niveau 1–10. Win je, dan wordt hij sterker; verlies je, dan zwakker.
- **Partij-review**: Stockfish toont je 3 grootste fouten, de betere zet en in één zin waarom.
- **Voortgang**: reeks, puzzelrating en je zwakste thema's.

Alles draait op de telefoon zelf. Er is geen account of server nodig, en je voortgang blijft lokaal op je telefoon.

## Installeren op de iPhone
1. Open de link van de app in **Safari**.
2. Tik op de deelknop (vierkantje met pijl omhoog).
3. Kies **Zet op beginscherm** en tik op **Voeg toe**.

## Onderhoud
- `data/puzzles.json` wordt gemaakt door de workflow *Puzzels bijwerken* (Actions-tab → Run workflow).
- Na het wijzigen van bestanden: `python3 tools/build_sw.py` (werkt de offline-cache bij).

## Bronnen en licenties
- Puzzels: [Lichess puzzle database](https://database.lichess.org/#puzzles) (CC0)
- [chess.js](https://github.com/jhlywa/chess.js) (BSD-2)
- [cm-chessboard](https://github.com/shaack/cm-chessboard) (MIT), stukken van Wikimedia (cburnett, CC BY-SA)
- [Stockfish.js](https://github.com/nmrugg/stockfish.js) (GPL-3)
