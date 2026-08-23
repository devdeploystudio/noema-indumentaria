import { $, $$ } from './dom.js';
import { FEATURED_IDS } from './data.js';
import { PRODUCTS, CATEGORIES } from './admin-store.js';
import { store, saveWish } from './store.js';
import { productCardHTML, sortProducts } from './product-card.js';
import { updateBadges } from './cart.js';
import { openQuickAdd } from './quick-add.js';
import { hasRealSizes } from './sizes.js';

const catalogGrid = $('#productGrid');
const catalogTabs = $('#catalogTabs');
const sortSelect = $('#sortSelect');

function renderCatalog() {
  if (!catalogGrid) return;
  let items = store.filter === 'todos' ? PRODUCTS : PRODUCTS.filter((p) => p.category === store.filter);
  items = sortProducts(items);
  catalogGrid.innerHTML = items.map(productCardHTML).join('') || `<p class="catalog__empty">No hay productos en esta categoría todavía.</p>`;
}

function setFilter(f) {
  store.filter = f;
  if (catalogTabs) $$('.tab', catalogTabs).forEach((t) => t.classList.toggle('is-active', t.dataset.filter === f));
  renderCatalog();
}

if (catalogTabs) {
  catalogTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) setFilter(tab.dataset.filter);
  });
}
if (sortSelect) {
  sortSelect.addEventListener('change', () => { store.sort = sortSelect.value; renderCatalog(); });
}
if (catalogTabs) {
  catalogTabs.insertAdjacentHTML('beforeend', CATEGORIES.map((c) =>
    `<button class="tab" data-filter="${c.slug}">${c.label}</button>`
  ).join(''));
}

if (catalogGrid) {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  if (cat && CATEGORIES.some((c) => c.slug === cat)) setFilter(cat); else renderCatalog();
  const highlight = params.get('highlight');
  if (highlight) {
    setTimeout(() => {
      const card = catalogGrid.querySelector(`.product[data-id="${highlight}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.boxShadow = '0 0 0 3px var(--accent)';
        setTimeout(() => (card.style.boxShadow = ''), 1600);
      }
    }, 300);
  }
}

const featuredGrid = $('#featuredGrid');
if (featuredGrid) {
  const items = FEATURED_IDS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  featuredGrid.innerHTML = items.map(productCardHTML).join('');

  const carousel = $('#featuredCarousel');
  if (carousel) {
    let timer;
    const advance = () => {
      const card = carousel.querySelector('.product');
      if (!card) return;
      const gap = parseFloat(getComputedStyle(featuredGrid).gap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft + step >= maxScroll - 2) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: step, behavior: 'smooth' });
      }
    };
    const start = () => { timer = setInterval(advance, 3500); };
    const stop = () => clearInterval(timer);
    start();
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('touchstart', stop, { passive: true });
  }
}

const wishGrid = $('#wishlistGrid');
const wishEmpty = $('#wishlistEmpty');

function renderWishlistPage() {
  if (!wishGrid) return;
  const items = PRODUCTS.filter((p) => store.wish.has(p.id));
  wishGrid.hidden = items.length === 0;
  if (wishEmpty) wishEmpty.hidden = items.length > 0;
  wishGrid.innerHTML = items.map(productCardHTML).join('');
}
renderWishlistPage();

function toggleWish(id, btn) {
  if (store.wish.has(id)) store.wish.delete(id); else store.wish.add(id);
  saveWish();
  if (btn) btn.classList.toggle('is-active', store.wish.has(id));
  updateBadges();
  renderWishlistPage();
}

function flyToCart(fromEl) {
  const target = $('#cartBtn');
  const r1 = fromEl.getBoundingClientRect(), r2 = target.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.style.cssText = `position:fixed;z-index:1300;left:${r1.left}px;top:${r1.top}px;width:16px;height:16px;border-radius:50%;background:var(--accent);pointer-events:none;transition:all .6s cubic-bezier(.16,.8,.24,1);`;
  document.body.appendChild(ghost);
  requestAnimationFrame(() => {
    ghost.style.left = r2.left + 10 + 'px'; ghost.style.top = r2.top + 10 + 'px';
    ghost.style.width = '6px'; ghost.style.height = '6px'; ghost.style.opacity = '0.3';
  });
  setTimeout(() => ghost.remove(), 620);
}

// delega clicks de "agregar" y "favorito" sobre cualquier grid de producto, en cualquier página
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add]');
  const wishBtn = e.target.closest('[data-wish]');
  if (addBtn) {
    const p = PRODUCTS.find((x) => x.id === addBtn.dataset.add);
    openQuickAdd(addBtn.dataset.add);
    if (!p || !hasRealSizes(p)) flyToCart(addBtn);
  }
  if (wishBtn) toggleWish(wishBtn.dataset.wish, wishBtn);
});
