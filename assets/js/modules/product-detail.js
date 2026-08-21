import { $ } from './dom.js';
import { money } from './format.js';
import { PRODUCTS } from './data.js';
import { hasRealSizes, isSoldOut, sizeTypeLabel, sizePickerHTML, stockFor } from './sizes.js';
import { addToCart } from './cart.js';

const grid = $('#pdGrid');
if (grid) {
  const params = new URLSearchParams(window.location.search);
  const p = PRODUCTS.find((x) => x.id === params.get('id'));

  if (!p) {
    grid.innerHTML = `
      <div class="pd__missing">
        <p>No encontramos ese producto.</p>
        <a href="pages/tienda/productos.html" class="btn btn--primary">Ver catálogo</a>
      </div>`;
  } else {
    document.title = `${p.name} · NOEMA`;
    const soldOut = isSoldOut(p);

    grid.innerHTML = `
      <div class="pd__grid">
        <div class="pd__media">
          ${p.badge ? `<span class="pd__badge">${p.badge}</span>` : ''}
          <img src="${p.img}" alt="${p.name}">
        </div>
        <div class="pd__info">
          <span class="pd__cat">${p.category}</span>
          <h1 class="pd__name">${p.name}</h1>
          <span class="pd__price">${p.oldPrice ? `<span class="pd__price--old">${money(p.oldPrice)}</span>` : ''}${money(p.price)}</span>
          <p class="pd__desc">${p.desc || ''}</p>
          ${hasRealSizes(p) ? `
            <div class="pd__sizes">
              <span class="pd__label">${sizeTypeLabel(p)}</span>
              <div class="size-picker" id="pdSizePicker">${sizePickerHTML(p, null)}</div>
              <p class="pd__stock" id="pdStockNote" hidden></p>
            </div>` : ''}
          <div class="pd__actions">
            ${soldOut
              ? `<button class="btn btn--primary btn--block" disabled>Sin stock</button>`
              : `<button class="btn btn--primary btn--block" id="pdAdd" ${hasRealSizes(p) ? 'disabled' : ''}>${hasRealSizes(p) ? 'Elegí un talle' : 'Agregar al carrito'}</button>`}
          </div>
        </div>
      </div>`;

    let selectedSize = hasRealSizes(p) ? null : p.sizes[0];
    const addBtn = $('#pdAdd');
    const picker = $('#pdSizePicker');
    const stockNote = $('#pdStockNote');

    if (picker) {
      picker.addEventListener('click', (e) => {
        const btn = e.target.closest('.size-btn');
        if (!btn || btn.disabled) return;
        selectedSize = btn.dataset.size;
        picker.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        addBtn.disabled = false;
        addBtn.textContent = 'Agregar al carrito';
        const left = stockFor(p, selectedSize);
        stockNote.hidden = left > 4;
        stockNote.textContent = left > 0 ? `¡Últimas ${left} unidades!` : '';
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (!selectedSize) return;
        addToCart(p.id, selectedSize);
      });
    }
  }
}
