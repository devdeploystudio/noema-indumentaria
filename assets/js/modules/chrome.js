import { $, $$ } from './dom.js';
import { money } from './format.js';
import { PRODUCTS } from './data.js';

window.addEventListener('load', () => {
  setTimeout(() => $('#preloader').classList.add('is-hidden'), 400);
});

(() => {
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  if (!dot || !ring || matchMedia('(pointer:coarse)').matches) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    const onDark = !!e.target.closest('.footer, .promo__copy');
    dot.classList.toggle('is-on-dark', onDark);
    ring.classList.toggle('is-on-dark', onDark);
  });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a,button,input,select,.tab,.product,.collection')) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a,button,input,select,.tab,.product,.collection')) ring.classList.remove('is-active');
  });
})();

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
$$('.reveal').forEach((el) => io.observe(el));

(() => {
  const msgs = $$('.announce__msg');
  if (msgs.length < 2) return;
  let i = 0;
  setInterval(() => {
    msgs[i].classList.remove('is-active');
    i = (i + 1) % msgs.length;
    msgs[i].classList.add('is-active');
  }, 3200);
})();

const nav = $('#nav');
window.addEventListener('scroll', () => nav.classList.toggle('is-scrolled', window.scrollY > 10), { passive: true });

const burger = $('#burgerBtn'), navLinks = $('#navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
});
$$('#navLinks a').forEach((a) => a.addEventListener('click', () => {
  navLinks.classList.remove('is-open'); burger.classList.remove('is-open');
}));

const searchPanel = $('#searchPanel'), searchInput = $('#searchInput'), searchResults = $('#searchResults');
const openSearch = () => { searchPanel.classList.add('is-open'); setTimeout(() => searchInput.focus(), 300); };
const closeSearch = () => { searchPanel.classList.remove('is-open'); searchInput.value = ''; searchResults.innerHTML = ''; };
$('#searchBtn').addEventListener('click', openSearch);
$('#searchClose').addEventListener('click', closeSearch);
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResults.innerHTML = ''; return; }
  const matches = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q));
  searchResults.innerHTML = matches.length
    ? matches.map((p) => `<button class="search-result" data-goto="${p.id}"><span>${p.name}</span><strong>${money(p.price)}</strong></button>`).join('')
    : `<p style="color:var(--muted);padding:10px 6px;">Sin resultados para “${q}”.</p>`;
});
searchResults.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-goto]');
  if (!btn) return;
  const p = PRODUCTS.find((x) => x.id === btn.dataset.goto);
  window.location.href = `pages/tienda/producto.html?id=${p.id}`;
});
