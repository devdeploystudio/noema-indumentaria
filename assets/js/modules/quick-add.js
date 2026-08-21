import { PRODUCTS } from './data.js';
import { money } from './format.js';
import { mediaHTML } from './product-card.js';
import { hasRealSizes, sizeTypeLabel, sizePickerHTML, stockFor } from './sizes.js';
import { addToCart } from './cart.js';

document.body.insertAdjacentHTML('beforeend', `
  <div class="qa-modal" id="qaModal" aria-hidden="true">
    <div class="qa-modal__panel">
      <button class="qa-modal__close" id="qaClose" aria-label="Cerrar">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="qa-modal__media" id="qaMedia"></div>
      <div class="qa-modal__body">
        <span class="qa-modal__cat" id="qaCat"></span>
        <h3 id="qaName"></h3>
        <span class="qa-modal__price" id="qaPrice"></span>
        <div class="qa-modal__sizes">
          <span class="qa-modal__label" id="qaSizeLabel"></span>
          <div class="size-picker" id="qaSizePicker"></div>
          <p class="qa-modal__stock" id="qaStockNote" hidden></p>
        </div>
        <button class="btn btn--primary btn--block" id="qaConfirm" disabled>Elegí un talle</button>
      </div>
    </div>
  </div>
`);

const modal = document.getElementById('qaModal');
const media = document.getElementById('qaMedia');
const catEl = document.getElementById('qaCat');
const nameEl = document.getElementById('qaName');
const priceEl = document.getElementById('qaPrice');
const sizeLabel = document.getElementById('qaSizeLabel');
const sizePicker = document.getElementById('qaSizePicker');
const stockNote = document.getElementById('qaStockNote');
const confirmBtn = document.getElementById('qaConfirm');
const closeBtn = document.getElementById('qaClose');

let current = null, selectedSize = null;

export function openQuickAdd(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  if (!hasRealSizes(p)) { addToCart(p.id, p.sizes[0]); return; }

  current = p;
  selectedSize = null;
  media.innerHTML = mediaHTML(p);
  catEl.textContent = p.category;
  nameEl.textContent = p.name;
  priceEl.innerHTML = p.oldPrice ? `<span class="product__price--old">${money(p.oldPrice)}</span>${money(p.price)}` : money(p.price);
  sizeLabel.textContent = sizeTypeLabel(p);
  sizePicker.innerHTML = sizePickerHTML(p, null);
  stockNote.hidden = true;
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Elegí un talle';

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeQuickAdd() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

sizePicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.size-btn');
  if (!btn || btn.disabled || !current) return;
  selectedSize = btn.dataset.size;
  sizePicker.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
  confirmBtn.disabled = false;
  confirmBtn.textContent = 'Agregar al carrito';
  const left = stockFor(current, selectedSize);
  stockNote.hidden = left > 4;
  stockNote.textContent = left > 0 ? `¡Últimas ${left} unidades!` : '';
});

confirmBtn.addEventListener('click', () => {
  if (!current || !selectedSize) return;
  addToCart(current.id, selectedSize);
  closeQuickAdd();
});

closeBtn.addEventListener('click', closeQuickAdd);
modal.addEventListener('click', (e) => { if (e.target === modal) closeQuickAdd(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeQuickAdd();
});
