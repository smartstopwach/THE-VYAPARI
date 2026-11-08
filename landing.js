/* Landing setup: mode + player count -> board.html */
(() => {
  'use strict';

  const STORAGE_KEY = 'vyapari.setup';
  const $ = (id) => document.getElementById(id);
  const form = $('setupForm');
  const roomInput = $('roomInput');
  const roomCode = $('roomCode');
  const onlineRoom = $('onlineRoom');
  const inviteLink = $('inviteLink');
  const copyInvite = $('copyInvite');
  const summary = $('setupSummary');

  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function makeRoomCode() {
    let bytes;
    if (window.crypto && window.crypto.getRandomValues) {
      bytes = new Uint8Array(6);
      window.crypto.getRandomValues(bytes);
    } else {
      bytes = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
    }
    return `VY-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
  }

  function readSavedSetup() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function saveSetup(setup) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
    } catch (_) {
      // Setup still travels in the board URL when storage is unavailable.
    }
  }

  const saved = readSavedSetup();
  const room = typeof saved.room === 'string' && /^VY-[A-Z2-9]{6}$/.test(saved.room)
    ? saved.room
    : makeRoomCode();

  function selectedMode() {
    return form.elements.mode.value;
  }

  function selectedPlayers() {
    return Number(form.elements.players.value);
  }

  function boardUrl() {
    const url = new URL('board.html', window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('mode', selectedMode());
    url.searchParams.set('players', String(selectedPlayers()));
    if (selectedMode() === 'online') url.searchParams.set('room', room);
    return url.toString();
  }

  function currentSetup() {
    return { mode: selectedMode(), players: selectedPlayers(), room };
  }

  function updateUI() {
    const mode = selectedMode();
    const count = selectedPlayers();
    const isOnline = mode === 'online';

    document.body.dataset.mode = mode;
    onlineRoom.hidden = !isOnline;
    roomInput.disabled = !isOnline;
    roomInput.value = room;
    roomCode.textContent = room;
    inviteLink.value = boardUrl();
    copyInvite.textContent = 'Copy';

    const label = isOnline
      ? `Online room ${room} · ${count} players`
      : `Offline · ${count} players`;
    const detail = isOnline
      ? 'Invite link ready · room-preview mode'
      : count === 2 ? 'One screen, two dice' : `One screen, ${count} buttons, two dice`;

    summary.querySelector('strong').textContent = label;
    summary.querySelector('small').textContent = detail;
    saveSetup(currentSetup());
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // Fall through to the selection-based fallback.
    }
    try {
      inviteLink.focus();
      inviteLink.select();
      return document.execCommand('copy');
    } catch (_) {
      return false;
    }
  }

  function applySavedSelection() {
    if (saved.mode === 'online' || saved.mode === 'offline') {
      const radio = document.getElementById(saved.mode === 'online' ? 'modeOnline' : 'modeOffline');
      if (radio) radio.checked = true;
    }
    const count = Number(saved.players);
    if ([2, 3, 4].includes(count)) {
      const radio = document.getElementById(`players${count}`);
      if (radio) radio.checked = true;
    }
  }

  form.addEventListener('change', updateUI);

  copyInvite.addEventListener('click', async () => {
    const copied = await copyText(boardUrl());
    copyInvite.textContent = copied ? 'Copied!' : 'Select & copy';
    window.setTimeout(() => { copyInvite.textContent = 'Copy'; }, 1600);
  });

  form.addEventListener('submit', () => {
    const setup = currentSetup();
    roomInput.disabled = setup.mode !== 'online';
    roomInput.value = room;
    saveSetup(setup);
  });

  applySavedSelection();
  updateUI();
})();
