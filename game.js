/* Vyapari — faithful board map + two-dice movement.
   Coordinates are measured directly on the supplied 2672 × 2705 scan. */
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
    club: 'CLUB'
  };

  const DEFAULT_NOTES = {
    start: 'Place the buttons here. Follow the yellow arrow up the right edge of the board.',
    republic: 'A golden Republic square. Its numbered card effects are printed in the two centre rule panels.',
    property: 'An original city deed with the old sunburst artwork and bilingual place name.',
    tax: 'A printed tax square. The exact payment rule belongs to the next gameplay pass.',
    chance: 'Draw from the Chance / সুযোগ / मौका instructions printed in the centre of the board.',
    jail: 'The dark Jail corner, with its diagonal lettering preserved from the scan.',
    transport: 'One of the old illustrated transport holdings.',
    utility: 'A service or public-building square from the original route.',
    corner: 'One of the four large photographic corner squares.',
    club: 'Merchants Club — the illustrated corner before the bottom row.'
  };

  const SQUARES = [
    { name: 'Collect Salary', kind: 'start', price: '₹250', local: 'শুরু / प्रारंभ', note: 'Start here. The blue corner reads “COLLECT SALARY 250” and the yellow arrow points upward.' },
    { name: 'Republic', kind: 'republic', price: '—', local: 'গণতন্ত্রাষ্ট্র / गणराज्य' },
    { name: 'Delhi', kind: 'property', price: '₹4,500', local: 'দিল্লী / दिल्ली' },
    { name: 'Agra', kind: 'property', price: '₹1,500', local: 'আগ্রা / आगरा' },
    { name: 'Jaipur', kind: 'property', price: '₹2,200', local: 'জয়পুর / जयपुर' },
    { name: 'Income Tax', kind: 'tax', price: '₹2,000', local: 'আয়কর / आयकर' },
    { name: 'Jalandhar', kind: 'property', price: '₹1,000', local: 'জলন্ধর / जलंधर' },
    { name: 'Chance', kind: 'chance', price: '—', local: 'সুযোগ / मौका' },
    { name: 'Durgapur', kind: 'property', price: '₹1,000', local: 'দুর্গাপুর / दुर्गापुर' },
    { name: 'Jail', kind: 'jail', price: '—', local: 'কারাগার / कारागार', note: 'The old black-and-white Jail corner. Its exact effect will follow the printed rules.' },
    { name: 'Dehradun', kind: 'property', price: '₹2,300', local: 'দেহরাদুন / देहरादून' },
    { name: 'Srinagar (Kashmir)', kind: 'property', price: '₹2,700', local: 'শ্রীনগর / श्रीनगर' },
    { name: 'Steamer Co. (Cochin)', kind: 'transport', price: '₹7,000', local: 'স্টীমার / स्टीमर' },
    { name: 'Cochin Steamer Co.', kind: 'transport', price: '₹1,500', local: 'কোচিন / कोचीन' },
    { name: 'Post Office', kind: 'utility', price: '₹2,000', local: 'ডাকঘর / डाकघर' },
    { name: 'Hyderabad', kind: 'property', price: '₹2,500', local: 'হায়দ্রাবাদ / हैदराबाद' },
    { name: 'Chennai', kind: 'property', price: '₹4,000', local: 'চেন্নাই / चेन्नई' },
    { name: 'Tatanagar', kind: 'property', price: '₹3,500', local: 'টাটানগর / टाटानगर' },
    { name: 'Rest House corner', kind: 'corner', price: '—', local: 'বিশ্রাম / विश्राम', note: 'The faded photographic rest corner, kept exactly as it appears on the folded board.' },
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
  const gameLog = $('gameLog');
  const playerList = $('playerList');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let players = PLAYER_PRESETS.slice(0, 2).map((preset, i) => ({ ...preset, id: i, position: 0, laps: 0 }));
  let activePlayer = 0;
  let selectedSquare = 0;
  let turn = 1;
  let rolling = false;
  let soundOn = true;
  let logCount = 0;
  let audioContext = null;
  const squareEls = [];

  const pad = (n) => String(n).padStart(2, '0');
  const pct = (value, total) => `${(value / total) * 100}%`;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function randomDie() {
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return (value[0] % 6) + 1;
    }
    return Math.floor(Math.random() * 6) + 1;
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
    });
  }

  function updateSquareHighlights() {
    squareEls.forEach((element, index) => {
      element.classList.toggle('active', players[activePlayer].position === index);
      element.classList.toggle('selected', selectedSquare === index);
    });
  }

  function showSquareCard(index) {
    const square = SQUARES[index];
    $('squareIndex').textContent = `${pad(index + 1)} / 36`;
    $('squareKind').textContent = KIND_LABEL[square.kind];
    $('squareName').textContent = square.name;
    $('squareNote').textContent = square.note || DEFAULT_NOTES[square.kind];
    $('squarePrice').textContent = square.price;
  }

  function renderCurrentPlayer() {
    const player = players[activePlayer];
    $('currentSwatch').style.setProperty('--current-color', player.color);
    $('currentPlayerName').textContent = player.name;
    $('currentPlayerPosition').textContent = `${SQUARES[player.position].name} · space ${pad(player.position + 1)}`;
    $('turnCounter').textContent = `Turn ${turn}`;
  }

  function renderPlayerList() {
    playerList.replaceChildren();
    players.forEach((player, index) => {
      const card = document.createElement('div');
      card.className = `player-card${index === activePlayer ? ' active' : ''}`;
      card.style.setProperty('--player-color', player.color);
      card.innerHTML = `
        <span class="swatch" aria-hidden="true"></span>
        <strong>${player.name}</strong>
        <span class="pos">${pad(player.position + 1)} · ${SQUARES[player.position].name}</span>
      `;
      playerList.append(card);
    });
  }

  function renderAll() {
    renderCurrentPlayer();
    renderPlayerList();
    updateSquareHighlights();
    updateTokenPositions();
    showSquareCard(selectedSquare);
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
    while (gameLog.children.length > 32) gameLog.lastElementChild.remove();
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

  async function moveActivePlayer(steps) {
    const player = players[activePlayer];
    for (let step = 0; step < steps; step += 1) {
      const next = (player.position + 1) % SQUARES.length;
      if (next === 0) {
        player.laps += 1;
        addLog(`${player.name} passed Collect Salary — collect the printed ₹250.`);
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
    if (rolling) return;
    rolling = true;
    rollButton.disabled = true;
    diceTotal.textContent = '…';
    diceEls.forEach((die) => die.classList.add('rolling'));
    clack(0.45);

    const ticker = window.setInterval(() => {
      setDice(randomDie(), randomDie(), false);
      clack(0.1);
    }, 75);
    await wait(reducedMotion ? 120 : 760);
    window.clearInterval(ticker);
    diceEls.forEach((die) => die.classList.remove('rolling'));

    const first = randomDie();
    const second = randomDie();
    const steps = first + second;
    setDice(first, second, true);
    clack(0.9);

    const player = players[activePlayer];
    addLog(`${player.name} rolled ${first} + ${second} = ${steps}.`);
    await moveActivePlayer(steps);
    addLog(`${player.name} landed on ${SQUARES[player.position].name} (space ${pad(player.position + 1)}).`);

    activePlayer = (activePlayer + 1) % players.length;
    if (activePlayer === 0) turn += 1;
    renderAll();

    rolling = false;
    rollButton.disabled = false;
  }

  function resetGame() {
    if (rolling) return;
    players.forEach((player) => {
      player.position = 0;
      player.laps = 0;
    });
    activePlayer = 0;
    selectedSquare = 0;
    turn = 1;
    logCount = 0;
    gameLog.replaceChildren();
    setDice(1, 1, false);
    diceTotal.textContent = '—';
    addLog('Both buttons are on Collect Salary. Roll two dice to begin.');
    renderAll();
  }

  function setPlayerCount(count) {
    if (rolling || count === players.length) return;
    while (players.length < count) {
      const index = players.length;
      players.push({ ...PLAYER_PRESETS[index], id: index, position: 0, laps: 0 });
    }
    players = players.slice(0, count);
    if (activePlayer >= players.length) activePlayer = 0;
    document.querySelectorAll('[data-count]').forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.count) === count);
    });
    renderAll();
    addLog(`${count} players are ready at Collect Salary.`);
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
    $('resetButton').addEventListener('click', resetGame);

    $('soundButton').addEventListener('click', (event) => {
      soundOn = !soundOn;
      event.currentTarget.setAttribute('aria-pressed', String(soundOn));
      event.currentTarget.textContent = `♫ Clack: ${soundOn ? 'on' : 'off'}`;
      if (soundOn) clack(0.6);
    });

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
