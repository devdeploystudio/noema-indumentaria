import { store } from './store.js';
import { money } from './format.js';

export const mediaHTML = (p) =>
  `<div class="ph ph--fill ph--photo"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>`;

export function productCardHTML(p) {
  return `
    <article class="product" data-id="${p.id}">
      <div class="product__media">
        ${p.badge ? `<span class="product__badge">${p.badge}</span>` : ''}
        <button class="product__wish ${store.wish.has(p.id) ? 'is-active' : ''}" data-wish="${p.id}" aria-label="Favorito">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4 6 4c2.3 0 3.9 1.3 6 3.6C14.1 5.3 15.7 4 18 4c4 0 5.6 4 4 7.7C19.5 16.4 12 21 12 21z"/></svg>
        </button>
        <a class="product__link" href="pages/tienda/producto.html?id=${p.id}" aria-label="Ver ${p.name}">${mediaHTML(p)}</a>
        <div class="product__quick">
          <button class="btn btn--primary btn--block" data-add="${p.id}">Agregar al carrito</button>
        </div>
      </div>
      <div class="product__info">
        <span class="product__cat">${p.category}</span>
        <h3 class="product__name"><a href="pages/tienda/producto.html?id=${p.id}">${p.name}</a></h3>
        <div class="product__row">
          <span class="product__price">${p.oldPrice ? `<span class="product__price--old">${money(p.oldPrice)}</span>` : ''}${money(p.price)}</span>
        </div>
      </div>
    </article>`;
}

export function sortProducts(list) {
  const arr = [...list];
  if (store.sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
  else if (store.sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
  else if (store.sort === 'name-asc') arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return arr;
}
