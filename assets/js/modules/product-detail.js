import { $ } from './dom.js';
import { money, badgeLabel } from './format.js';
import { PRODUCTS } from './admin-store.js';
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
    const photos = p.images && p.images.length ? p.images : [p.img];

    grid.innerHTML = `
      <div class="pd__grid">
        <div class="pd__gallery">
          <div class="pd__media">
            ${badgeLabel(p) ? `<span class="pd__badge">${badgeLabel(p)}</span>` : ''}
            <img src="${photos[0]}" alt="${p.name}" id="pdMainImg">
            ${photos.length > 1 ? `
              <button type="button" class="pd__arrow pd__arrow--prev" id="pdPrev" aria-label="Foto anterior">
                <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button type="button" class="pd__arrow pd__arrow--next" id="pdNext" aria-label="Foto siguiente">
                <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </button>` : ''}
          </div>
          ${photos.length > 1 ? `
            <div class="pd__thumbs" id="pdThumbs">
              ${photos.map((src, i) => `<button type="button" class="pd__thumb${i === 0 ? ' is-active' : ''}" data-src="${src}"><img src="${src}" alt=""></button>`).join('')}
            </div>` : ''}
        </div>
        <div class="pd__info">
          <span class="pd__cat">${p.category}</span>
          <h1 class="pd__name">${p.name}</h1>
          <h2 class="sr-only">Detalle del producto</h2>
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
    const thumbs = $('#pdThumbs');
    let photoIndex = 0;

    function goToPhoto(i) {
      photoIndex = (i + photos.length) % photos.length;
      $('#pdMainImg').src = photos[photoIndex];
      if (thumbs) {
        thumbs.querySelectorAll('.pd__thumb').forEach((b, bi) => b.classList.toggle('is-active', bi === photoIndex));
      }
    }

    if (thumbs) {
      thumbs.addEventListener('click', (e) => {
        const btn = e.target.closest('.pd__thumb');
        if (!btn) return;
        goToPhoto([...thumbs.children].indexOf(btn));
      });
    }

    $('#pdPrev')?.addEventListener('click', () => goToPhoto(photoIndex - 1));
    $('#pdNext')?.addEventListener('click', () => goToPhoto(photoIndex + 1));

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
