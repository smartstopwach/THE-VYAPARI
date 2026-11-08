# ব্যবসায়ী / व्यापारी — two-dice board

A faithful web recreation of the supplied scanned board game, with a separate setup screen and the owner-confirmed house rules now running in the game ledger.

## Flow

1. **`index.html` — landing / setup**
   - Choose **Offline** (pass & play) or **Online** (room + invite link).
   - Choose **2, 3 or 4 players**.
   - Press **Open the board**. The form works even with JavaScript disabled.
2. **`board.html` — the game board**
   - Reads `mode`, `players`, and `room` from the setup URL, and remembers them in `localStorage`.
   - Shows the mode in the header, offers a copyable invite link in online mode, and provides a **Change setup** link back to the landing page.
   - Two animated dice move the selected number of buttons around the exact route.
   - The app is the permanent banker; there is no human-banker selection.

The board is **not redrawn**: the exact embedded JPEG from the PDF is used as the play surface, preserving the centre fold, worn red frame, old ink, bilingual Bengali/Hindi labels, India map, Mickey Mouse, and both original rule panels.

## GitHub Pages

The site is published from the root of `arena/9cc550df-the-vyapari` at:

`https://smartstopwach.github.io/THE-VYAPARI/`

`.nojekyll` is present so GitHub Pages serves the static files directly instead of rendering `README.md` as a fallback. CSS and JS links are versioned (`style.css?v=3`, `game.js?v=4`) to bypass stale browser caches. If an old white README page is still visible, do a hard refresh (`Ctrl+F5` / `Cmd+Shift+R`) after the newest Pages build finishes.

## What is ready

- Exact 36-space perimeter map measured against the 2672 × 2705 scan.
- Two animated six-sided dice; the sum moves the active button around the unchanged route.
- 2–4 vintage buttons, with overlapping-token offsets.
- Route starts at the bottom-right **Collect Salary** corner and follows the yellow arrow up the right edge, then across the top, down the left edge, and along the bottom.
- Hover/click any space for its name, printed value, category and current deed status.
- Optional route numbers, board magnifier, full-resolution scan, and enlarged Bengali/Hindi rule panels.
- Tiny generated dice-clack sound, a game ledger, reset, keyboard Space to roll, and reduced-motion support.
- App-bank ledger with cash, free / girvi tickets, laps, buy / leave, mortgage / redeem / sell, taxes, jail and net-worth scoring.

## Confirmed house rules implemented

- **2 / 3 / 4 players**; **app is always the banker**.
- Each player starts with **₹16,685**.
- The **first player is chosen randomly** for every new game.
- A player may buy a ticket only **after completing one full lap**; passing / crossing Start counts as completing the lap.
- Movement is by the **sum of two dice** on the existing route. **Doubles have no special effect**; no extra turn and no three-doubles jail.
- **Start**: the opening placement pays nothing; every later **exact landing** pays **₹250**. Passing Start pays nothing.
- **Chance / Republic**: the **same dice total** that landed on the square selects line `2–12` from the corresponding printed centre panel. Chance line `3` is confirmed as **move the token to Jail + pay ₹500**. All other exact lines and amounts are pending.
- **Jail**: exact landing costs **₹500** to the app bank; a Chance line that sends the token there also costs ₹500. The next turn is normal.
- **Merchants Club**: exact landing pays **₹50**. **Milk Bar**: exact landing pays **₹10**. The old top-left corner metadata is now named Milk Bar.
- **Taxes**: exact landing only. With **0 free / non-mortgaged tickets**, both taxes are **₹0**. Otherwise **Income Tax = ₹2,000** and **Sales Tax = ₹50 × free ticket count**.
- **Unowned ticket**: after a completed lap, the player may **buy at the printed price** or **leave it**. No auction. A player cannot mortgage or sell tickets to fund a purchase.
- **Owned ticket**: rent is the amount written on the ticket; exact values are pending. A **girvi / mortgaged** ticket collects no rent.
- **Colour system**: rent increases through the colour system, with per-ticket rules and the exact trigger still pending. **No houses / hotels / buildings**.
- **Girvi / mortgage**: pays **50%** of the printed price; **max 3 girvi tickets per player**. Redeem returns exactly the same 50%, with no interest, and rent resumes.
- **Sell**: only to the app bank. A free ticket returns **100%**; a girvi ticket returns the **remaining 50%** with no separate redeem. No player-to-player trading.
- Mortgage / sell are allowed to clear a debt, but not to buy a ticket.
- **Bankruptcy**: after selling everything, a player who still cannot pay is out; remaining assets go to the app bank. The **first bankruptcy ends the game immediately**. Winner = highest net worth among active players: `cash + full price of free tickets + 50% equity of girvi tickets`. A bankrupt player scores `0`.

## Still pending (not guessed)

These are deliberately kept as placeholders in `game.js` until the owner supplies them:

- Exact **base rent** for every ticket.
- Exact **colour groups / trigger / per-ticket boosted rent**.
- Exact **special systems** for Railway, Aerodrome, Post Office, Steamer Co., Radio Station and Nagpur Transport.
- The full **11 + 11 numbered Chance / Republic lines** and their amounts.
- A few heavily faded printed prices / labels, including the provisional **₹1,000** on space 09.

**Online mode is still room-setup only.** It creates a room code and a shareable board link; live cross-device move syncing needs a backend and remains a later decision. Offline/pass-and-play is fully usable now.

## Route

`01` Collect Salary → `02–09` right edge bottom-to-top → `10` Jail → `11–18` top edge right-to-left → `19` Milk Bar → `20–27` left edge top-to-bottom → `28` Merchants Club → `29–36` bottom edge left-to-right → back to `01`.

The square metadata in `game.js` is indexed in exactly that order. Space 09 has been verified as **Ludhiana** from a closer photo; a few other heavily faded printed prices/labels are best verified against the full scan. The visible board itself is unchanged.

## Run locally

No build step or dependencies are required:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open the served `index.html`.

## Files

- `index.html` — landing page and setup form
- `landing.js` — mode, player count, room code and invite link
- `board.html` — board cabinet, dice tray, bank / action / deed / winner panels and dialogs
- `game.js` — 36-space geometry, tile metadata, setup state, confirmed rules, dice, movement and UI
- `style.css` — aged-paper/red-and-gold presentation, new ledger panels and responsive layout
- `assets/vyapari-board.jpg` — exact embedded scan from the supplied PDF
- `assets/rules-left.jpg` — enlarged Bengali rule panel
- `assets/rules-right.jpg` — enlarged Hindi rule panel
- `.nojekyll` — tells GitHub Pages to serve the static files directly
