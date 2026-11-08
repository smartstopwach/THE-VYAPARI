# ব্যবসায়ী / व्यापारी — two-dice board

A faithful first build of the supplied scanned board game. The board is **not redrawn**: the exact embedded JPEG from the PDF is used as the play surface, preserving the centre fold, worn red frame, old ink, bilingual Bengali/Hindi labels, India map, Mickey Mouse, and both original rule panels.

## What is ready

- Exact 36-space perimeter map measured against the 2672 × 2705 scan.
- Two animated six-sided dice; the sum moves the active button around the route.
- 2–4 vintage buttons, with overlapping-token offsets.
- Route starts at the bottom-right **Collect Salary** corner and follows the yellow arrow up the right edge, then across the top, down the left edge, and along the bottom.
- Hover/click any space for its name, printed value and category.
- Optional route numbers, board magnifier, full-resolution scan, and enlarged Bengali/Hindi rule panels.
- Tiny generated dice-clack sound, a game ledger, reset, keyboard Space to roll, and reduced-motion support.

The economic rules are deliberately **not invented** in this first pass. Chance (`সুযোগ` / `मौका`) and Republic (`গণতন্ত্রাষ্ট্র` / `गणराज्य`) effects, buying, rent, tax, and jail outcomes can be added once the faded rule text is confirmed. Both original panels are included verbatim as images.

## Route

`01` Collect Salary → `02–09` right edge bottom-to-top → `10` Jail → `11–18` top edge right-to-left → `19` Rest corner → `20–27` left edge top-to-bottom → `28` Merchants Club → `29–36` bottom edge left-to-right → back to `01`.

The square metadata in `game.js` is indexed in exactly that order. A few heavily faded printed prices/labels are best verified against the full scan; the visible board itself is unchanged.

## Run

No build step or dependencies are required:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open the served `index.html`. The app also works when `index.html` is opened directly, although some browsers restrict local audio.

## Files

- `index.html` — board cabinet, dice tray, controls and dialogs
- `style.css` — aged-paper/red-and-gold presentation and responsive layout
- `game.js` — 36-space geometry, tile metadata, dice, movement and UI
- `assets/vyapari-board.jpg` — exact embedded scan from the supplied PDF
- `assets/rules-left.jpg` — enlarged Bengali rule panel
- `assets/rules-right.jpg` — enlarged Hindi rule panel
