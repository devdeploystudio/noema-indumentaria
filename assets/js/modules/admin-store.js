import { PRODUCTS as DEFAULT_PRODUCTS, COUPONS as DEFAULT_COUPONS } from './data.js';

const LS_PRODUCTS = 'noema_admin_products';
const LS_COUPONS = 'noema_admin_coupons';
const LS_DISCOUNT = 'noema_admin_discount';
const LS_BADGES = 'noema_admin_badges';
const LS_CATEGORIES = 'noema_admin_categories';
const LS_SIZEGROUPS = 'noema_admin_sizegroups';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getRawProducts() {
  return load(LS_PRODUCTS, DEFAULT_PRODUCTS);
}

export function saveProducts(list) {
  save(LS_PRODUCTS, list);
}

export function getCoupons() {
  return load(LS_COUPONS, DEFAULT_COUPONS);
}

export function saveCoupons(obj) {
  save(LS_COUPONS, obj);
}

export function getDiscount() {
  return load(LS_DISCOUNT, 0);
}

export function saveDiscount(pct) {
  save(LS_DISCOUNT, pct);
}

export function getCustomBadges() {
  return load(LS_BADGES, [
    { text: 'Nuevo', hidden: false, fn: 'autoNew', autoNewDays: 30 },
    { text: 'Descuento', hidden: false, fn: 'discount', discountStyle: 'minus' },
  ]);
}

export function saveCustomBadges(list) {
  save(LS_BADGES, list);
}

const DEFAULT_CATEGORIES = [
  { slug: 'hombre', label: 'Hombre', hidden: false },
  { slug: 'mujer', label: 'Mujer', hidden: false },
  { slug: 'accesorios', label: 'Accesorios', hidden: false },
];

export function getCategories() {
  return load(LS_CATEGORIES, DEFAULT_CATEGORIES);
}

export function saveCategories(list) {
  save(LS_CATEGORIES, list);
}

// talles disponibles, agrupados por tipo (prendas, calzado, etc). Cada grupo
// tiene una key fija (usada como valor del "tipo de talle" del producto) y
// una lista de talles editable.
const DEFAULT_SIZE_GROUPS = [
  { key: 'ropa', label: 'Prendas', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { key: 'calzado', label: 'Calzado', sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'] },
  { key: 'unico', label: 'Talle único', sizes: ['Único'] },
];

export function getSizeGroups() {
  return load(LS_SIZEGROUPS, DEFAULT_SIZE_GROUPS);
}

export function saveSizeGroups(list) {
  save(LS_SIZEGROUPS, list);
}

export function resetAdminData() {
  localStorage.removeItem(LS_PRODUCTS);
  localStorage.removeItem(LS_COUPONS);
  localStorage.removeItem(LS_DISCOUNT);
  localStorage.removeItem(LS_BADGES);
  localStorage.removeItem(LS_CATEGORIES);
  localStorage.removeItem(LS_SIZEGROUPS);
}

export function nextProductId(products) {
  const nums = products.map((p) => Number((p.id.match(/\d+/) || [0])[0])).filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return 'p' + (max + 1);
}

// El descuento general se aplica al leer, nunca se guarda "quemado" en el
// precio: así se puede subir/bajar/quitar sin perder el precio base real.
function withGlobalDiscount(products, pct) {
  if (!pct) return products;
  return products.map((p) => ({
    ...p,
    oldPrice: p.price,
    price: Math.round(p.price * (1 - pct / 100)),
  }));
}

// Algunos productos de la demo están marcados para "nacer hoy" siempre, así
// el ejemplo de la etiqueta automática ("Nuevo") nunca se queda vencido por
// más que pase el tiempo desde que se armó el sitio.
function withFreshDemoDates(products) {
  return products.map((p) => (p.demoAlwaysNew ? { ...p, createdAt: Date.now() } : p));
}

// PRODUCTS, COUPONS y CATEGORIES: lo que consume el resto del sitio (catálogo,
// carrito, checkout, buscador). Ya vienen con overrides de localStorage +
// descuento general aplicados, y sin lo que esté oculto, listos para renderizar.
export const PRODUCTS = withFreshDemoDates(withGlobalDiscount(getRawProducts(), getDiscount())).filter((p) => !p.hidden);
export const COUPONS = Object.fromEntries(Object.entries(getCoupons()).filter(([, c]) => !c.hidden));
export const CATEGORIES = getCategories().filter((c) => !c.hidden);
