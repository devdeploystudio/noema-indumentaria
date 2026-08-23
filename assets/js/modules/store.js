import { PRODUCTS } from './admin-store.js';

// carritos guardados por una versión anterior del sitio no tenían talle: se descartan
// esas líneas para no mostrar "Talle undefined" en el carrito.
const savedCart = JSON.parse(localStorage.getItem('noema_cart') || '[]')
  .filter((l) => l && l.size && PRODUCTS.some((p) => p.id === l.id));

export const store = {
  cart: savedCart,
  wish: new Set(JSON.parse(localStorage.getItem('noema_wish') || '[]')),
  filter: 'todos',
  sort: 'relevancia',
  coupon: null,
};

export const saveCart = () => localStorage.setItem('noema_cart', JSON.stringify(store.cart));
export const saveWish = () => localStorage.setItem('noema_wish', JSON.stringify([...store.wish]));

export function cartTotal() {
  return store.cart.reduce((sum, l) => sum + (PRODUCTS.find((p) => p.id === l.id)?.price || 0) * l.qty, 0);
}

export function cartCount() {
  return store.cart.reduce((n, l) => n + l.qty, 0);
}
