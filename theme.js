// ============================================================
//  THEME.JS — sistem 4 tema warna
// ============================================================

const THEMES = {
  valorant: {
    name: "Valorant Red",
    icon: "🔴",
    vars: {
      "--accent":       "#FF4655",
      "--accent2":      "#bd3444",
      "--accent-glow":  "rgba(255,70,85,0.35)",
      "--accent-dim":   "rgba(255,70,85,0.08)",
      "--accent-mid":   "rgba(255,70,85,0.18)",
      "--bg":           "#0F1923",
      "--bg2":          "#13202e",
      "--bg3":          "#1a2535",
      "--text":         "#ECE8E1",
      "--text-muted":   "#768079",
      "--grad-hero":    "linear-gradient(135deg,#0f1923 0%,#1a0810 50%,#0f1923 100%)",
    }
  },
  cyber: {
    name: "Cyber Blue",
    icon: "🔵",
    vars: {
      "--accent":       "#00D4FF",
      "--accent2":      "#0099cc",
      "--accent-glow":  "rgba(0,212,255,0.35)",
      "--accent-dim":   "rgba(0,212,255,0.08)",
      "--accent-mid":   "rgba(0,212,255,0.18)",
      "--bg":           "#080f1a",
      "--bg2":          "#0d1825",
      "--bg3":          "#101f30",
      "--text":         "#d0eeff",
      "--text-muted":   "#5a7a8a",
      "--grad-hero":    "linear-gradient(135deg,#080f1a 0%,#0a1520 50%,#080f1a 100%)",
    }
  },
  toxic: {
    name: "Toxic Green",
    icon: "🟢",
    vars: {
      "--accent":       "#39FF14",
      "--accent2":      "#2acc0f",
      "--accent-glow":  "rgba(57,255,20,0.35)",
      "--accent-dim":   "rgba(57,255,20,0.07)",
      "--accent-mid":   "rgba(57,255,20,0.15)",
      "--bg":           "#080f08",
      "--bg2":          "#0c150c",
      "--bg3":          "#111a11",
      "--text":         "#d8ffd8",
      "--text-muted":   "#5a7a5a",
      "--grad-hero":    "linear-gradient(135deg,#080f08 0%,#0a150a 50%,#080f08 100%)",
    }
  },
  royal: {
    name: "Royal Purple",
    icon: "🟣",
    vars: {
      "--accent":       "#B44FFF",
      "--accent2":      "#8833cc",
      "--accent-glow":  "rgba(180,79,255,0.35)",
      "--accent-dim":   "rgba(180,79,255,0.08)",
      "--accent-mid":   "rgba(180,79,255,0.18)",
      "--bg":           "#0d0812",
      "--bg2":          "#130e1a",
      "--bg3":          "#1a1225",
      "--text":         "#eedeff",
      "--text-muted":   "#7a5a8a",
      "--grad-hero":    "linear-gradient(135deg,#0d0812 0%,#150a20 50%,#0d0812 100%)",
    }
  }
};

let currentTheme = 'valorant';

function applyTheme(key) {
  const theme = THEMES[key];
  if (!theme) return;
  currentTheme = key;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // update active state pada tombol tema
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === key);
  });
  localStorage.setItem('rf-theme', key);
}

function initTheme() {
  const saved = localStorage.getItem('rf-theme') || 'valorant';
  applyTheme(saved);
}

function renderThemeButtons() {
  const container = document.getElementById('theme-switcher');
  if (!container) return;
  container.innerHTML = '';
  Object.entries(THEMES).forEach(([key, t]) => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.dataset.theme = key;
    btn.title = t.name;
    btn.innerHTML = `<span class="theme-dot"></span><span class="theme-name">${t.name}</span>`;
    btn.onclick = () => applyTheme(key);
    container.appendChild(btn);
  });
  // set active
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === currentTheme);
  });
}
