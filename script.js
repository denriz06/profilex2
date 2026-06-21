// ==================== PARTICLES ====================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.7 ? '255,70,85' : '236,232,225';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ==================== LOGIN ====================
function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');
  if (u === 'admin' && p === '123') {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    showPage('home', document.querySelector('.nav-link'));
    newQuote();
    setTimeout(() => { animateReveal(); animateSkillBars(); }, 100);
  } else {
    err.style.display = 'block';
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').style.display = 'none';
}

// ==================== PAGE NAVIGATION ====================
const pageMap = {
  'home': 'home-page',
  'skills': 'skills-page',
  'minigame': 'minigame-page',
  'ranking': 'ranking-page',
  'profile': 'profile-page'
};

function showPage(name, btn) {
  Object.values(pageMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(pageMap[name]);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
  setTimeout(() => {
    animateReveal();
    if (name === 'skills') animateSkillBars();
  }, 80);
}

// ==================== REVEAL ANIMATION ====================
function animateReveal() {
  document.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => { el.classList.add('visible'); }, i * 80);
  });
}

// ==================== SKILL BARS ====================
function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(bar => {
    bar.style.width = '0';
    setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 200);
  });
}

// ==================== QUOTES ====================
const quotes = [
  { text: "The purpose of art is washing the dust of daily life off our souls.", author: "Pablo Picasso" },
  { text: "Entertainment is not just fun — it's the mirror of civilization.", author: "Unknown" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Games give you a chance to excel, and if you're playing in good company you don't even mind if you lose.", author: "Gary Gygax" },
  { text: "Music gives a soul to the universe, wings to the mind, flight to the imagination.", author: "Plato" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Life is too short for bad movies and bad code.", author: "Unknown" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
];
let lastQ = -1;

function newQuote() {
  let idx;
  do { idx = Math.floor(Math.random() * quotes.length); } while (idx === lastQ);
  lastQ = idx;
  const q = quotes[idx];
  const box = document.getElementById('quote-block');
  box.style.animation = 'none';
  requestAnimationFrame(() => { box.style.animation = 'fadein 0.5s ease'; });
  document.getElementById('quote-text').textContent = '"' + q.text + '"';
  document.getElementById('quote-author').textContent = '— ' + q.author;
}

// ==================== RANKING DATA ====================
const rankData = [
  { rank: 1, country: '🇺🇸 Amerika Serikat', gdp: '28.78', pop: '335 juta', note: 'Negara dengan ekonomi terbesar dunia. Pusat teknologi & keuangan global.' },
  { rank: 2, country: '🇨🇳 China', gdp: '18.53', pop: '1.4 miliar', note: 'Ekonomi terbesar kedua. Pertumbuhan manufaktur dan teknologi pesat.' },
  { rank: 3, country: '🇩🇪 Jerman', gdp: '4.59', pop: '84 juta', note: 'Ekonomi terbesar Eropa. Kekuatan ekspor otomotif & industri.' },
  { rank: 4, country: '🇯🇵 Jepang', gdp: '4.11', pop: '125 juta', note: 'Inovasi teknologi dan industri otomotif dunia.' },
  { rank: 5, country: '🇮🇳 India', gdp: '3.94', pop: '1.44 miliar', note: 'Ekonomi berkembang tercepat. Hub IT global yang terus naik.' },
  { rank: 6, country: '🇬🇧 Inggris', gdp: '3.34', pop: '67 juta', note: 'Pusat keuangan global. London sebagai kota finansial utama.' },
  { rank: 7, country: '🇫🇷 Prancis', gdp: '3.13', pop: '68 juta', note: 'Ekonomi besar Eropa. Industri mewah dan pariwisata.' },
  { rank: 8, country: '🇮🇹 Italia', gdp: '2.33', pop: '59 juta', note: 'Kekuatan mode, desain, dan industri manufaktur.' },
  { rank: 9, country: '🇧🇷 Brasil', gdp: '2.33', pop: '215 juta', note: 'Ekonomi terbesar Amerika Latin. Kaya sumber daya alam.' },
  { rank: 10, country: '🇨🇦 Kanada', gdp: '2.24', pop: '40 juta', note: 'Sumber daya alam melimpah dan ekonomi stabil.' },
];

function renderRanking() {
  const grid = document.getElementById('ranking-grid');
  grid.innerHTML = '';
  rankData.forEach(d => {
    const cls = d.rank === 1 ? 'top1' : d.rank === 2 ? 'top2' : d.rank === 3 ? 'top3' : '';
    const badgeText = d.rank === 1 ? '🥇 #1 TERBESAR' : d.rank === 2 ? '🥈 #2 DUNIA' : d.rank === 3 ? '🥉 #3 DUNIA' : `#${d.rank} DUNIA`;
    grid.innerHTML += `
      <div class="rank-card ${cls} reveal">
        <div class="rank-num">${d.rank}</div>
        <div class="rank-badge">${badgeText}</div>
        <div class="rank-country">${d.country}</div>
        <div class="rank-gdp">$${d.gdp}T</div>
        <div class="rank-meta">Populasi: ${d.pop}<br>${d.note}</div>
      </div>`;
  });
}

// ==================== TYPE GAME ====================
const wordList = [
  'javascript','python','htmlcss','nodejs','coding','developer',
  'frontend','backend','fullstack','website','database','server',
  'array','function','object','string','boolean','integer',
  'module','export','import','async','await','promise',
  'console','variable','wikrama','bogor','fariz','raden',
  'attila','portfolio','browser','network','client','design',
  'logic','debug','syntax','runtime'
];

let gameRunning = false, score = 0, lives = 3, level = 1, combo = 1;
let fallingWords = [], gameLoop = null, spawnInterval = null;

function startGame() {
  document.getElementById('game-over-screen').classList.remove('show');
  document.getElementById('falling-words').innerHTML = '';
  document.getElementById('type-input').value = '';
  document.getElementById('type-input').disabled = false;
  document.getElementById('type-input').focus();
  score = 0; lives = 3; level = 1; combo = 1; fallingWords = [];
  clearInterval(gameLoop);
  clearInterval(spawnInterval);
  updateGameUI();
  gameRunning = true;
  spawnInterval = setInterval(spawnWord, 2200);
  gameLoop = setInterval(updateWords, 40);
}

function spawnWord() {
  if (!gameRunning) return;
  const fw = document.getElementById('falling-words');
  const word = wordList[Math.floor(Math.random() * wordList.length)];
  const id = 'w' + Date.now() + Math.random().toString(36).slice(2, 5);
  const x = Math.random() * (fw.clientWidth - 120);
  const el = document.createElement('div');
  el.className = 'falling-word';
  el.id = id;
  el.textContent = word;
  el.style.left = x + 'px';
  el.style.top = '0px';
  fw.appendChild(el);
  fallingWords.push({ id, word, y: 0, speed: 0.9 + (level * 0.2), el });
}

function updateWords() {
  if (!gameRunning) return;
  const fw = document.getElementById('falling-words');
  const maxH = fw.clientHeight - 30;
  fallingWords = fallingWords.filter(w => {
    w.y += w.speed;
    w.el.style.top = w.y + 'px';
    if (w.y >= maxH) {
      w.el.remove();
      lives--;
      combo = 1;
      updateGameUI();
      if (lives <= 0) { endGame(); return false; }
      return false;
    }
    return true;
  });
}

function checkWord() {
  if (!gameRunning) return;
  const inp = document.getElementById('type-input');
  const typed = inp.value.toLowerCase().trim();
  document.querySelectorAll('.falling-word').forEach(el => {
    if (el.textContent.startsWith(typed) && typed.length > 0) {
      el.classList.add('matched-partial');
    } else {
      el.classList.remove('matched-partial');
    }
  });
  const match = fallingWords.find(w => w.word === typed);
  if (match) {
    score += match.word.length * 10 * combo;
    combo++;
    if (score > level * 200) level++;
    match.el.classList.add('matched-full');
    setTimeout(() => { match.el.remove(); }, 300);
    fallingWords = fallingWords.filter(w => w.id !== match.id);
    inp.value = '';
    updateGameUI();
  }
}

function updateGameUI() {
  document.getElementById('g-score').textContent = score;
  document.getElementById('g-lives').textContent = '♥ '.repeat(lives).trim() || '💀';
  document.getElementById('g-level').textContent = level;
  document.getElementById('g-combo').textContent = 'x' + combo;
}

function endGame() {
  gameRunning = false;
  clearInterval(gameLoop);
  clearInterval(spawnInterval);
  document.getElementById('type-input').disabled = true;
  document.getElementById('final-score-text').textContent = 'Score Akhir: ' + score + ' | Level: ' + level;
  document.getElementById('game-over-screen').classList.add('show');
}

// ==================== INIT ====================
renderRanking();
newQuote();
