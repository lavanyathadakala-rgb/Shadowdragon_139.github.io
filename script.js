/* script.js
   Vanilla JS for premium portfolio
   - Loading screen
   - Typing animation
   - Particles & mouse glow
   - Scroll reveal & intersection-based anims
   - Animated skill rings & counters
   - Copy to clipboard, back-to-top, nav highlighting
   - Performance-conscious (requestAnimationFrame, throttling)
*/

/* ------------------------- Utilities ------------------------- */
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

/* ------------------------- Loading Screen ------------------------- */
const loader = $('#loader');
window.addEventListener('load', () => {
  // short delay to show loader for perceived polish
  setTimeout(() => {
    loader.style.opacity = '0';
    loader.setAttribute('aria-hidden', 'true');
    // reveal page elements
    setTimeout(()=>loader.remove(), 400);
  }, 600);
});

/* ------------------------- Page Transition (on internal nav) ------------------------- */
const transition = $('#page-transition');
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    // allow jump if link is same location or external
    const target = a.getAttribute('href');
    if (!target.startsWith('#')) return;
    // close mobile nav if open
    closeMobileNav();
    // smooth scroll performed by CSS; animate overlay for polish
    transition.style.opacity = '1';
    setTimeout(()=> transition.style.opacity = '0', 450);
  });
});

/* ------------------------- Typing animation ------------------------- */
class TypeCycle {
  constructor(el, words = [], speed = 90, pause = 1800) {
    this.el = el;
    this.words = words;
    this.speed = speed;
    this.pause = pause;
    this.index = 0;
    this.offset = 0;
    this.forwards = true;
    this.timer = null;
    this.tick = this.tick.bind(this);
    this.start();
  }
  start(){
    if (!this.el || !this.words.length) return;
    this.timer = requestAnimationFrame(this.tick);
  }
  tick(){
    const current = this.words[this.index];
    if (this.forwards) {
      this.offset++;
      this.el.textContent = current.slice(0, this.offset);
      if (this.offset === current.length) {
        this.forwards = false;
        setTimeout(()=> this.timer = requestAnimationFrame(this.tick), this.pause);
        return;
      }
    } else {
      this.offset--;
      this.el.textContent = current.slice(0, this.offset);
      if (this.offset === 0) {
        this.forwards = true;
        this.index = (this.index + 1) % this.words.length;
      }
    }
    this.timer = requestAnimationFrame(this.tick);
  }
}
// Initialize type animation after DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  const typedEl = document.querySelector('.typed');
  if (typedEl) {
    const words = JSON.parse(typedEl.getAttribute('data-words') || '[]');
    new TypeCycle(typedEl, words, 80, 1500);
  }
});

/* ------------------------- Mouse glow following the pointer ------------------------- */
const mouseGlow = $('#mouse-glow');
document.addEventListener('mousemove', (e) => {
  // Slight transform for a smooth trailing micro-perf improvement
  const x = e.clientX;
  const y = e.clientY;
  mouseGlow.style.left = x + 'px';
  mouseGlow.style.top = y + 'px';
});

/* ------------------------- Particles (canvas) ------------------------- */
const canvas = document.getElementById('particles');
const ctx = canvas && canvas.getContext('2d');
let particles = [];
let resizeTimeout;

function initCanvas(){
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.scale(dpr, dpr);
  createParticles();
}

function createParticles(){
  particles = [];
  const count = Math.max(Math.floor((innerWidth * innerHeight) / 75000), 18);
  for (let i=0;i<count;i++){
    particles.push({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      r: 0.8 + Math.random()*2.2,
      dx: (Math.random()-0.5) * 0.4,
      dy: (Math.random()-0.5) * 0.4,
      hue: Math.random()*360,
      alpha: 0.06 + Math.random()*0.2
    });
  }
}

function drawParticles(){
  if (!ctx) return;
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for (let p of particles){
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = innerHeight + 20;
    if (p.y > innerHeight + 20) p.y = -20;

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*10);
    g.addColorStop(0, `hsla(${p.hue},80%,60%,${p.alpha})`);
    g.addColorStop(1, `hsla(${p.hue},60%,50%,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(()=> {
    initCanvas();
  }, 180);
});

// Initialize particles after load
window.addEventListener('load', () => {
  initCanvas();
  requestAnimationFrame(drawParticles);
});

/* ------------------------- Smooth scroll & active nav highlighting ------------------------- */
document.documentElement.style.scrollBehavior = 'smooth';
const navLinks = $$('.nav-link');
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

function onScroll(){
  const fromTop = window.scrollY + 90;
  let current = sections[0];
  for (const sec of sections){
    if (sec.offsetTop <= fromTop) current = sec;
  }
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + (current && current.id)));
  // floating top
  const floatTop = $('#floating-top');
  if (window.scrollY > 320) floatTop.style.display = 'block';
  else floatTop.style.display = 'none';
}
window.addEventListener('scroll', throttle(onScroll, 120));
window.addEventListener('load', onScroll);

/* Throttle helper */
function throttle(fn, wait){
  let time = Date.now();
  return function(){
    if ((time + wait - Date.now()) < 0){
      fn();
      time = Date.now();
    }
  }
}

/* ------------------------- Mobile nav toggling ------------------------- */
const navToggle = document.querySelector('.nav-toggle');
const navMenu = $('#nav-menu');
navToggle && navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  if (!expanded) {
    navMenu.style.display = 'flex';
    navMenu.style.flexDirection = 'column';
  } else {
    navMenu.style.display = '';
  }
});
function closeMobileNav(){
  if (window.innerWidth <= 980 && navToggle){
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.style.display = '';
  }
}

/* ------------------------- Scroll reveal using IntersectionObserver ------------------------- */
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.12 };
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('revealed');
      entry.target.classList.add('revealed-active');
    }
  });
}, observerOptions);

$$('.reveal').forEach(el => revealObserver.observe(el));
$$('.small-reveal').forEach(el => revealObserver.observe(el));

/* ------------------------- Skills animation (SVG rings) ------------------------- */
const skillCards = $$('.skill-card');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const el = entry.target;
      const svgRing = el.querySelector('.ring');
      const percentEl = el.querySelector('.skill-percent');
      const target = parseInt(el.getAttribute('data-skill') || '80', 10);
      animateSkill(svgRing, percentEl, target);
      skillObserver.unobserve(el);
    }
  });
}, {threshold:0.35});

skillCards.forEach(c => skillObserver.observe(c));

function animateSkill(ring, percentEl, target){
  // circumference for r=40: 2*pi*40 = ~251.2 (we used this in CSS)
  const circumference = 2 * Math.PI * 40;
  const targetOffset = circumference * (1 - target/100);
  // animate stroke-dashoffset
  let start = null;
  const duration = 900;
  const initialOffset = parseFloat(getComputedStyle(ring).strokeDashoffset) || circumference;
  function step(ts){
    if (!start) start=ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = easeOutCubic(progress);
    const offset = initialOffset + (targetOffset - initialOffset) * eased;
    ring.style.strokeDashoffset = offset;
    if (percentEl){
      percentEl.textContent = Math.round(target * eased) + '%';
    }
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOutCubic(t){ return (--t)*t*t+1 }

/* ------------------------- Counters (stat numbers) ------------------------- */
const counters = $$('[data-counter], .stat-value, .stat-number, .dash-counter');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-counter') || el.textContent || '0', 10);
      if (!el._counted) {
        animateCounter(el, target);
        el._counted = true;
      }
    }
  });
}, {threshold:0.35});
counters.forEach(c => counterObserver.observe(c));

function animateCounter(el, target){
  let start = null;
  const duration = 1100;
  const initial = parseInt(el.textContent.replace(/\D/g,'') ) || 0;
  function step(ts){
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const value = Math.floor(initial + (target - initial) * easeOutQuad(progress));
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOutQuad(t){ return t*(2-t) }

/* ------------------------- Copy Discord Username & Hire Me ------------------------- */
const copyBtn = $('#copy-discord');
if (copyBtn){
  copyBtn.addEventListener('click', async () => {
    const text = document.getElementById('discord-username').textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=> copyBtn.innerHTML = 'Copy Discord Username', 1200);
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); copyBtn.textContent = 'Copied!'; } catch(e){}
      ta.remove();
    }
  });
}

const hireBtn = $('#hire-me-btn');
if (hireBtn) {
  hireBtn.addEventListener('click', (e) => {
    // open email draft; user can replace email in production
    window.location.href = 'mailto:hello@example.com?subject=Collaboration%20Inquiry%20from%20Portfolio';
  });
}

/* ------------------------- Floating back to top button ------------------------- */
const floatTop = $('#floating-top');
if (floatTop) {
  floatTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
}
const backToTop = $('#back-to-top');
if (backToTop){
  backToTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
}

/* ------------------------- Active nav via click + smooth focus ------------------------- */
$$('.nav-link').forEach(a => {
  a.addEventListener('click', (e) => {
    // highlight is handled by scroll; ensure smooth scroll and focus
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.setAttribute('tabindex','-1');
      setTimeout(()=> target.focus({preventScroll:true}), 500);
    }
  });
});

/* ------------------------- Simple page load animations for elements already in viewport ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // reveal immediate elements (hero, header)
  $$('.nav, .hero, .hero-card, .hero-stats').forEach(el => el.classList.add('revealed'));
});

/* ------------------------- Nav highlight on scroll (initial call) ------------------------- */
onScroll();

/* ------------------------- Page Year in Footer ------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ------------------------- Accessibility helpers ------------------------- */
// Make all revealable elements focusable if they contain interactive elements
$$('.reveal').forEach(el => {
  if (el.querySelector('button, a, input')) el.setAttribute('tabindex','0');
});

/* ------------------------- Simple page transition on load ------------------------- */
window.addEventListener('beforeunload', () => {
  transition.style.opacity = '1';
});

/* ------------------------- Misc helpers and polish ------------------------- */
// throttle for mousemove heavy work (not needed here but kept for pattern)
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms)} }

/* ------------------------- End of script ------------------------- */
