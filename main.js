// ============================================================
//  MAIN.JS — navigasi, particles, render halaman
// ============================================================

// ==================== PARTICLES ====================
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = initial ? Math.random() * canvas.height : Math.random() * 20;
      this.size  = Math.random() * 1.8 + 0.4;
      this.vx    = (Math.random() - 0.5) * 0.35;
      this.vy    = Math.random() * 0.25 + 0.08;
      this.life  = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.type  = Math.random() > 0.85 ? 'accent' : 'text';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y > canvas.height + 10) this.reset();
    }
    draw() {
      const t      = this.life / this.maxLife;
      const alpha  = Math.sin(t * Math.PI) * (this.type === 'accent' ? 0.6 : 0.25);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF4655';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.type === 'accent'
        ? accent.replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(')
        : `rgba(236,232,225,${alpha})`;
      // fallback hex to rgba
      if (this.type === 'accent') {
        ctx.fillStyle = hexToRgba(accent, alpha);
      } else {
        const c = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
        ctx.fillStyle = hexToRgba(c || '#ECE8E1', alpha);
      }
      ctx.fill();
    }
  }

  function hexToRgba(hex, alpha) {
    hex = hex.trim().replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  for (let i = 0; i < 140; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ==================== LOGIN ====================
function doLogin() {
  const u   = document.getElementById('login-user').value.trim();
  const p   = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');

  if (u === 'admin' && p === '123') {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
  } else {
    err.style.display = 'block';
    document.getElementById('login-user').classList.add('input-error');
    document.getElementById('login-pass').classList.add('input-error');
    setTimeout(() => {
      document.getElementById('login-user').classList.remove('input-error');
      document.getElementById('login-pass').classList.remove('input-error');
    }, 800);
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-page').style.display !== 'none') doLogin();
});

function doLogout() {
  TG.stop();
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('login-page').classList.add('active');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').style.display = 'none';
}

// ==================== APP INIT ====================
function initApp() {
  renderThemeButtons();
  renderSkills();
  renderRanking();
  TG.init();
  showPage('home', document.querySelector('.nav-link'));
  newQuote();
}

// ==================== NAVIGATION ====================
const PAGES = ['home', 'skills', 'minigame', 'ranking', 'profile'];

function showPage(name, btn) {
  PAGES.forEach(id => {
    const el = document.getElementById(id + '-page');
    if (el) el.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(name + '-page');
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);

  // page-specific
  setTimeout(() => {
    animateReveal();
    if (name === 'skills') animateBars();
    if (name === 'minigame') TG.init();
    if (name === 'ranking') animateReveal();
  }, 60);
}

// ==================== REVEAL ====================
function animateReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 70);
  });
}

// reset reveals when leaving page
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.remove('visible'));
  });
});

// ==================== QUOTES ====================
let lastQIdx = -1;
function newQuote() {
  let idx;
  do { idx = Math.floor(Math.random() * QUOTES.length); } while (idx === lastQIdx);
  lastQIdx = idx;
  const q = QUOTES[idx];
  const box = document.getElementById('quote-box');
  if (!box) return;
  box.style.animation = 'none';
  void box.offsetWidth;
  box.style.animation = 'quoteIn 0.5s cubic-bezier(.4,0,.2,1) forwards';
  document.getElementById('quote-text').textContent   = '\u201C' + q.text + '\u201D';
  document.getElementById('quote-author').textContent = '\u2014 ' + q.author;
}

// ==================== SKILLS RENDER ====================
function renderSkills() {
  renderSkillSection('skills-frontend', SKILLS_FRONTEND);
  renderSkillSection('skills-backend', SKILLS_BACKEND);
}

function renderSkillSection(containerId, skills) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  skills.forEach(s => {
    c.innerHTML += `
    <div class="skill-card reveal">
      <div class="skill-header">
        <span class="skill-name">${s.name}</span>
        <span class="skill-pct">${s.pct}%</span>
      </div>
      <div class="skill-desc">${s.desc}</div>
      <div class="skill-bar"><div class="skill-fill" data-pct="${s.pct}"></div></div>
    </div>`;
  });
}

function animateBars() {
  document.querySelectorAll('.skill-fill').forEach(bar => {
    bar.style.width = '0';
    setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 150);
  });
}

// ==================== RANKING RENDER ====================
function renderRanking() {
  const grid = document.getElementById('ranking-grid');
  if (!grid) return;
  grid.innerHTML = '';
  RANKING_DATA.forEach(d => {
    const medal = d.rank === 1 ? '🥇' : d.rank === 2 ? '🥈' : d.rank === 3 ? '🥉' : `#${d.rank}`;
    const cls   = d.rank <= 3 ? `top${d.rank}` : '';
    const growthColor = d.growth.startsWith('+') ? 'var(--accent)' : '#e74c3c';
    grid.innerHTML += `
    <div class="rank-card ${cls} reveal">
      <div class="rank-medal">${medal}</div>
      <div class="rank-flag">${d.flag}</div>
      <div class="rank-country">${d.country}</div>
      <div class="rank-gdp">$${d.gdp}T <span class="rank-growth" style="color:${growthColor}">${d.growth}</span></div>
      <div class="rank-pop">👥 ${d.pop}</div>
      <div class="rank-note">${d.note}</div>
    </div>`;
  });
}
