import { $ } from './dom.js';
import { money } from './format.js';
import { PRODUCTS } from './data.js';
import { store, saveCart, cartTotal, cartCount } from './store.js';
import { mediaHTML } from './product-card.js';
import { variantText } from './sizes.js';
import { showToast } from './toast.js';

const cartDrawer = $('#cartDrawer'), overlay = $('#overlay');
const cartItemsEl = $('#cartItems'), cartEmptyEl = $('#cartEmpty'), cartFooterEl = $('#cartFooter');

export function addToCart(id, size) {
  const line = store.cart.find((l) => l.id === id && l.size === size);
  if (line) line.qty++; else store.cart.push({ id, size, qty: 1 });
  saveCart(); updateBadges(); renderCart();
  showToast('Producto agregado al carrito');
}

export function changeQty(id, size, delta) {
  const line = store.cart.find((l) => l.id === id && l.size === size);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) store.cart = store.cart.filter((l) => l !== line);
  saveCart(); updateBadges(); renderCart();
}

export function removeFromCart(id, size) {
  store.cart = store.cart.filter((l) => !(l.id === id && l.size === size));
  saveCart(); updateBadges(); renderCart();
}

export function renderCart() {
  const empty = store.cart.length === 0;
  cartEmptyEl.hidden = !empty;
  cartFooterEl.hidden = empty;
  $('#cartDrawerCount').textContent = `(${cartCount()})`;
  if (empty) { cartItemsEl.querySelectorAll('.cart-item').forEach((n) => n.remove()); return; }

  const html = store.cart.map((l) => {
    const p = PRODUCTS.find((x) => x.id === l.id);
    if (!p) return '';
    return `
      <div class="cart-item" data-id="${p.id}" data-size="${l.size}">
        <div class="cart-item__media">${mediaHTML(p)}</div>
        <div class="cart-item__info">
          <div class="cart-item__top">
            <span class="cart-item__name">${p.name}</span>
            <button class="cart-item__remove" data-remove="${p.id}" data-size="${l.size}" aria-label="Quitar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          </div>
          <span class="cart-item__variant">${variantText(p, l.size)}</span>
          <div class="cart-item__bottom">
            <div class="qty">
              <button data-dec="${p.id}" data-size="${l.size}">−</button><span>${l.qty}</span><button data-inc="${p.id}" data-size="${l.size}">+</button>
            </div>
            <span class="cart-item__price">${money(p.price * l.qty)}</span>
          </div>
        </div>
      </div>`;
  }).join('');
  cartItemsEl.querySelectorAll('.cart-item').forEach((n) => n.remove());
  cartEmptyEl.insertAdjacentHTML('afterend', html);
  $('#cartSubtotal').textContent = money(cartTotal());
}

cartItemsEl.addEventListener('click', (e) => {
  const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rem = e.target.closest('[data-remove]');
  if (inc) changeQty(inc.dataset.inc, inc.dataset.size, 1);
  if (dec) changeQty(dec.dataset.dec, dec.dataset.size, -1);
  if (rem) removeFromCart(rem.dataset.remove, rem.dataset.size);
});

function openCart() { cartDrawer.classList.add('is-open'); cartDrawer.setAttribute('aria-hidden', 'false'); overlay.classList.add('is-open'); }
function closeCart() { cartDrawer.classList.remove('is-open'); cartDrawer.setAttribute('aria-hidden', 'true'); overlay.classList.remove('is-open'); }
$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#cartEmptyBtn').addEventListener('click', () => { closeCart(); window.location.href = 'pages/tienda/productos.html'; });
overlay.addEventListener('click', closeCart);

export function updateBadges() {
  const cc = cartCount(), wc = store.wish.size;
  const cartCountEl = $('#cartCount'), wishCountEl = $('#wishCount');
  cartCountEl.textContent = cc; cartCountEl.hidden = cc === 0;
  wishCountEl.textContent = wc; wishCountEl.hidden = wc === 0;
}

$('#checkoutBtn').addEventListener('click', () => { window.location.href = 'pages/tienda/checkout.html'; });
