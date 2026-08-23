import { getCustomBadges } from './admin-store.js';

export const money = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

// Estilos posibles para la etiqueta con función "detectar descuento" (se
// elige por nombre desde el panel, sin exponer ningún formato técnico).
export const DISCOUNT_STYLES = {
  minus: (pct) => `-${pct}%`,
  off: (pct) => `${pct}% OFF`,
  desc: (pct) => `${pct}% de descuento`,
  save: (pct) => `Ahorrás ${pct}%`,
};

// La lista de Etiquetas del panel es la única fuente de verdad: si un
// producto tiene guardado un texto de etiqueta que ya no existe ahí (se
// borró o se ocultó, como "Sale" en el catálogo de fábrica), no se muestra
// nada — no queda un texto suelto que nadie está administrando.
export const badgeLabel = (p) => {
  const badges = getCustomBadges();
  const discountBadge = badges.find((b) => b.fn === 'discount' && !b.hidden);
  if (p.oldPrice && discountBadge) {
    const pct = Math.round((1 - p.price / p.oldPrice) * 100);
    const format = DISCOUNT_STYLES[discountBadge.discountStyle] || DISCOUNT_STYLES.minus;
    return format(pct);
  }
  const autoBadge = badges.find((b) => b.fn === 'autoNew' && !b.hidden);
  if (autoBadge) {
    const days = autoBadge.autoNewDays || 30;
    const isRecent = p.createdAt && Date.now() - p.createdAt < days * 86400000;
    if (isRecent) return autoBadge.text;
  }
  const manual = badges.find((b) => b.text === p.badge && !b.hidden && !b.fn);
  return manual ? manual.text : undefined;
};
