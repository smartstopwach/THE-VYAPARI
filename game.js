/* Vyapari — faithful board map + confirmed two-dice house rules.
   Coordinates are measured directly on the supplied 2672 × 2705 scan.
   Exact ticket rents, colour boosts, special-ticket systems and the numbered
   Chance / Republic lines are intentionally left as pending placeholders. */
(() => {
  'use strict';

  const BOARD_W = 2672;
  const BOARD_H = 2705;

  // Track geometry from the scan. The route starts at the bottom-right corner
  // and follows the yellow arrow up the right-hand side.
  const x0 = 40, x1 = 465, x2 = 2205, x3 = 2605;
  const y0 = 45, y1 = 470, y2 = 2225, y3 = 2645;
  const xs = Array.from({ length: 9 }, (_, i) => x1 + (x2 - x1) * i / 8);
  const ys = Array.from({ length: 9 }, (_, i) => y1 + (y2 - y1) * i / 8);

  const rects = [];
  rects[0]  = { x: x2, y: y2, w: x3 - x2, h: y3 - y2 };
  for (let i = 0; i < 8; i += 1) {
    const j = 7 - i; // right edge: bottom to top
    rects[1 + i] = { x: x2, y: ys[j], w: x3 - x2, h: ys[j + 1] - ys[j] };
  }
  rects[9] = { x: x2, y: y0, w: x3 - x2, h: y1 - y0 };
  for (let i = 0; i < 8; i += 1) {
    const j = 7 - i; // top edge: right to left
    rects[10 + i] = { x: xs[j], y: y0, w: xs[j + 1] - xs[j], h: y1 - y0 };
  }
  rects[18] = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  for (let i = 0; i < 8; i += 1) {
    rects[19 + i] = { x: x0, y: ys[i], w: x1 - x0, h: ys[i + 1] - ys[i] };
  }
  rects[27] = { x: x0, y: y2, w: x1 - x0, h: y3 - y2 };
  for (let i = 0; i < 8; i += 1) {
    rects[28 + i] = { x: xs[i], y: y2, w: xs[i + 1] - xs[i], h: y3 - y2 };
  }

  // Deterministic hooks for local smoke tests only. Normal play ignores them.
  const FORCED_DICE = Array.isArray(window.__vyapariDice) ? window.__vyapariDice : null;
  const FORCED_FIRST_PLAYER = Number.isInteger(window.__vyapariFirstPlayer)
    ? window.__vyapariFirstPlayer
    : null;

  const RULES = Object.freeze({
    startingCash: 16685,
    startSalary: 250,
    jailFine: 500,
    merchantsClub: 50,
    milkBar: 10,
    incomeTax: 2000,
    salesTaxPerFreeTicket: 50,
    mortgageRate: 0.5,
    maxMortgagesPerPlayer: 3,
    lapRequiredToBuy: 1,
    firstPlayerRandom: true,
    noDoubleRules: true,
    noAuction: true,
    noTrading: true,
    noBuildings: true,
    bankOnlySell: true,
    gameEndsOnFirstBankruptcy: true,
    bankruptNetWorth: 0,
    chanceUsesSameRoll: true
  });

  const KIND_LABEL = {
    start: 'START',
    republic: 'REPUBLIC',
    property: 'PROPERTY',
    tax: 'TAX',
    chance: 'CHANCE',
    jail: 'JAIL',
    transport: 'TRANSPORT',
    utility: 'SERVICE',
    corner: 'CORNER',
    club: 'CLUB',
    milkbar: 'MILK BAR'
  };

  const DEFAULT_NOTES = {
    start: 'The starting corner. Exact landing pays the confirmed salary after the opening placement.',
    republic: 'A golden Republic square. The same dice total selects one of the printed 2–12 lines.',
    property: 'An original city deed with the old sunburst artwork and bilingual place name.',
    tax: 'A printed tax square. The confirmed tax rule applies only on exact landing.',
    chance: 'A Chance / সুযোগ / मौका square. The same dice total selects one of the printed 2–12 lines.',
    jail: 'The dark Jail corner. Exact landing costs the confirmed fine to the app bank.',
    transport: 'One of the old illustrated transport holdings.',
    utility: 'A service or public-building square from the original route.',
    corner: 'One of the four large photographic corner squares.',
    club: 'Merchants Club — the illustrated corner before the bottom row.',
    milkbar: 'The dark photographic Milk Bar corner, with its diagonal lettering preserved from the scan.'
  };

  const SQUARES = [
    { name: 'Collect Salary', kind: 'start', price: '₹250', local: 'শুরু / प्रारंभ' },
    { name: 'Republic', kind: 'republic', price: '—', local: 'গণতন্ত্রাষ্ট্র / गणराज्य' },
    { name: 'Delhi', kind: 'property', price: '₹4,500', local: 'দিল্লী / दिल्ली' },
    { name: 'Agra', kind: 'property', price: '₹1,500', local: 'আগ্রা / आगरा' },
    { name: 'Jaipur', kind: 'property', price: '₹2,200', local: 'জয়পুর / जयपुर' },
    { name: 'Income Tax', kind: 'tax', price: '₹2,000', local: 'আয়কর / आयकर' },
    { name: 'Jalandhar', kind: 'property', price: '₹1,000', local: 'জলন্ধর / जलंधर' },
    { name: 'Chance', kind: 'chance', price: '—', local: 'সুযোগ / मौका' },
    // Space 09: verified as Ludhiana from a closer photo supplied by the user.
    { name: 'Ludhiana', kind: 'property', price: '₹1,000', local: 'লুধিয়ানা / लुधियाना' },
    { name: 'Jail', kind: 'jail', price: '—', local: 'কারাগার / कारागार' },
    { name: 'Dehradun', kind: 'property', price: '₹2,300', local: 'দেহরাদুন / देहरादून' },
    { name: 'Srinagar (Kashmir)', kind: 'property', price: '₹2,700', local: 'শ্রীনগর / श्रीनगर' },
    { name: 'Steamer Co. (Cochin)', kind: 'transport', price: '₹7,000', local: 'স্টীমার / स्टीमर' },
    { name: 'Cochin Steamer Co.', kind: 'transport', price: '₹1,500', local: 'কোচিন / कोचीन' },
    { name: 'Post Office', kind: 'utility', price: '₹2,000', local: 'ডাকঘর / डाकघर' },
    { name: 'Hyderabad', kind: 'property', price: '₹2,500', local: 'হায়দ্রাবাদ / हैदराबाद' },
    { name: 'Chennai', kind: 'property', price: '₹4,000', local: 'চেন্নাই / चेन्नई' },
    { name: 'Tatanagar', kind: 'property', price: '₹3,500', local: 'টাটানগর / टाटानगर' },
    { name: 'Milk Bar', kind: 'milkbar', price: '—', local: 'MILK BAR' },
    { name: 'Kolkata', kind: 'property', price: '₹4,500', local: 'কোলকাতা / कोलकाता' },
    { name: 'Chance', kind: 'chance', price: '—', local: 'সুযোগ / मौका' },
    { name: 'Benaras', kind: 'property', price: '₹2,000', local: 'বেনারস / बनारस' },
    { name: 'Nagpur', kind: 'property', price: '₹2,000', local: 'নাগপুর / नागपुर' },
    { name: 'Nagpur Transport', kind: 'transport', price: '₹4,000', local: 'পরিবহন / परिवहन' },
    { name: 'Radio Station', kind: 'utility', price: '₹2,000', local: 'বেতার কেন্দ্র / रेडियो स्टेशन' },
    { name: 'Allahabad', kind: 'property', price: '₹1,700', local: 'এলাহাবাদ / इलाहाबाद' },
    { name: 'Patna', kind: 'property', price: '₹1,500', local: 'পাটনা / पटना' },
    { name: 'Merchants Club', kind: 'club', price: '—', local: 'ব্যবসায়ী ক্লাব' },
    { name: 'Republic', kind: 'republic', price: '—', local: 'গণতন্ত্রাষ্ট্র / गणराज्य' },
    { name: 'Ahmedabad', kind: 'property', price: '₹2,500', local: 'আমেদাবাদ / अहमदाबाद' },
    { name: 'Mumbai', kind: 'property', price: '₹4,000', local: 'মুম্বাই / मुंबई' },
    { name: 'Aerodrome', kind: 'transport', price: '₹5,000', local: 'বিমানঘাঁটি / एरोड्रोम' },
    { name: 'Sales Tax', kind: 'tax', price: '₹50–500', local: 'বিক্রয়কর / विक्री कर' },
    { name: 'Railway', kind: 'transport', price: '₹7,000', local: 'রেল / रेलवे' },
    { name: 'Kanpur', kind: 'property', price: '₹3,500', local: 'কানপুর / कानपुर' },
    { name: 'Lucknow', kind: 'property', price: '₹1,900', local: 'লখনৌ / लखनऊ' }
  ];

  const NOTE_OVERRIDES = {
    0: 'Start here and follow the yellow arrow up the right edge. Exact landing pays ₹250 every time; the opening placement pays nothing. Passing Start only completes a lap.',
    1: 'Republic panel. The same two-dice total selects line 2–12 from the printed centre panel. Exact outcomes are pending.',
    5: 'Income Tax. Exact landing costs ₹2,000 if the player has at least one free ticket; with 0 free tickets, both taxes are ₹0.',
    7: 'Chance / সুযোগ / मौका. The same dice total selects line 2–12. Line 3 is confirmed as “go to Jail + ₹500”; the other lines are pending.',
    9: 'Jail. Exact landing costs ₹500 to the app bank. A Chance line that sends the token here also costs ₹500. The next turn is normal.',
    18: 'Milk Bar. Exact landing pays ₹10 from the app bank. Pass / cross gives nothing.',
    20: 'Chance / সুযোগ / मौका. The same dice total selects line 2–12. Line 3 is confirmed as “go to Jail + ₹500”; the other lines are pending.',
    27: 'Merchants Club. Exact landing pays ₹50 from the app bank.',
    28: 'Republic panel. The same two-dice total selects line 2–12 from the printed centre panel. Exact outcomes are pending.',
    32: 'Sales Tax. Exact landing costs ₹50 for each free / non-mortgaged ticket; with 0 free tickets, both taxes are ₹0.'
  };

  const TICKET_KINDS = new Set(['property', 'transport', 'utility']);
  const SPECIAL_TICKET_INDICES = new Set([12, 13, 14, 23, 24, 31, 33]);
  const CHANCE_INDICES = new Set([7, 20]);
  const REPUBLIC_INDICES = new Set([1, 28]);
  const PANEL_LABELS = { chance: 'Chance', republic: 'Republic' };

  function buildPanelLines(includeJailLine) {
    const lines = {};
    for (let total = 2; total <= 12; total += 1) {
      lines[total] = { confirmed: false, text: 'Exact printed line pending' };
    }
    if (includeJailLine) {
      lines[3] = {
        confirmed: true,
        text: 'Go to Jail and pay the ₹500 fine',
        move: 'jail',
        fine: RULES.jailFine
      };
    }
    return lines;
  }

  const PANEL_LINES = {
    chance: buildPanelLines(true),
    republic: buildPanelLines(false)
  };

  const PLAYER_PRESETS = [
    { name: 'Player 1', color: '#c53b3f' },
    { name: 'Player 2', color: '#286fa1' },
    { name: 'Player 3', color: '#2c8a62' },
    { name: 'Player 4', color: '#dfa12b' }
  ];

  const PIP_MAP = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  const $ = (id) => document.getElementById(id);
  const board = $('board');
  const squareLayer = $('squareLayer');
  const tokenLayer = $('tokenLayer');
  const tooltip = $('boardTooltip');
  const diceEls = [$('dieOne'), $('dieTwo')];
  const diceTotal = $('diceTotal');
  const rollButton = $('rollButton');
  const resetButton = $('resetButton');
  const gameLog = $('gameLog');
  const playerList = $('playerList');
  const bankList = $('bankList');
  const pendingNote = $('pendingNote');
  const actionSection = $('actionSection');
  const actionHeading = $('actionHeading');
  const actionHint = $('actionHint');
  const actionBody = $('actionBody');
  const deedHint = $('deedHint');
  const deedActions = $('deedActions');
  const winnerPanel = $('winnerPanel');
  const winnerTitle = $('winnerTitle');
  const winnerBody = $('winnerBody');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STORAGE_KEY = 'vyapari.setup';
  const roomAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const pad = (n) => String(n).padStart(2, '0');
  const pct = (value, total) => `${(value / total) * 100}%`;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function numericPrice(square) {
    const match = String(square.price || '').match(/\d[\d,]*/);
    return match ? Number(match[0].replace(/,/g, '')) : 0;
  }

  function isTicket(index) {
    return TICKET_KINDS.has(SQUARES[index].kind);
  }

  function prepareSquares() {
    SQUARES.forEach((square, index) => {
      square.index = index;
      square.cost = TICKET_KINDS.has(square.kind) ? numericPrice(square) : 0;
      if (TICKET_KINDS.has(square.kind)) {
        square.rent = null;
        square.colourGroup = null;
        square.colourRent = null;
        square.specialRule = null;
      }
    });
    Object.entries(NOTE_OVERRIDES).forEach(([key, note]) => {
      SQUARES[Number(key)].note = note;
    });
  }

  prepareSquares();

  function pendingPanelLineCount() {
    return [PANEL_LINES.chance, PANEL_LINES.republic].reduce((count, panel) => (
      count + Object.values(panel).filter((line) => !line.confirmed).length
    ), 0);
  }

  function makeRoomCode() {
    let bytes;
    if (window.crypto && window.crypto.getRandomValues) {
      bytes = new Uint8Array(6);
      window.crypto.getRandomValues(bytes);
    } else {
      bytes = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
    }
    return `VY-${Array.from(bytes, (byte) => roomAlphabet[byte % roomAlphabet.length]).join('')}`;
  }

  function readSetup() {
    const params = new URLSearchParams(window.location.search);
    let saved = {};
    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      saved = {};
    }

    const modeParam = params.get('mode');
    const mode = ['online', 'offline'].includes(modeParam)
      ? modeParam
      : (['online', 'offline'].includes(saved.mode) ? saved.mode : 'offline');

    const queryPlayers = Number(params.get('players'));
    const savedPlayers = Number(saved.players);
    const count = [2, 3, 4].includes(queryPlayers)
      ? queryPlayers
      : ([2, 3, 4].includes(savedPlayers) ? savedPlayers : 2);

    let room = '';
    if (mode === 'online') {
      const raw = (params.get('room') || saved.room || '').toUpperCase();
      room = /^VY-[A-Z2-9]{6}$/.test(raw) ? raw : makeRoomCode();
    }
    return { mode, players: count, room };
  }

  const setup = readSetup();

  function saveSetup() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
    } catch (_) {
      // The query string in the URL is enough when storage is unavailable.
    }
  }

  saveSetup();

  function randomInt(max) {
    if (FORCED_FIRST_PLAYER !== null) {
      return Math.min(Math.max(FORCED_FIRST_PLAYER, 0), max - 1);
    }
    return Math.floor(Math.random() * max);
  }

  function randomDie() {
    if (FORCED_DICE && FORCED_DICE.length) {
      const value = Number(FORCED_DICE.shift());
      return Math.min(6, Math.max(1, value || 1));
    }
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return (value[0] % 6) + 1;
    }
    return Math.floor(Math.random() * 6) + 1;
  }

  function visualDie() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function makePlayers(count) {
    return PLAYER_PRESETS.slice(0, count).map((preset, id) => ({
      ...preset,
      id,
      cash: RULES.startingCash,
      position: 0,
      laps: 0,
      owned: [],
      mortgaged: new Set(),
      bankrupt: false
    }));
  }

  function freeTickets(player) {
    return player.owned.filter((index) => !player.mortgaged.has(index));
  }

  function netWorth(player) {
    if (player.bankrupt) return RULES.bankruptNetWorth;
    return player.owned.reduce((total, index) => {
      const cost = SQUARES[index].cost;
      return total + (player.mortgaged.has(index) ? cost * RULES.mortgageRate : cost);
    }, player.cash);
  }

  let players = [];
  let ownerBySquare = Array(SQUARES.length).fill(null);
  let activePlayer = 0;
  let selectedSquare = 0;
  let turn = 1;
  let rolling = false;
  let phase = 'idle';
  let gameOver = false;
  let gameToken = 0;
  let decisionResolver = null;
  let pendingBuy = null;
  let pendingDebt = null;
  let lastRoll = null;
  let finalScores = [];
  let winnerText = '';
  let soundOn = true;
  let logCount = 0;
  let audioContext = null;
  const squareEls = [];

  function waitForDecision() {
    return new Promise((resolve) => { decisionResolver = resolve; });
  }

  function settleDecision(value) {
    if (!decisionResolver) return;
    const resolve = decisionResolver;
    decisionResolver = null;
    resolve(value);
  }

  function createDice() {
    diceEls.forEach((die) => {
      for (let i = 0; i < 9; i += 1) {
        const pip = document.createElement('span');
        pip.className = 'pip';
        die.append(pip);
      }
    });
    setDice(1, 1, false);
  }

  function setDice(a, b, showTotal = true) {
    [a, b].forEach((value, dieIndex) => {
      const active = PIP_MAP[value];
      const die = diceEls[dieIndex];
      [...die.children].forEach((pip, pipIndex) => pip.classList.toggle('on', active.includes(pipIndex)));
      die.setAttribute('aria-label', `Die ${dieIndex + 1}, showing ${value}`);
    });
    if (showTotal) diceTotal.textContent = String(a + b);
  }

  function showTooltip(index) {
    const square = SQUARES[index];
    tooltip.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = `${pad(index + 1)} · ${square.name}`;
    const detail = document.createElement('small');
    const local = square.local ? ` · ${square.local}` : '';
    detail.textContent = `${KIND_LABEL[square.kind]} · ${square.price}${local}`;
    tooltip.append(title, detail);
    tooltip.classList.add('visible');
  }

  function positionTooltipFromEvent(event) {
    const box = board.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - box.left, 90), box.width - 90);
    const y = Math.max(event.clientY - box.top, 55);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function positionTooltipFromElement(element) {
    const box = board.getBoundingClientRect();
    const target = element.getBoundingClientRect();
    const x = Math.min(Math.max(target.left + target.width / 2 - box.left, 90), box.width - 90);
    const y = Math.max(target.top - box.top + 18, 55);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  function createSquares() {
    SQUARES.forEach((square, index) => {
      const rect = rects[index];
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'square';
      element.dataset.index = String(index);
      element.dataset.kind = square.kind;
      element.style.left = pct(rect.x, BOARD_W);
      element.style.top = pct(rect.y, BOARD_H);
      element.style.width = pct(rect.w, BOARD_W);
      element.style.height = pct(rect.h, BOARD_H);
      element.setAttribute('aria-label', `Space ${pad(index + 1)} of 36: ${square.name}, ${KIND_LABEL[square.kind]}`);

      const number = document.createElement('span');
      number.className = 'num';
      number.textContent = pad(index + 1);
      element.append(number);

      element.addEventListener('mouseenter', (event) => {
        showTooltip(index);
        positionTooltipFromEvent(event);
      });
      element.addEventListener('mousemove', positionTooltipFromEvent);
      element.addEventListener('mouseleave', hideTooltip);
      element.addEventListener('focus', () => {
        showTooltip(index);
        positionTooltipFromElement(element);
      });
      element.addEventListener('blur', hideTooltip);
      element.addEventListener('click', () => {
        selectedSquare = index;
        updateSquareHighlights();
        showSquareCard(index);
      });

      squareLayer.append(element);
      squareEls.push(element);
    });
  }

  function ensureTokenElements() {
    while (tokenLayer.children.length < players.length) {
      const token = document.createElement('div');
      token.className = 'token';
      tokenLayer.append(token);
    }
    while (tokenLayer.children.length > players.length) {
      tokenLayer.lastElementChild.remove();
    }
  }

  function updateTokenPositions() {
    ensureTokenElements();
    const groups = new Map();
    players.forEach((player) => {
      if (!groups.has(player.position)) groups.set(player.position, []);
      groups.get(player.position).push(player.id);
    });

    players.forEach((player, index) => {
      const rect = rects[player.position];
      const siblings = groups.get(player.position);
      const slot = siblings.indexOf(player.id);
      const horizontalOffset = (slot - (siblings.length - 1) / 2) * 25;
      const verticalOffset = slot % 2 ? 12 : 0;
      const cx = rect.x + rect.w / 2 + horizontalOffset;
      const cy = rect.y + rect.h * 0.76 + verticalOffset;
      const token = tokenLayer.children[index];

      token.style.left = pct(cx, BOARD_W);
      token.style.top = pct(cy, BOARD_H);
      token.style.setProperty('--token-color', player.color);
      token.textContent = String(index + 1);
      token.classList.toggle('active', index === activePlayer);
      token.classList.toggle('bankrupt', player.bankrupt);
    });
  }

  function updateSquareHighlights() {
    squareEls.forEach((element, index) => {
      const ownerId = ownerBySquare[index];
      const owned = ownerId !== null;
      element.classList.toggle('active', players[activePlayer] && players[activePlayer].position === index);
      element.classList.toggle('selected', selectedSquare === index);
      element.classList.toggle('owned', owned);
      element.classList.toggle('mortgaged', owned && players[ownerId].mortgaged.has(index));
      if (owned) element.style.setProperty('--owner-color', players[ownerId].color);
    });
  }

  function showSquareCard(index) {
    const square = SQUARES[index];
    let note = square.note || DEFAULT_NOTES[square.kind];
    if (isTicket(index)) {
      const ownerId = ownerBySquare[index];
      const bits = [];
      bits.push(ownerId === null
        ? 'Unowned ticket'
        : `Owned by ${players[ownerId].name}${players[ownerId].mortgaged.has(index) ? ' · girvi, no rent' : ''}`);
      bits.push(square.rent === null ? 'Rent: exact ticket value pending' : `Rent: ${money(square.rent)}`);
      if (square.colourGroup === null) bits.push('Colour group / boost pending');
      if (SPECIAL_TICKET_INDICES.has(index)) bits.push('Special ticket system pending');
      note = `${note} ${bits.join(' · ')}`;
    }
    $('squareIndex').textContent = `${pad(index + 1)} / 36`;
    $('squareKind').textContent = KIND_LABEL[square.kind];
    $('squareName').textContent = square.name;
    $('squareNote').textContent = note;
    $('squarePrice').textContent = square.price;
  }

  function renderCurrentPlayer() {
    const player = players[activePlayer];
    if (!player) return;
    $('currentSwatch').style.setProperty('--current-color', player.color);
    $('currentPlayerName').textContent = player.name;
    const buyState = player.laps >= RULES.lapRequiredToBuy ? 'can buy' : '1 lap to buy';
    $('currentPlayerPosition').textContent = `${SQUARES[player.position].name} · space ${pad(player.position + 1)} · ${money(player.cash)} · ${buyState}`;
    $('turnCounter').textContent = `Turn ${turn}`;
  }

  function renderPlayerList() {
    playerList.replaceChildren();
    players.forEach((player, index) => {
      const card = document.createElement('div');
      card.className = `player-card${index === activePlayer ? ' active' : ''}${player.bankrupt ? ' out' : ''}`;
      card.style.setProperty('--player-color', player.color);
      card.innerHTML = `
        <span class="swatch" aria-hidden="true"></span>
        <strong>${player.name}${player.bankrupt ? ' · OUT' : ''}</strong>
        <span class="pos">${money(player.cash)} · ${freeTickets(player).length}F/${player.mortgaged.size}G · ${player.laps} lap${player.laps === 1 ? '' : 's'}</span>
      `;
      playerList.append(card);
    });
  }

  function renderBankPanel() {
    $('bankSummary').textContent = `App bank · ${money(RULES.startingCash)} each · no human banker`;
    const pendingRent = SQUARES.filter((square) => isTicket(square.index) && square.rent === null).length;
    const pendingPanel = pendingPanelLineCount();
    pendingNote.innerHTML = `<strong>Exact ticket rules pending</strong><span>${pendingRent} rents · ${SPECIAL_TICKET_INDICES.size} special systems · colour groups / boosts · ${pendingPanel} Chance / Republic lines. Placeholders are used; no amounts guessed.</span>`;

    bankList.replaceChildren();
    players.forEach((player) => {
      const row = document.createElement('div');
      row.className = `bank-row${player.id === activePlayer ? ' active' : ''}${player.bankrupt ? ' out' : ''}`;
      row.style.setProperty('--player-color', player.color);
      row.innerHTML = `
        <span class="bank-swatch" aria-hidden="true"></span>
        <strong>${player.name}</strong>
        <span>${money(player.cash)}</span>
        <small>${freeTickets(player).length} free · ${player.mortgaged.size} girvi · ${player.laps} lap${player.laps === 1 ? '' : 's'}${player.bankrupt ? ' · OUT' : ''}</small>
      `;
      bankList.append(row);
    });
  }

  function renderActionPanel() {
    if (gameOver) {
      actionSection.hidden = true;
      return;
    }
    if (pendingBuy) {
      const player = players[pendingBuy.playerId];
      const square = SQUARES[pendingBuy.index];
      const canAfford = player.cash >= pendingBuy.cost;
      actionSection.hidden = false;
      actionHeading.textContent = 'Buy this ticket?';
      actionHint.textContent = `${player.name} · ${money(player.cash)} in hand`;
      actionBody.innerHTML = `
        <p>Landed on <strong>${square.name}</strong> after completing a lap. Printed price <strong>${money(pendingBuy.cost)}</strong>.</p>
        <p class="action-fine">No auction. You may not mortgage or sell a ticket to fund a purchase. ${canAfford ? '' : 'Not enough cash — only “Leave it” is available.'}</p>
        <div class="action-buttons">
          <button type="button" class="mini-button primary" data-action="buy" ${canAfford ? '' : 'disabled'}>Buy ${money(pendingBuy.cost)}</button>
          <button type="button" class="mini-button" data-action="leave">Leave it</button>
        </div>
      `;
      return;
    }
    if (pendingDebt) {
      const player = players[pendingDebt.playerId];
      const shortfall = Math.max(0, pendingDebt.amount - player.cash);
      actionSection.hidden = false;
      actionHeading.textContent = 'Raise cash';
      actionHint.textContent = `Short by ${money(shortfall)}`;
      actionBody.innerHTML = `
        <p><strong>${player.name}</strong> owes <strong>${money(pendingDebt.amount)}</strong> for ${pendingDebt.reason}. Cash in hand: ${money(player.cash)}.</p>
        <p class="action-fine">Mortgage (50%) or sell to the app bank to clear a debt; max 3 girvi tickets per player. Redeem costs exactly the 50% already received. Selling a girvi ticket pays the remaining 50%.</p>
        <div class="action-buttons">
          <button type="button" class="mini-button primary" data-action="settleDebt" ${player.cash >= pendingDebt.amount ? '' : 'disabled'}>Pay from cash</button>
          <button type="button" class="mini-button" data-action="sellAll">Sell everything &amp; settle</button>
        </div>
      `;
      return;
    }
    actionSection.hidden = true;
  }

  function renderDeedActions(canManage) {
    const player = players[activePlayer];
    if (gameOver) deedHint.textContent = 'Game over';
    else if (pendingBuy) deedHint.textContent = 'Locked while buying — no liquidation for a purchase';
    else if (phase === 'awaitLiquidation') deedHint.textContent = 'Mortgage / sell allowed to clear the debt';
    else if (canManage) deedHint.textContent = `Max ${RULES.maxMortgagesPerPlayer} girvi · bank-sell only`;
    else deedHint.textContent = 'Wait for the next decision';

    deedActions.replaceChildren();
    if (!player || player.owned.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'deed-empty';
      empty.textContent = 'No tickets owned yet.';
      deedActions.append(empty);
      return;
    }

    player.owned.forEach((index) => {
      const square = SQUARES[index];
      const mortgaged = player.mortgaged.has(index);
      const half = square.cost * RULES.mortgageRate;
      const row = document.createElement('div');
      row.className = `deed-row${mortgaged ? ' mortgaged' : ''}`;
      row.innerHTML = `
        <div class="deed-label"><strong>${square.name}</strong><small>${money(square.cost)} · ${mortgaged ? 'girvi / no rent' : 'free'}</small></div>
        <div class="deed-buttons">
          ${mortgaged
            ? `<button type="button" class="mini-button" data-deed-action="redeem" data-index="${index}" ${canManage && player.cash >= half ? '' : 'disabled'}>Redeem −${money(half)}</button>
               <button type="button" class="mini-button" data-deed-action="sellMortgaged" data-index="${index}" ${canManage ? '' : 'disabled'}>Sell +${money(half)}</button>`
            : `<button type="button" class="mini-button" data-deed-action="mortgage" data-index="${index}" ${canManage && player.mortgaged.size < RULES.maxMortgagesPerPlayer ? '' : 'disabled'}>Girvi +${money(half)}</button>
               <button type="button" class="mini-button" data-deed-action="sellFree" data-index="${index}" ${canManage ? '' : 'disabled'}>Sell +${money(square.cost)}</button>`}
        </div>
      `;
      deedActions.append(row);
    });
  }

  function renderWinnerPanel() {
    winnerPanel.hidden = !gameOver;
    if (!gameOver) return;
    winnerTitle.textContent = winnerText || 'Game over · net worth';
    winnerBody.replaceChildren();
    finalScores.forEach((score) => {
      const row = document.createElement('div');
      row.className = `score-row${score.player.bankrupt ? ' out' : ''}`;
      row.innerHTML = `<span>${score.player.name}${score.player.bankrupt ? ' · OUT' : ''}</span><strong>${money(score.worth)}</strong>`;
      winnerBody.append(row);
    });
  }

  function renderControls() {
    const canRoll = phase === 'idle' && !gameOver;
    rollButton.disabled = !canRoll;
    resetButton.disabled = !(phase === 'idle' || gameOver);
    document.querySelectorAll('[data-count]').forEach((button) => {
      button.disabled = !(phase === 'idle' && !gameOver);
    });
    const canManage = (phase === 'idle' || phase === 'awaitLiquidation') && !gameOver && !pendingBuy;
    renderActionPanel();
    renderDeedActions(canManage);
    renderWinnerPanel();
  }

  function renderAll() {
    renderSetupUI();
    renderCurrentPlayer();
    renderPlayerList();
    renderBankPanel();
    updateSquareHighlights();
    updateTokenPositions();
    showSquareCard(selectedSquare);
    renderControls();
  }

  function inviteUrl() {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('mode', setup.mode);
    url.searchParams.set('players', String(setup.players));
    if (setup.mode === 'online') url.searchParams.set('room', setup.room);
    else url.searchParams.delete('room');
    return url.toString();
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // Use the selection fallback below.
    }
    try {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      return copied;
    } catch (_) {
      return false;
    }
  }

  function renderSetupUI() {
    const status = $('setupStatus');
    const invite = $('inviteButton');
    const banner = $('onlineBanner');
    const note = $('onlineNote');
    if (!status || !invite || !banner || !note) return;

    const online = setup.mode === 'online';
    document.body.dataset.mode = setup.mode;
    status.textContent = online
      ? `Online room ${setup.room} · ${setup.players} players`
      : `Offline · ${setup.players} players`;
    invite.hidden = !online;
    banner.hidden = !online;
    note.hidden = !online;
    $('onlineBannerText').textContent = online
      ? `Room ${setup.room} — share the invite link. Live cross-device play is the next build; this board is in room-preview mode.`
      : '';
    document.querySelectorAll('[data-count]').forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.count) === setup.players);
    });
  }

  function addLog(message) {
    logCount += 1;
    const item = document.createElement('li');
    const number = document.createElement('span');
    const text = document.createElement('p');
    number.textContent = pad(logCount);
    text.textContent = message;
    item.append(number, text);
    gameLog.prepend(item);
    while (gameLog.children.length > 48) gameLog.lastElementChild.remove();
  }

  function clack(intensity = 1) {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();

      const duration = 0.045;
      const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * duration), audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        const decay = Math.pow(1 - i / data.length, 3);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 1200 + Math.random() * 900;
      filter.Q.value = 0.8;
      gain.gain.value = 0.075 * intensity;
      source.connect(filter).connect(gain).connect(audioContext.destination);
      source.start();
    } catch (_) {
      // Audio is decorative; the board works without it.
    }
  }

  function creditPlayer(player, amount, reason) {
    player.cash += amount;
    addLog(`${player.name} received ${money(amount)} from the app bank for ${reason}.`);
  }

  function payDebt(player, debt) {
    player.cash -= debt.amount;
    if (debt.creditorId !== null && players[debt.creditorId] && !players[debt.creditorId].bankrupt) {
      players[debt.creditorId].cash += debt.amount;
    }
    const target = debt.creditorId === null ? 'the app bank' : players[debt.creditorId].name;
    addLog(`${player.name} paid ${money(debt.amount)} to ${target} for ${debt.reason}.`);
  }

  function settlePendingDebt() {
    if (!pendingDebt || phase !== 'awaitLiquidation') return false;
    const debt = pendingDebt;
    const player = players[debt.playerId];
    if (player.cash < debt.amount) return false;
    payDebt(player, debt);
    pendingDebt = null;
    phase = 'idle';
    settleDecision('paid');
    return true;
  }

  function maybeSettleDebt() {
    if (settlePendingDebt()) renderAll();
  }

  function handleDeedAction(action, index) {
    if (gameOver || pendingBuy || !(phase === 'idle' || phase === 'awaitLiquidation')) return;
    const player = players[activePlayer];
    if (!player.owned.includes(index)) return;
    const square = SQUARES[index];
    const cost = square.cost;
    const half = cost * RULES.mortgageRate;

    if (action === 'mortgage') {
      if (player.mortgaged.has(index)) return;
      if (player.mortgaged.size >= RULES.maxMortgagesPerPlayer) {
        addLog(`${player.name} already has ${RULES.maxMortgagesPerPlayer} girvi tickets — the limit.`);
        return;
      }
      player.mortgaged.add(index);
      player.cash += half;
      addLog(`${player.name} mortgaged ${square.name} for ${money(half)}. No rent will be collected on it.`);
    } else if (action === 'redeem') {
      if (!player.mortgaged.has(index)) return;
      if (player.cash < half) {
        addLog(`${player.name} needs ${money(half)} to redeem ${square.name}.`);
        return;
      }
      player.cash -= half;
      player.mortgaged.delete(index);
      addLog(`${player.name} redeemed ${square.name} for ${money(half)}. Rent resumes.`);
    } else if (action === 'sellFree' || action === 'sellMortgaged') {
      const mortgaged = player.mortgaged.has(index);
      const amount = mortgaged ? half : cost;
      player.cash += amount;
      player.owned = player.owned.filter((ownedIndex) => ownedIndex !== index);
      player.mortgaged.delete(index);
      ownerBySquare[index] = null;
      addLog(`${player.name} sold ${square.name} back to the app bank for ${money(amount)}${mortgaged ? ' (remaining half)' : ''}.`);
    } else {
      return;
    }
    renderAll();
    maybeSettleDebt();
  }

  function sellAllAndSettle() {
    if (!pendingDebt || phase !== 'awaitLiquidation') return;
    const player = players[pendingDebt.playerId];
    [...player.owned].forEach((index) => {
      const square = SQUARES[index];
      const mortgaged = player.mortgaged.has(index);
      const amount = mortgaged ? square.cost * RULES.mortgageRate : square.cost;
      player.cash += amount;
      player.owned = player.owned.filter((ownedIndex) => ownedIndex !== index);
      player.mortgaged.delete(index);
      ownerBySquare[index] = null;
      addLog(`${player.name} sold ${square.name} back to the app bank for ${money(amount)}${mortgaged ? ' (remaining half)' : ''}.`);
    });
    if (!settlePendingDebt()) {
      endGameWithBankruptcy(player);
      return;
    }
    renderAll();
  }

  function endGameWithBankruptcy(player) {
    player.bankrupt = true;
    player.cash = 0;
    player.owned.forEach((index) => { ownerBySquare[index] = null; });
    player.owned = [];
    player.mortgaged.clear();
    pendingDebt = null;
    pendingBuy = null;
    addLog(`${player.name} is bankrupt after selling everything. Game over — net worth decides the winner.`);

    finalScores = players.map((entry) => ({ player: entry, worth: netWorth(entry) }));
    const highest = Math.max(...finalScores.map((score) => score.worth));
    const winners = finalScores.filter((score) => !score.player.bankrupt && score.worth === highest);
    if (winners.length === 1) {
      winnerText = `${winners[0].player.name} wins with ${money(highest)} net worth.`;
    } else {
      winnerText = `Shared win: ${winners.map((score) => score.player.name).join(', ')} — ${money(highest)} each.`;
    }
    if (winners.length) activePlayer = winners[0].player.id;

    gameOver = true;
    phase = 'gameOver';
    settleDecision('bankrupt');
    renderAll();
  }

  async function chargePlayer(player, amount, reason, creditorId = null) {
    if (amount <= 0) return true;
    if (player.cash >= amount) {
      payDebt(player, { amount, reason, creditorId });
      return true;
    }
    pendingDebt = { playerId: player.id, amount, reason, creditorId };
    phase = 'awaitLiquidation';
    addLog(`${player.name} owes ${money(amount)} for ${reason} but has ${money(player.cash)}. Raise cash by mortgaging / selling tickets.`);
    renderAll();
    const outcome = await waitForDecision();
    pendingDebt = null;
    if (gameOver) return false;
    if (phase !== 'gameOver') phase = 'idle';
    renderAll();
    return outcome === 'paid';
  }

  async function applyPanelLine(kind, total, player) {
    const label = PANEL_LABELS[kind];
    const line = PANEL_LINES[kind][total];
    if (!line || !line.confirmed) {
      addLog(`${label} ${total}: exact printed outcome pending — no cash or move applied yet.`);
      return;
    }
    if (line.move === 'jail') {
      player.position = 9;
      selectedSquare = 9;
      addLog(`${label} ${total}: ${player.name}'s token moved to Jail.`);
      renderAll();
    }
    if (line.fine) {
      const ok = await chargePlayer(player, line.fine, `${label} ${total} — Jail`, null);
      if (!ok || gameOver) return;
    }
  }

  async function applyTax(player, index) {
    const freeCount = freeTickets(player).length;
    if (freeCount === 0) {
      addLog(`${player.name} has 0 free tickets — Income Tax and Sales Tax are both ₹0.`);
      return;
    }
    const amount = index === 5
      ? RULES.incomeTax
      : RULES.salesTaxPerFreeTicket * freeCount;
    const reason = index === 5
      ? 'Income Tax'
      : `Sales Tax (${freeCount} free ticket${freeCount === 1 ? '' : 's'} × ${money(RULES.salesTaxPerFreeTicket)})`;
    const ok = await chargePlayer(player, amount, reason, null);
    if (!ok || gameOver) return;
  }

  function isColourGroupComplete(player, group) {
    if (!group) return false;
    const indices = SQUARES.map((square, index) => index).filter((index) => SQUARES[index].colourGroup === group);
    return indices.length > 0 && indices.every((index) => ownerBySquare[index] === player.id);
  }

  function rentFor(index, owner) {
    const square = SQUARES[index];
    if (square.rent === null) return null;
    if (square.colourGroup && square.colourRent !== null && isColourGroupComplete(owner, square.colourGroup)) {
      return square.colourRent;
    }
    return square.rent;
  }

  function buyTicket(player, index) {
    const square = SQUARES[index];
    if (player.cash < square.cost) return;
    player.cash -= square.cost;
    player.owned.push(index);
    ownerBySquare[index] = player.id;
    addLog(`${player.name} bought ${square.name} for ${money(square.cost)}.`);
  }

  async function resolveTicket(player, index) {
    const square = SQUARES[index];
    const ownerId = ownerBySquare[index];

    if (ownerId === null) {
      if (player.laps < RULES.lapRequiredToBuy) {
        addLog(`${player.name} cannot buy ${square.name} yet — complete one lap first.`);
        return;
      }
      if (player.cash < square.cost) {
        addLog(`${player.name} has ${money(player.cash)}; ${square.name} costs ${money(square.cost)}. No liquidation is allowed to buy, so it stays unbought.`);
        return;
      }
      pendingBuy = { playerId: player.id, index, cost: square.cost };
      phase = 'awaitBuy';
      renderAll();
      const choice = await waitForDecision();
      pendingBuy = null;
      if (choice === 'buy') buyTicket(player, index);
      else addLog(`${player.name} left ${square.name} unbought.`);
      if (!gameOver) phase = 'idle';
      renderAll();
      return;
    }

    if (ownerId === player.id) {
      addLog(`${player.name} landed on their own ticket, ${square.name}.`);
      return;
    }

    const owner = players[ownerId];
    if (owner.mortgaged.has(index)) {
      addLog(`${square.name} is girvi — ${owner.name} cannot collect rent on it.`);
      return;
    }
    const rent = rentFor(index, owner);
    if (rent === null) {
      addLog(`Rent for ${square.name} is still pending — no transfer made yet.`);
      return;
    }
    const ok = await chargePlayer(player, rent, `rent on ${square.name}`, ownerId);
    if (!ok || gameOver) return;
  }

  async function resolveLanding(player, total) {
    const index = player.position;
    const square = SQUARES[index];
    selectedSquare = index;
    addLog(`${player.name} landed on ${square.name} (space ${pad(index + 1)}).`);
    renderAll();

    if (index === 0) creditPlayer(player, RULES.startSalary, 'exact Start landing');

    if (CHANCE_INDICES.has(index)) {
      await applyPanelLine('chance', total, player);
      if (gameOver) return;
    } else if (REPUBLIC_INDICES.has(index)) {
      await applyPanelLine('republic', total, player);
      if (gameOver) return;
    }

    if (index === 9) {
      const ok = await chargePlayer(player, RULES.jailFine, 'Jail fine', null);
      if (!ok || gameOver) return;
    }
    if (index === 27) creditPlayer(player, RULES.merchantsClub, 'Merchants Club');
    if (index === 18) creditPlayer(player, RULES.milkBar, 'Milk Bar');

    if (index === 5 || index === 32) {
      await applyTax(player, index);
      if (gameOver) return;
    }

    if (isTicket(index)) {
      await resolveTicket(player, index);
      if (gameOver) return;
    }
  }

  function finishTurn() {
    if (gameOver) return;
    let next = activePlayer;
    do {
      next = (next + 1) % players.length;
    } while (players[next].bankrupt && next !== activePlayer);
    activePlayer = next;
    turn += 1;
    phase = 'idle';
    renderAll();
  }

  async function moveActivePlayer(steps) {
    const player = players[activePlayer];
    for (let step = 0; step < steps; step += 1) {
      const next = (player.position + 1) % SQUARES.length;
      if (next === 0) {
        player.laps += 1;
        if (player.laps === RULES.lapRequiredToBuy) {
          addLog(`${player.name} completed a lap — buying is now allowed.`);
        } else {
          addLog(`${player.name} completed lap ${player.laps}.`);
        }
      }
      player.position = next;
      selectedSquare = next;
      updateTokenPositions();
      updateSquareHighlights();
      renderCurrentPlayer();
      showSquareCard(next);
      clack(0.16);
      await wait(reducedMotion ? 0 : 150);
    }
  }

  async function rollDice() {
    if (rolling || phase !== 'idle' || gameOver) return;
    const token = gameToken;
    rolling = true;
    phase = 'rolling';
    renderControls();
    rollButton.disabled = true;
    diceTotal.textContent = '…';
    diceEls.forEach((die) => die.classList.add('rolling'));
    clack(0.45);

    let ticker = window.setInterval(() => {
      setDice(visualDie(), visualDie(), false);
      clack(0.1);
    }, 75);

    try {
      await wait(reducedMotion ? 120 : 760);
      window.clearInterval(ticker);
      ticker = null;
      diceEls.forEach((die) => die.classList.remove('rolling'));
      if (token !== gameToken) return;

      const first = randomDie();
      const second = randomDie();
      const steps = first + second;
      lastRoll = { first, second, total: steps };
      setDice(first, second, true);
      clack(0.9);

      const player = players[activePlayer];
      addLog(`${player.name} rolled ${first} + ${second} = ${steps}.`);
      phase = 'moving';
      renderControls();
      await moveActivePlayer(steps);
      if (token !== gameToken) return;

      phase = 'resolving';
      renderControls();
      await resolveLanding(player, steps);
      if (token !== gameToken || gameOver) return;

      finishTurn();
    } finally {
      if (ticker) window.clearInterval(ticker);
      diceEls.forEach((die) => die.classList.remove('rolling'));
      rolling = false;
      if (token === gameToken) renderControls();
    }
  }

  function resetGame() {
    gameToken += 1;
    settleDecision('reset');
    players = makePlayers(setup.players);
    ownerBySquare = Array(SQUARES.length).fill(null);
    activePlayer = randomInt(players.length);
    selectedSquare = 0;
    turn = 1;
    phase = 'idle';
    gameOver = false;
    rolling = false;
    pendingBuy = null;
    pendingDebt = null;
    lastRoll = null;
    finalScores = [];
    winnerText = '';
    logCount = 0;
    gameLog.replaceChildren();
    setDice(1, 1, false);
    diceTotal.textContent = '—';
    winnerPanel.hidden = true;
    actionSection.hidden = true;
    addLog(`App bank dealt ${money(RULES.startingCash)} to each of ${players.length} players.`);
    addLog(`${players[activePlayer].name} was chosen randomly for the first turn.`);
    addLog('Complete one lap before buying. Exact Start landing pays ₹250; doubles have no special effect.');
    renderAll();
  }

  function setPlayerCount(count) {
    if (rolling || gameOver || phase !== 'idle' || count === players.length) return;
    setup.players = count;
    saveSetup();
    resetGame();
    addLog(`${count} players are ready at Collect Salary.`);
    renderAll();
  }

  let zoomIndex = 2;
  const zoomSteps = [1, 1.4, 1.8, 2.2, 2.6];

  function applyZoom() {
    const zoom = zoomSteps[zoomIndex];
    $('zoomImage').style.width = `${Math.round(900 * zoom)}px`;
    $('zoomLevel').textContent = `${Math.round(zoom * 100)}%`;
    $('zoomOut').disabled = zoomIndex === 0;
    $('zoomIn').disabled = zoomIndex === zoomSteps.length - 1;
  }

  function bindEvents() {
    rollButton.addEventListener('click', rollDice);
    resetButton.addEventListener('click', resetGame);

    actionBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button || button.disabled) return;
      const action = button.dataset.action;
      if (action === 'buy' || action === 'leave') settleDecision(action);
      else if (action === 'settleDebt') {
        if (settlePendingDebt()) renderAll();
      } else if (action === 'sellAll') sellAllAndSettle();
    });

    deedActions.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-deed-action]');
      if (!button || button.disabled) return;
      handleDeedAction(button.dataset.deedAction, Number(button.dataset.index));
    });

    $('soundButton').addEventListener('click', (event) => {
      soundOn = !soundOn;
      event.currentTarget.setAttribute('aria-pressed', String(soundOn));
      event.currentTarget.textContent = `♫ Clack: ${soundOn ? 'on' : 'off'}`;
      if (soundOn) clack(0.6);
    });

    const inviteButton = $('inviteButton');
    if (inviteButton) {
      inviteButton.addEventListener('click', async () => {
        const copied = await copyText(inviteUrl());
        inviteButton.textContent = copied ? 'Invite copied!' : 'Copy failed';
        window.setTimeout(() => { inviteButton.textContent = 'Copy invite link'; }, 1700);
      });
    }

    $('routeToggle').addEventListener('change', (event) => {
      board.classList.toggle('show-route', event.currentTarget.checked);
    });

    document.querySelectorAll('[data-count]').forEach((button) => {
      button.addEventListener('click', () => setPlayerCount(Number(button.dataset.count)));
    });

    $('rulesButton').addEventListener('click', () => $('rulesDialog').showModal());
    $('zoomButton').addEventListener('click', () => {
      $('zoomDialog').showModal();
      applyZoom();
      requestAnimationFrame(() => {
        const viewport = $('zoomViewport');
        const image = $('zoomImage');
        viewport.scrollLeft = Math.max(0, (image.clientWidth - viewport.clientWidth) / 2);
      });
    });

    document.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', () => $(button.dataset.close).close());
    });

    [$('rulesDialog'), $('zoomDialog')].forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
    });

    $('zoomIn').addEventListener('click', () => {
      zoomIndex = Math.min(zoomIndex + 1, zoomSteps.length - 1);
      applyZoom();
    });
    $('zoomOut').addEventListener('click', () => {
      zoomIndex = Math.max(zoomIndex - 1, 0);
      applyZoom();
    });

    document.addEventListener('keydown', (event) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName);
      const dialogOpen = Boolean(document.querySelector('dialog[open]'));
      if (event.code === 'Space' && !event.repeat && !typing && !dialogOpen) {
        event.preventDefault();
        rollDice();
      }
    });
  }

  createDice();
  createSquares();
  bindEvents();
  resetGame();
})();
