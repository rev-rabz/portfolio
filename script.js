const yearEl = document.getElementById('year');
const themeToggle = document.getElementById('theme-toggle');
const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
const root = document.documentElement;

if (yearEl) yearEl.textContent = new Date().getFullYear();

const savedTheme = window.localStorage ? localStorage.getItem('portfolio-theme') : null;
const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
root.dataset.theme = preferredTheme;

function updateThemeButton() {
  if (!themeToggle) return;
  const isLight = root.dataset.theme === 'light';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  const icon = themeToggle.querySelector('.theme-icon');
  if (icon) icon.textContent = isLight ? '☼' : '◐';
}

updateThemeButton();

themeToggle?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  if (window.localStorage) localStorage.setItem('portfolio-theme', root.dataset.theme);
  updateThemeButton();
});

menuToggle?.addEventListener('click', () => {
  const open = siteNav?.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open menu');
  });
});

const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Interactive spiderweb/network background.
const canvas = document.getElementById('network-canvas');
const ctx = canvas?.getContext('2d');
let nodes = [];
let pointer = { x: -1000, y: -1000 };

function setupNetwork() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = window.innerWidth < 700 ? 34 : 62;
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.82,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.6 + 0.7
  }));
}

function drawNetwork() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const isLight = root.dataset.theme === 'light';
  const lineAlpha = isLight ? 0.11 : 0.16;
  const nodeAlpha = isLight ? 0.24 : 0.38;
  const accent = isLight ? '23, 92, 211' : '138, 180, 255';
  const maxDistance = window.innerWidth < 700 ? 105 : 145;

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < -20 || node.x > window.innerWidth + 20) node.vx *= -1;
    if (node.y < -20 || node.y > window.innerHeight * 0.86) node.vy *= -1;
    const dx = pointer.x - node.x;
    const dy = pointer.y - node.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 130 && distance > 0) {
      node.x -= (dx / distance) * 0.08;
      node.y -= (dy / distance) * 0.08;
    }
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < maxDistance) {
        const alpha = (1 - distance / maxDistance) * lineAlpha;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${accent}, ${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  }

  nodes.forEach((node) => {
    const distance = Math.hypot(pointer.x - node.x, pointer.y - node.y);
    const glow = distance < 150 ? 0.28 : 0;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r + glow, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accent}, ${nodeAlpha + glow})`;
    ctx.fill();
  });
  requestAnimationFrame(drawNetwork);
}

if (canvas && ctx && !reduceMotion) {
  setupNetwork();
  drawNetwork();
  window.addEventListener('resize', setupNetwork);
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });
}
