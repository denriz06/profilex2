// ============================================================
//  GAME.JS — Type Game engine (ZType-style)
// ============================================================

const TG = (() => {
  // --- State ---
  let state = {
    running: false,
    score: 0,
    lives: 3,
    level: 1,
    combo: 1,
    comboTimer: null,
    words: [],        // { id, text, x, y, speed, el, typed }
    spawnTimer: null,
    rafId: null,
    lastTime: 0,
    targetWord: null, // currently focused word
  };

  // --- DOM refs (set on init) ---
  let DOM = {};

  // --- Canvas for laser beam ---
  let laserCanvas, laserCtx;

  function init() {
    DOM = {
      arena:      document.getElementById('game-arena'),
      input:      document.getElementById('game-input'),
      startBtn:   document.getElementById('game-start-btn'),
      scoreEl:    document.getElementById('gs-score'),
      livesEl:    document.getElementById('gs-lives'),
      levelEl:    document.getElementById('gs-level'),
      comboEl:    document.getElementById('gs-combo'),
      overScreen: document.getElementById('game-over-screen'),
      finalScore: document.getElementById('game-final-score'),
      finalLevel: document.getElementById('game-final-level'),
    };

    // laser canvas overlay
    laserCanvas = document.getElementById('game-laser');
    if (laserCanvas) {
      laserCtx = laserCanvas.getContext('2d');
    }

    if (DOM.input) {
      DOM.input.addEventListener('input', onInput);
      DOM.input.addEventListener('keydown', e => {
        if (e.key === 'Enter') onInput();
      });
    }
  }

  function resizeLaser() {
    if (!laserCanvas || !DOM.arena) return;
    laserCanvas.width  = DOM.arena.clientWidth;
    laserCanvas.height = DOM.arena.clientHeight;
  }

  // --- Start / Restart ---
  function start() {
    stop();
    Object.assign(state, {
      running: true, score: 0, lives: 3, level: 1, combo: 1,
      words: [], targetWord: null,
    });
    DOM.arena.innerHTML = '';
    DOM.arena.appendChild(laserCanvas);
    DOM.input.value = '';
    DOM.input.disabled = false;
    DOM.input.focus();
    DOM.overScreen.classList.remove('show');
    updateHUD();
    resizeLaser();
    scheduleSpawn();
    state.lastTime = performance.now();
    state.rafId = requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    clearTimeout(state.spawnTimer);
    cancelAnimationFrame(state.rafId);
    if (state.comboTimer) clearTimeout(state.comboTimer);
  }

  // --- Game loop (rAF) ---
  function loop(now) {
    if (!state.running) return;
    const dt = Math.min(now - state.lastTime, 50); // cap at 50ms
    state.lastTime = now;

    moveWords(dt);
    drawLasers();
    state.rafId = requestAnimationFrame(loop);
  }

  // --- Spawn ---
  function scheduleSpawn() {
    if (!state.running) return;
    // interval gets shorter as level increases
    const base = Math.max(1400, 2800 - (state.level - 1) * 200);
    const jitter = Math.random() * 600;
    state.spawnTimer = setTimeout(() => {
      spawnWord();
      scheduleSpawn();
    }, base + jitter);
  }

  function spawnWord() {
    if (!state.running) return;
    const arena = DOM.arena;
    const aw = arena.clientWidth  || 600;

    const pool = WORD_LIST.filter(w => !state.words.find(sw => sw.text === w));
    const text = pool[Math.floor(Math.random() * pool.length)] || WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    const el = document.createElement('div');
    el.className = 'gword';
    arena.appendChild(el);

    const wordW = Math.max(text.length * 14, 80);
    const x = Math.random() * Math.max(10, aw - wordW - 20) + 10;
    const speed = 0.025 + (state.level - 1) * 0.006 + Math.random() * 0.01; // % per ms

    const w = { id: Date.now() + Math.random(), text, x, y: 0, speed, el, typed: '' };
    state.words.push(w);
    renderWord(w);
    el.style.left = x + 'px';
    el.style.top  = '0px';
  }

  // --- Move words ---
  function moveWords(dt) {
    const ah = DOM.arena.clientHeight || 400;
    state.words = state.words.filter(w => {
      w.y += w.speed * dt;
      w.el.style.top = (w.y / 100 * ah) + 'px';

      if (w.y >= 98) {
        // reached bottom
        hitBottom(w);
        return false;
      }
      return true;
    });
  }

  function hitBottom(w) {
    flashArena('danger');
    w.el.remove();
    if (w === state.targetWord) state.targetWord = null;
    state.lives--;
    state.combo = 1;
    if (state.comboTimer) clearTimeout(state.comboTimer);
    updateHUD();
    if (state.lives <= 0) gameOver();
  }

  // --- Input ---
  function onInput() {
    if (!state.running) return;
    const typed = DOM.input.value.toLowerCase().replace(/\s/g, '');
    DOM.input.value = typed;

    // if no target, find best match
    if (!state.targetWord) {
      const match = state.words.find(w => w.text.startsWith(typed) && typed.length > 0);
      if (match) state.targetWord = match;
    }

    if (!state.targetWord) {
      // clear highlights
      state.words.forEach(w => { w.typed = ''; renderWord(w); });
      return;
    }

    const w = state.targetWord;

    if (w.text.startsWith(typed)) {
      w.typed = typed;
      renderWord(w);

      if (typed === w.text) {
        // WORD COMPLETE
        destroyWord(w);
        DOM.input.value = '';
        state.targetWord = null;
      }
    } else {
      // wrong input — reset target
      w.typed = '';
      renderWord(w);
      state.targetWord = null;
      DOM.input.value = '';
    }
  }

  function destroyWord(w) {
    // score: length × 10 × combo × level bonus
    const pts = Math.ceil(w.text.length * 10 * state.combo * (1 + (state.level - 1) * 0.1));
    state.score += pts;

    // combo
    state.combo = Math.min(state.combo + 1, 16);
    if (state.comboTimer) clearTimeout(state.comboTimer);
    state.comboTimer = setTimeout(() => { state.combo = 1; updateHUD(); }, 4000);

    // level up every 300 pts base
    const threshold = 300 + (state.level - 1) * 200;
    if (state.score >= threshold * state.level) state.level++;

    // shoot laser
    shootLaser(w);

    // remove el with animation
    w.el.classList.add('gword-destroy');
    setTimeout(() => { if (w.el.parentNode) w.el.remove(); }, 350);
    state.words = state.words.filter(x => x.id !== w.id);

    updateHUD();
    floatScore(w, pts);
    flashArena('success');
  }

  // --- Render word (highlight typed portion) ---
  function renderWord(w) {
    const typed   = w.typed || '';
    const rest    = w.text.slice(typed.length);
    const isTarget = (w === state.targetWord);
    w.el.className = 'gword' + (isTarget ? ' gword-target' : '');
    w.el.innerHTML =
      (typed ? `<span class="gw-done">${typed}</span>` : '') +
      `<span class="gw-rest">${rest}</span>`;
  }

  // --- Laser animation ---
  let laserBeams = []; // { x1,y1,x2,y2, life }

  function shootLaser(w) {
    if (!laserCanvas) return;
    const ah = DOM.arena.clientHeight || 400;
    const inputRow = document.getElementById('game-input-row');
    const iy = inputRow ? inputRow.offsetTop : ah - 40;
    const ix = DOM.arena.clientWidth / 2;
    const wy = (w.y / 100) * ah;
    const wx = w.x + (w.el.offsetWidth / 2 || 40);
    laserBeams.push({ x1: ix, y1: iy, x2: wx, y2: wy, life: 1.0 });
  }

  function drawLasers() {
    if (!laserCtx || !laserCanvas) return;
    laserCtx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);
    laserBeams = laserBeams.filter(b => b.life > 0);
    laserBeams.forEach(b => {
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF4655';
      laserCtx.save();
      laserCtx.globalAlpha = b.life;
      laserCtx.strokeStyle = accent;
      laserCtx.lineWidth = 2 * b.life;
      laserCtx.shadowColor = accent;
      laserCtx.shadowBlur = 12;
      laserCtx.beginPath();
      laserCtx.moveTo(b.x1, b.y1);
      laserCtx.lineTo(b.x2, b.y2);
      laserCtx.stroke();
      laserCtx.restore();
      b.life -= 0.08;
    });
  }

  // --- Float score popup ---
  function floatScore(w, pts) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + pts;
    popup.style.left = w.x + 'px';
    popup.style.top  = (w.y / 100 * (DOM.arena.clientHeight || 400)) + 'px';
    DOM.arena.appendChild(popup);
    setTimeout(() => popup.remove(), 900);
  }

  // --- Flash arena border ---
  function flashArena(type) {
    DOM.arena.classList.remove('flash-success', 'flash-danger');
    void DOM.arena.offsetWidth; // reflow
    DOM.arena.classList.add(type === 'success' ? 'flash-success' : 'flash-danger');
  }

  // --- HUD ---
  function updateHUD() {
    DOM.scoreEl.textContent = state.score.toLocaleString();
    DOM.livesEl.innerHTML   = '♥'.repeat(Math.max(0, state.lives)) + '<span style="opacity:.3">' + '♥'.repeat(Math.max(0, 5 - state.lives)) + '</span>';
    DOM.levelEl.textContent = state.level;
    DOM.comboEl.textContent = 'x' + state.combo;
    DOM.comboEl.style.color = state.combo >= 4 ? 'var(--accent)' : 'var(--text)';
  }

  // --- Game Over ---
  function gameOver() {
    stop();
    DOM.input.disabled = true;
    DOM.finalScore.textContent = state.score.toLocaleString();
    DOM.finalLevel.textContent = state.level;
    DOM.overScreen.classList.add('show');
  }

  // --- Public API ---
  return { init, start, stop };
})();
