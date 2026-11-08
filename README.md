# ব্যবসায়ী / व्यापारी — two-dice board

A faithful first build of the supplied scanned board game, now with a separate setup screen.

## Flow

1. **`index.html` — landing / setup**
   - Choose **Offline** (pass & play) or **Online** (room + invite link).
   - Choose **2, 3 or 4 players**.
   - Press **Open the board**. The form works even with JavaScript disabled.
2. **`board.html` — the game board**
   - Reads `mode`, `players`, and `room` from the setup URL, and remembers them in `localStorage`.
   - Shows the mode in the header, offers a copyable invite link in online mode, and provides a **Change setup** link back to the landing page.
   - Two animated dice move the selected number of buttons around the exact route.

The board is **not redrawn**: the exact embedded JPEG from the PDF is used as the play surface, preserving the centre fold, worn red frame, old ink, bilingual Bengali/Hindi labels, India map, Mickey Mouse, and both original rule panels.

## GitHub Pages

The site is published from the root of `arena/9cc550df-the-vyapari` at:

`https://smartstopwach.github.io/THE-VYAPARI/`

`.nojekyll` is present so GitHub Pages serves the static files directly instead of rendering `README.md` as a fallback. CSS and JS links are versioned (`?v=2`) to bypass stale browser caches. If an old white README page is still visible, do a hard refresh (`Ctrl+F5` / `Cmd+Shift+R`) after the newest Pages build finishes.

## What is ready

- Exact 36-space perimeter map measured against the 2672 × 2705 scan.
- Two animated six-sided dice; the sum moves the active button around the route.
- 2–4 vintage buttons, with overlapping-token offsets.
- Route starts at the bottom-right **Collect Salary** corner and follows the yellow arrow up the right edge, then across the top, down the left edge, and along the bottom.
- Hover/click any space for its name, printed value and category.
- Optional route numbers, board magnifier, full-resolution scan, and enlarged Bengali/Hindi rule panels.
- Tiny generated dice-clack sound, a game ledger, reset, keyboard Space to roll, and reduced-motion support.

**Online mode is room-setup only in this pass.** It creates a room code and a shareable board link; live cross-device move syncing needs a backend and is the next step. Offline/pass-and-play is fully usable now.

The economic rules are also deliberately **not invented** yet. Chance (`সুযোগ` / `मौका`) and Republic (`গণতন্ত্রাষ্ট্র` / `गणराज्य`) effects, buying, rent, tax, and jail outcomes can be added once the faded rule text is confirmed. Both original panels are included verbatim as images.

## Route

`01` Collect Salary → `02–09` right edge bottom-to-top → `10` Jail → `11–18` top edge right-to-left → `19` Rest corner → `20–27` left edge top-to-bottom → `28` Merchants Club → `29–36` bottom edge left-to-right → back to `01`.

The square metadata in `game.js` is indexed in exactly that order. A few heavily faded printed prices/labels are best verified against the full scan; the visible board itself is unchanged.

## Run locally

No build step or dependencies are required:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open the served `index.html`.

## Files

- `index.html` — landing page and setup form
- `landing.js` — mode, player count, room code and invite link
- `board.html` — board cabinet, dice tray, controls and dialogs
- `game.js` — 36-space geometry, tile metadata, setup state, dice, movement and UI
- `style.css` — aged-paper/red-and-gold presentation and responsive layout
- `assets/vyapari-board.jpg` — exact embedded scan from the supplied PDF
- `assets/rules-left.jpg` — enlarged Bengali rule panel
- `assets/rules-right.jpg` — enlarged Hindi rule panel
- `.nojekyll` — tells GitHub Pages to serve the static files directly
