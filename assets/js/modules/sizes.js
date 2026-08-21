export const hasRealSizes = (p) => Array.isArray(p.sizes) && p.sizes.length > 1;

export const sizeTypeLabel = (p) => (p.sizeType === 'calzado' ? 'Talle de calzado' : 'Talle');

export const stockFor = (p, size) => (p.stock ? (p.stock[size] ?? 0) : 0);

export const isSoldOut = (p) => p.sizes.every((s) => stockFor(p, s) <= 0);

export function variantText(p, size) {
  if (!hasRealSizes(p)) return p.color;
  return `Talle ${size} · ${p.color}`;
}

export function sizePickerHTML(p, selected) {
  return p.sizes.map((s) => {
    const out = stockFor(p, s) <= 0;
    const active = s === selected ? ' is-active' : '';
    return `<button type="button" class="size-btn${active}" data-size="${s}" ${out ? 'disabled aria-disabled="true"' : ''}>${s}</button>`;
  }).join('');
}
