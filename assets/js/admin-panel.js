import { $, $$ } from './modules/dom.js';
import { money, badgeLabel } from './modules/format.js';
import { showToast } from './modules/toast.js';
import { isAuthed, logout } from './modules/admin-auth.js';
import { initCursor } from './modules/cursor.js';
import { initInputFilters, validateForm } from './modules/validation.js';
import {
  getRawProducts, saveProducts, getCoupons, saveCoupons,
  getDiscount, saveDiscount, resetAdminData, nextProductId,
  getCustomBadges, saveCustomBadges,
  getCategories, saveCategories,
  getSizeGroups, saveSizeGroups,
} from './modules/admin-store.js';

initCursor();
initInputFilters();

if (!isAuthed()) {
  window.location.href = 'pages/admin/login.html';
}

$('#logoutBtn').addEventListener('click', () => {
  logout();
  window.location.href = 'pages/admin/login.html';
});

// esta demo no tiene backend: los cambios ya viven en este navegador y la
// tienda los lee en vivo (por eso "Vista previa" ya los muestra). Este botón
// simula el paso de "publicar" para que el flujo se sienta completo.
$('#publishBtn').addEventListener('click', () => {
  const btn = $('#publishBtn');
  const label = $('#publishBtnLabel');
  if (btn.disabled) return;
  btn.disabled = true;
  label.textContent = 'Publicando…';
  setTimeout(() => {
    label.textContent = 'Publicar cambios';
    btn.disabled = false;
    showToast('Cambios publicados (simulado, no se sube nada real en esta demo)');
  }, 900);
});

let products = getRawProducts();
let coupons = getCoupons();
let customBadges = getCustomBadges();
let categories = getCategories();
let sizeGroups = getSizeGroups();

function categoryLabel(slug) {
  return categories.find((c) => c.slug === slug)?.label || slug;
}
const trashIcon = '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>';
const xIcon = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const chevronLeftIcon = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';
const chevronRightIcon = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';

function stockSummary(p) {
  const entries = Object.entries(p.stock || {});
  if (!entries.length) return '<span class="admin-stock-pill">—</span>';
  const total = entries.reduce((sum, [, qty]) => sum + Number(qty || 0), 0);
  const out = entries.filter(([, qty]) => Number(qty) === 0).length;
  return `<span class="admin-stock-pill ${total === 0 ? 'is-out' : ''}">${total} u.${out ? ` · ${out} talle${out > 1 ? 's' : ''} agotado${out > 1 ? 's' : ''}` : ''}</span>`;
}

const eyeIcon = '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOffIcon = '<svg viewBox="0 0 24 24"><path d="M17.9 17.9A10.6 10.6 0 0 1 12 19c-7 0-11-7-11-7a19 19 0 0 1 4.2-5.2M9.9 4.2A9.8 9.8 0 0 1 12 4c7 0 11 7 11 7a19 19 0 0 1-2.3 3.2"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M2 2l20 20"/></svg>';
const pencilIcon = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
const checkIcon = '<svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>';

function stockTotal(p) {
  return Object.values(p.stock || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
}

function visibleProducts() {
  const search = $('#productSearch').value.trim().toLowerCase();
  const category = $('#productFilterCategory').value;
  const sort = $('#productSort').value;
  let list = products.filter((p) =>
    (!search || p.name.toLowerCase().includes(search)) &&
    (!category || p.category === category)
  );
  if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  else if (sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name, 'es'));
  else if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'stock-asc') list.sort((a, b) => stockTotal(a) - stockTotal(b));
  return list;
}

function renderProducts() {
  $('#productsTable tbody').innerHTML = visibleProducts().map((p) => `
    <tr style="${p.hidden ? 'opacity:.5' : ''}">
      <td><img src="${p.img}" alt=""></td>
      <td>
        <div class="admin-table__name">${p.name}${badgeLabel(p) ? ` <span class="admin-stock-pill">${badgeLabel(p)}</span>` : ''}${p.hidden ? ' <span class="admin-stock-pill is-out">Oculto</span>' : ''}</div>
        <div class="admin-table__meta">${p.color} · ${p.id}</div>
      </td>
      <td>${categoryLabel(p.category)}</td>
      <td>${p.oldPrice ? `<span style="text-decoration:line-through;color:var(--muted);font-size:12px;">${money(p.oldPrice)}</span><br>` : ''}${money(p.price)}</td>
      <td>${stockSummary(p)}</td>
      <td>
        <div class="admin-table__actions">
          <button class="admin-icon-btn" data-toggle="${p.id}" aria-label="${p.hidden ? 'Mostrar' : 'Ocultar'}" title="${p.hidden ? 'Mostrar en la tienda' : 'Ocultar de la tienda'}">${p.hidden ? eyeOffIcon : eyeIcon}</button>
          <button class="admin-icon-btn" data-edit="${p.id}" aria-label="Editar" title="Editar">
            <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          </button>
          <button class="admin-icon-btn admin-icon-btn--danger" data-del="${p.id}" aria-label="Borrar" title="Borrar">${trashIcon}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

let editingCoupon = null;

function renderCoupons() {
  const codes = Object.keys(coupons);
  $('#couponsEmpty').hidden = codes.length > 0;
  $('#couponsTable tbody').innerHTML = codes.map((code) => {
    const c = coupons[code];
    const expired = c.expires && new Date(`${c.expires}T23:59:59`) < new Date();
    const expiresText = c.expires
      ? new Date(`${c.expires}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Sin vencimiento';
    if (editingCoupon === code) {
      return `
      <tr>
        <td>${code}</td>
        <td><input type="number" min="1" max="90" step="1" class="admin-table__edit" id="editCouponRate" value="${Math.round(c.rate * 100)}"></td>
        <td><input type="date" class="admin-table__edit" id="editCouponExpires" value="${c.expires || ''}"></td>
        <td class="admin-table__actions">
          <button class="admin-icon-btn" data-savecoupon="${code}" aria-label="Guardar" title="Guardar">${checkIcon}</button>
        </td>
      </tr>`;
    }
    return `
    <tr style="${c.hidden ? 'opacity:.5' : ''}">
      <td>${code}${c.hidden ? ' <span class="admin-stock-pill is-out">Oculto</span>' : ''}</td>
      <td>${Math.round(c.rate * 100)}%</td>
      <td>${expiresText}${expired ? ' <span class="admin-stock-pill is-out">Vencido</span>' : ''}</td>
      <td class="admin-table__actions">
        <button class="admin-icon-btn" data-togglecoupon="${code}" aria-label="${c.hidden ? 'Mostrar' : 'Ocultar'}" title="${c.hidden ? 'Mostrar' : 'Ocultar'}">${c.hidden ? eyeOffIcon : eyeIcon}</button>
        <button class="admin-icon-btn" data-editcoupon="${code}" aria-label="Editar" title="Editar">${pencilIcon}</button>
        <button class="admin-icon-btn admin-icon-btn--danger" data-delcoupon="${code}" aria-label="Borrar" title="Borrar">${trashIcon}</button>
      </td>
    </tr>
  `;
  }).join('');
}

function renderDiscount() {
  const pct = getDiscount();
  $('#discountInput').value = pct || '';
  const status = $('#discountStatus');
  status.hidden = !pct;
  if (pct) status.textContent = `Descuento activo: ${pct}% en toda la tienda`;
}

$('#discountForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(e.target, 'Ingresá un % de descuento antes de aplicar.')) return;
  const pct = Math.max(0, Math.min(90, Number($('#discountInput').value) || 0));
  saveDiscount(pct);
  renderDiscount();
  showToast(pct ? `Descuento del ${pct}% aplicado a toda la tienda` : 'Descuento quitado');
});

$('#clearDiscountBtn').addEventListener('click', () => {
  saveDiscount(0);
  renderDiscount();
  showToast('Descuento quitado');
});

$('#couponForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(e.target, 'Completá el código y el % de descuento antes de agregar el cupón.')) return;
  const code = $('#couponCode').value.trim().toUpperCase();
  const rate = Number($('#couponRate').value);
  const expires = $('#couponExpires').value || null;
  if (!code || !rate) return;
  coupons[code] = { rate: rate / 100, expires };
  saveCoupons(coupons);
  renderCoupons();
  e.target.reset();
  showToast(`Cupón "${code}" agregado`);
});

$('#couponsTable').addEventListener('click', (e) => {
  const delBtn = e.target.closest('[data-delcoupon]');
  const toggleBtn = e.target.closest('[data-togglecoupon]');
  const editBtn = e.target.closest('[data-editcoupon]');
  const saveBtn = e.target.closest('[data-savecoupon]');
  if (delBtn) {
    delete coupons[delBtn.dataset.delcoupon];
    saveCoupons(coupons);
    renderCoupons();
    showToast('Cupón eliminado');
  }
  if (toggleBtn) {
    const code = toggleBtn.dataset.togglecoupon;
    coupons[code].hidden = !coupons[code].hidden;
    saveCoupons(coupons);
    renderCoupons();
    showToast(coupons[code].hidden ? 'Cupón oculto' : 'Cupón visible de nuevo');
  }
  if (editBtn) {
    editingCoupon = editBtn.dataset.editcoupon;
    renderCoupons();
    $('#editCouponRate')?.focus();
  }
  if (saveBtn) {
    const code = saveBtn.dataset.savecoupon;
    const rate = Number($('#editCouponRate').value);
    if (rate) coupons[code].rate = rate / 100;
    coupons[code].expires = $('#editCouponExpires').value || null;
    saveCoupons(coupons);
    editingCoupon = null;
    renderCoupons();
    showToast('Cupón actualizado');
  }
});

// Todas las etiquetas (con o sin función) viven en la misma tabla, con el
// mismo look: lapicito para editar (nombre y función), ojo para ocultar sin
// borrar, tacho para borrar. Ninguna es especial ni está fija — la de
// descuento y la de "productos nuevos" son solo etiquetas con una función
// asignada, que se puede sacar, cambiar o borrar como cualquier otra.
let editingBadgeIdx = null;

const FN_LABELS = { autoNew: 'Auto-asignar a productos nuevos', discount: 'Detectar % de descuento del producto' };
const STYLE_LABELS = { minus: 'Ej: -20%', off: 'Ej: 20% OFF', desc: 'Ej: 20% de descuento', save: 'Ej: Ahorrás 20%' };

function badgeDisplayText(b) {
  return b.text;
}

function badgeNote(b) {
  if (b.fn === 'discount') return 'Función: detecta el % de descuento de cada producto y lo muestra solo.';
  if (b.fn === 'autoNew') return `Función: se autoasigna sola a productos creados hace menos de ${b.autoNewDays || 30} días.`;
  return '';
}

function renderBadgesTable() {
  $('#badgesTable tbody').innerHTML = customBadges.map((b, i) => {
    if (editingBadgeIdx === i) {
      return `
      <tr>
        <td>
          <input type="text" class="admin-table__edit" id="editBadgeText" value="${b.text}">
          <div class="admin-badge-fn-row">
            <select id="editBadgeFn">
              <option value="">Sin función especial</option>
              <option value="autoNew" ${b.fn === 'autoNew' ? 'selected' : ''}>${FN_LABELS.autoNew}</option>
              <option value="discount" ${b.fn === 'discount' ? 'selected' : ''}>${FN_LABELS.discount}</option>
            </select>
            <input type="number" id="editBadgeAutoNewDays" min="1" max="365" placeholder="Días" value="${b.autoNewDays || 30}" ${b.fn !== 'autoNew' ? 'hidden' : ''}>
            <select id="editBadgeDiscountStyle" ${b.fn !== 'discount' ? 'hidden' : ''}>
              ${Object.keys(STYLE_LABELS).map((k) => `<option value="${k}" ${b.discountStyle === k ? 'selected' : ''}>${STYLE_LABELS[k]}</option>`).join('')}
            </select>
          </div>
        </td>
        <td class="admin-table__actions">
          <button class="admin-icon-btn" data-savebadge="${i}" aria-label="Guardar" title="Guardar">${checkIcon}</button>
        </td>
      </tr>`;
    }
    const note = badgeNote(b);
    return `
    <tr style="${b.hidden ? 'opacity:.5' : ''}">
      <td>
        ${badgeDisplayText(b)}${b.hidden ? ' <span class="admin-stock-pill is-out">Oculta</span>' : ''}
        ${note ? `<div class="admin-table__edit-note">${note}</div>` : ''}
      </td>
      <td class="admin-table__actions">
        <button class="admin-icon-btn" data-togglebadge="${i}" aria-label="${b.hidden ? 'Mostrar' : 'Ocultar'}" title="${b.hidden ? 'Mostrar' : 'Ocultar'}">${b.hidden ? eyeOffIcon : eyeIcon}</button>
        <button class="admin-icon-btn" data-editbadge="${i}" aria-label="Editar" title="Editar">${pencilIcon}</button>
        <button class="admin-icon-btn admin-icon-btn--danger" data-delbadge="${i}" aria-label="Borrar" title="Borrar">${trashIcon}</button>
      </td>
    </tr>`;
  }).join('');
}

function renderBadgeSelectOptions() {
  const sel = productForm.badge;
  const current = sel.value;
  sel.innerHTML = [
    '<option value="">Sin etiqueta</option>',
    ...customBadges.filter((b) => !b.hidden && b.fn !== 'discount').map((b) => `<option value="${b.text}">${b.text}</option>`),
  ].join('');
  sel.value = current;
}

$('#badgeDiscountStyleInput').innerHTML = Object.keys(STYLE_LABELS)
  .map((k) => `<option value="${k}">${STYLE_LABELS[k]}</option>`).join('');

$('#badgeFnInput').addEventListener('change', (e) => {
  const fn = e.target.value;
  $('#badgeAutoNewDaysRow').hidden = fn !== 'autoNew';
  $('#badgeDiscountStyleRow').hidden = fn !== 'discount';
});

$('#badgeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(e.target, 'Escribí el texto de la etiqueta antes de agregarla.')) return;
  const fn = $('#badgeFnInput').value || null;
  const text = $('#badgeTextInput').value.trim();
  if (!text || customBadges.some((b) => b.text === text)) return;
  const badge = { text, hidden: false, fn };
  if (fn === 'autoNew') badge.autoNewDays = Number($('#badgeAutoNewDaysInput').value) || 30;
  if (fn === 'discount') badge.discountStyle = $('#badgeDiscountStyleInput').value;
  if (fn) customBadges.forEach((b) => { if (b.fn === fn) b.fn = null; });
  customBadges.push(badge);
  saveCustomBadges(customBadges);
  renderBadgesTable();
  renderBadgeSelectOptions();
  e.target.reset();
  $('#badgeAutoNewDaysRow').hidden = true;
  $('#badgeDiscountStyleRow').hidden = true;
  showToast(`Etiqueta "${text}" agregada`);
});

$('#badgesTable').addEventListener('change', (e) => {
  if (e.target.id !== 'editBadgeFn') return;
  const fn = e.target.value;
  $('#editBadgeAutoNewDays').hidden = fn !== 'autoNew';
  $('#editBadgeDiscountStyle').hidden = fn !== 'discount';
});

$('#badgesTable').addEventListener('click', (e) => {
  const delBtn = e.target.closest('[data-delbadge]');
  const toggleBtn = e.target.closest('[data-togglebadge]');
  const editBtn = e.target.closest('[data-editbadge]');
  const saveBtn = e.target.closest('[data-savebadge]');
  if (delBtn) {
    customBadges.splice(Number(delBtn.dataset.delbadge), 1);
    saveCustomBadges(customBadges);
    renderBadgesTable();
    renderBadgeSelectOptions();
    showToast('Etiqueta eliminada');
  }
  if (toggleBtn) {
    const idx = Number(toggleBtn.dataset.togglebadge);
    customBadges[idx].hidden = !customBadges[idx].hidden;
    saveCustomBadges(customBadges);
    renderBadgesTable();
    renderBadgeSelectOptions();
    showToast(customBadges[idx].hidden ? 'Etiqueta oculta' : 'Etiqueta visible de nuevo');
  }
  if (editBtn) {
    editingBadgeIdx = Number(editBtn.dataset.editbadge);
    renderBadgesTable();
    $('#editBadgeText')?.focus();
  }
  if (saveBtn) {
    const idx = Number(saveBtn.dataset.savebadge);
    const fn = $('#editBadgeFn').value || null;
    const text = $('#editBadgeText').value.trim();
    if (text) customBadges[idx].text = text;
    if (fn === 'autoNew') customBadges[idx].autoNewDays = Number($('#editBadgeAutoNewDays').value) || 30;
    if (fn === 'discount') customBadges[idx].discountStyle = $('#editBadgeDiscountStyle').value;
    if (fn) customBadges.forEach((b, j) => { if (j !== idx && b.fn === fn) b.fn = null; });
    customBadges[idx].fn = fn;
    saveCustomBadges(customBadges);
    editingBadgeIdx = null;
    renderBadgesTable();
    renderBadgeSelectOptions();
    showToast('Etiqueta actualizada');
  }
});

// --- categorías ---
let editingCatIdx = null;

function renderCategoriesTable() {
  $('#categoriesTable tbody').innerHTML = categories.map((c, i) => {
    if (editingCatIdx === i) {
      return `
      <tr>
        <td><input type="text" class="admin-table__edit" id="editCatLabel" value="${c.label}"></td>
        <td class="admin-table__actions">
          <button class="admin-icon-btn" data-savecat="${i}" aria-label="Guardar" title="Guardar">${checkIcon}</button>
        </td>
      </tr>`;
    }
    return `
    <tr style="${c.hidden ? 'opacity:.5' : ''}">
      <td>${c.label}${c.hidden ? ' <span class="admin-stock-pill is-out">Oculta</span>' : ''}</td>
      <td class="admin-table__actions">
        <button class="admin-icon-btn" data-togglecat="${i}" aria-label="${c.hidden ? 'Mostrar' : 'Ocultar'}" title="${c.hidden ? 'Mostrar' : 'Ocultar'}">${c.hidden ? eyeOffIcon : eyeIcon}</button>
        <button class="admin-icon-btn" data-editcat="${i}" aria-label="Editar" title="Editar">${pencilIcon}</button>
        <button class="admin-icon-btn admin-icon-btn--danger" data-delcat="${i}" aria-label="Borrar" title="Borrar">${trashIcon}</button>
      </td>
    </tr>`;
  }).join('');
}

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');

function slugify(text) {
  const base = text.trim().toLowerCase()
    .normalize('NFD').replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let slug = base || 'categoria';
  let n = 2;
  while (categories.some((c) => c.slug === slug)) { slug = `${base}-${n}`; n++; }
  return slug;
}

function renderCategoryOptions() {
  const options = categories.map((c) => `<option value="${c.slug}">${c.label}</option>`).join('');
  const formSel = productForm.category;
  const current = formSel.value;
  formSel.innerHTML = options;
  formSel.value = current;
  const filterSel = $('#productFilterCategory');
  const currentFilter = filterSel.value;
  filterSel.innerHTML = '<option value="">Todas las categorías</option>' + options;
  filterSel.value = currentFilter;
}

$('#categoryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(e.target, 'Escribí el nombre de la categoría antes de agregarla.')) return;
  const label = $('#categoryLabelInput').value.trim();
  if (!label) return;
  categories.push({ slug: slugify(label), label });
  saveCategories(categories);
  renderCategoriesTable();
  renderCategoryOptions();
  e.target.reset();
  showToast(`Categoría "${label}" agregada`);
});

$('#categoriesTable').addEventListener('click', (e) => {
  const delBtn = e.target.closest('[data-delcat]');
  const toggleBtn = e.target.closest('[data-togglecat]');
  const editBtn = e.target.closest('[data-editcat]');
  const saveBtn = e.target.closest('[data-savecat]');
  if (delBtn) {
    const idx = Number(delBtn.dataset.delcat);
    const inUse = products.filter((p) => p.category === categories[idx].slug).length;
    if (inUse && !confirm(`${inUse} producto${inUse > 1 ? 's' : ''} usan esta categoría. ¿Borrarla igual?`)) return;
    categories.splice(idx, 1);
    saveCategories(categories);
    renderCategoriesTable();
    renderCategoryOptions();
    showToast('Categoría eliminada');
  }
  if (toggleBtn) {
    const idx = Number(toggleBtn.dataset.togglecat);
    categories[idx].hidden = !categories[idx].hidden;
    saveCategories(categories);
    renderCategoriesTable();
    showToast(categories[idx].hidden ? 'Categoría oculta de la tienda' : 'Categoría visible de nuevo');
  }
  if (editBtn) {
    editingCatIdx = Number(editBtn.dataset.editcat);
    renderCategoriesTable();
    $('#editCatLabel')?.focus();
  }
  if (saveBtn) {
    const idx = Number(saveBtn.dataset.savecat);
    const label = $('#editCatLabel').value.trim();
    if (label) categories[idx].label = label;
    saveCategories(categories);
    editingCatIdx = null;
    renderCategoriesTable();
    renderCategoryOptions();
    renderProducts();
    showToast('Categoría actualizada');
  }
});

// --- talles (agrupados por categoría: prendas, calzado, etc) ---
function slugifySizeGroup(text) {
  const base = text.trim().toLowerCase()
    .normalize('NFD').replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let slug = base || 'talles';
  let n = 2;
  while (sizeGroups.some((g) => g.key === slug)) { slug = `${base}-${n}`; n++; }
  return slug;
}

function renderSizeTypeOptions() {
  const current = productForm.sizeType.value;
  productForm.sizeType.innerHTML = sizeGroups.map((g) => `<option value="${g.key}">${g.label}</option>`).join('');
  if (sizeGroups.some((g) => g.key === current)) productForm.sizeType.value = current;
}

function renderSizeGroupsSection() {
  $('#sizeGroupsList').innerHTML = sizeGroups.map((g) => `
    <div class="admin-size-group">
      <div class="admin-size-group__head">
        <h3>${g.label}</h3>
        <button type="button" class="admin-icon-btn admin-icon-btn--danger" data-delgroup="${g.key}" aria-label="Borrar categoría de talles" title="Borrar categoría">${trashIcon}</button>
      </div>
      ${g.sizes.length ? `
      <div class="admin-size-chips">
        ${g.sizes.map((s, i) => `
          <span class="admin-size-chip">
            <button type="button" class="admin-size-chip__move" data-moveleft="${g.key}:${i}" aria-label="Mover ${s} antes" ${i === 0 ? 'disabled' : ''}>${chevronLeftIcon}</button>
            ${s}
            <button type="button" class="admin-size-chip__move" data-moveright="${g.key}:${i}" aria-label="Mover ${s} después" ${i === g.sizes.length - 1 ? 'disabled' : ''}>${chevronRightIcon}</button>
            <button type="button" data-delsize="${g.key}:${s}" aria-label="Quitar talle ${s}">${xIcon}</button>
          </span>
        `).join('')}
      </div>` : '<p class="admin-size-empty">Todavía no hay talles en esta categoría.</p>'}
      <form class="admin-size-add-form" data-addsize="${g.key}" novalidate>
        <p class="form-alert" hidden></p>
        <input type="text" placeholder="Nuevo talle" required>
        <button type="submit" class="btn btn--ghost">+ Agregar talle</button>
      </form>
    </div>
  `).join('');
}

$('#sizeGroupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(e.target, 'Escribí el nombre de la categoría antes de agregarla.')) return;
  const label = $('#sizeGroupLabelInput').value.trim();
  if (!label) return;
  sizeGroups.push({ key: slugifySizeGroup(label), label, sizes: [] });
  saveSizeGroups(sizeGroups);
  renderSizeGroupsSection();
  renderSizeTypeOptions();
  e.target.reset();
  showToast(`Categoría de talles "${label}" agregada`);
});

$('#sizeGroupsList').addEventListener('click', (e) => {
  const delGroupBtn = e.target.closest('[data-delgroup]');
  const delSizeBtn = e.target.closest('[data-delsize]');
  const moveLeftBtn = e.target.closest('[data-moveleft]');
  const moveRightBtn = e.target.closest('[data-moveright]');

  if (moveLeftBtn || moveRightBtn) {
    const raw = moveLeftBtn ? moveLeftBtn.dataset.moveleft : moveRightBtn.dataset.moveright;
    const [key, idxStr] = raw.split(':');
    const idx = Number(idxStr);
    const group = sizeGroups.find((g) => g.key === key);
    if (!group) return;
    const target = moveLeftBtn ? idx - 1 : idx + 1;
    if (target < 0 || target >= group.sizes.length) return;
    [group.sizes[idx], group.sizes[target]] = [group.sizes[target], group.sizes[idx]];
    saveSizeGroups(sizeGroups);
    renderSizeGroupsSection();
    return;
  }

  if (delGroupBtn) {
    const key = delGroupBtn.dataset.delgroup;
    if (sizeGroups.length <= 1) { showToast('Tiene que quedar al menos una categoría de talles'); return; }
    const inUse = products.filter((p) => (p.sizeType || 'unico') === key).length;
    if (inUse && !confirm(`${inUse} producto${inUse > 1 ? 's' : ''} usan esta categoría de talles. ¿Borrarla igual?`)) return;
    sizeGroups = sizeGroups.filter((g) => g.key !== key);
    saveSizeGroups(sizeGroups);
    renderSizeGroupsSection();
    renderSizeTypeOptions();
    showToast('Categoría de talles eliminada');
  }

  if (delSizeBtn) {
    const [key, size] = delSizeBtn.dataset.delsize.split(':');
    const group = sizeGroups.find((g) => g.key === key);
    if (!group) return;
    if (group.sizes.length <= 1) { showToast('Tiene que quedar al menos un talle en esta categoría'); return; }
    const inUse = products.filter((p) => (p.sizeType || 'unico') === key && (p.sizes || []).includes(size)).length;
    if (inUse && !confirm(`${inUse} producto${inUse > 1 ? 's' : ''} usan el talle "${size}". ¿Quitarlo igual?`)) return;
    group.sizes = group.sizes.filter((s) => s !== size);
    saveSizeGroups(sizeGroups);
    renderSizeGroupsSection();
    showToast(`Talle "${size}" eliminado`);
  }
});

$('#sizeGroupsList').addEventListener('submit', (e) => {
  const form = e.target.closest('[data-addsize]');
  if (!form) return;
  e.preventDefault();
  if (!validateForm(form, 'Escribí un talle antes de agregarlo.')) return;
  const key = form.dataset.addsize;
  const input = form.querySelector('input');
  const value = input.value.trim();
  const group = sizeGroups.find((g) => g.key === key);
  if (!group || !value) return;
  if (group.sizes.includes(value)) { showToast('Ese talle ya existe en esta categoría'); return; }
  group.sizes.push(value);
  saveSizeGroups(sizeGroups);
  renderSizeGroupsSection();
  input.value = '';
  showToast(`Talle "${value}" agregado`);
});

// --- modal de producto ---
const productForm = $('#productForm');
const stockGrid = $('#stockGrid');
const overlay = $('#productOverlay');

function sizesForGroup(key) {
  return sizeGroups.find((g) => g.key === key)?.sizes || [];
}

const sizePicker = $('#sizePicker');

const stockTotalEl = $('#stockTotal');

// El admin no pisa el número final: carga cuánto entra o sale, y acá se
// suma/resta sobre lo que ya había (así no se pierde de vista el stock real
// por escribir mal un número).
function buildStockGrid(sizes, stockValues = {}) {
  stockGrid.innerHTML = sizes.map((s) => {
    const current = Number(stockValues[s] || 0);
    return `
    <div class="admin-stock-row" data-size="${s}">
      <span class="admin-stock-row__size">${s}</span>
      <span class="admin-stock-row__current" data-current="${current}">${current} en stock</span>
      <input type="number" step="1" class="admin-stock-row__delta" data-size="${s}" placeholder="+/-">
      <span class="admin-stock-row__result">= ${current}</span>
    </div>`;
  }).join('');
  updateStockTotal();
}

function updateStockTotal() {
  let total = 0;
  $$('.admin-stock-row', stockGrid).forEach((row) => {
    const current = Number(row.querySelector('.admin-stock-row__current').dataset.current);
    const delta = Number(row.querySelector('.admin-stock-row__delta').value) || 0;
    const result = Math.max(0, current + delta);
    row.querySelector('.admin-stock-row__result').textContent = `= ${result}`;
    total += result;
  });
  stockTotalEl.textContent = `Stock total: ${total} unidad${total === 1 ? '' : 'es'}`;
}

stockGrid.addEventListener('input', (e) => {
  if (e.target.classList.contains('admin-stock-row__delta')) updateStockTotal();
});

function renderSizePicker(selected = []) {
  const options = sizesForGroup(productForm.sizeType.value);
  sizePicker.innerHTML = options.map((s) =>
    `<button type="button" class="size-btn${selected.includes(s) ? ' is-active' : ''}" data-size="${s}">${s}</button>`
  ).join('');
  productForm.sizes.value = selected.filter((s) => options.includes(s)).join(',');
}

sizePicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.size-btn');
  if (!btn) return;
  btn.classList.toggle('is-active');
  const selected = $$('.size-btn.is-active', sizePicker).map((b) => b.dataset.size);
  productForm.sizes.value = selected.join(',');
  const existing = {};
  $$('.admin-stock-row', stockGrid).forEach((row) => { existing[row.dataset.size] = row.querySelector('.admin-stock-row__current').dataset.current; });
  buildStockGrid(selected, existing);
});

// si la categoría de talles tiene un solo valor (ej: "Único") lo dejamos
// preseleccionado, así el admin no tiene que tocarlo aparte.
productForm.sizeType.addEventListener('change', () => {
  const options = sizesForGroup(productForm.sizeType.value);
  const preselected = options.length === 1 ? options : [];
  renderSizePicker(preselected);
  buildStockGrid(preselected);
});

const gallery = $('#productGallery');
const imgFile = $('#productImgFile');
const imgUrlInput = $('#productImgUrl');
let currentImages = [];

function renderGallery() {
  gallery.innerHTML = currentImages.map((src, i) => `
    <div class="admin-gallery__item">
      <img src="${src}" alt="">
      ${i === 0
        ? '<span class="admin-gallery__cover">Portada</span>'
        : `<button type="button" class="admin-gallery__setcover" data-cover="${i}" title="Usar como portada">★</button>`}
      <button type="button" class="admin-gallery__remove" data-idx="${i}" aria-label="Quitar foto">×</button>
    </div>
  `).join('');
  productForm.img.value = currentImages[0] || '';
}

function setGallery(images) {
  currentImages = images ? [...images] : [];
  renderGallery();
}

function addImage(src) {
  if (!src) return;
  currentImages.push(src);
  renderGallery();
}

gallery.addEventListener('click', (e) => {
  const delBtn = e.target.closest('[data-idx]');
  const coverBtn = e.target.closest('[data-cover]');
  if (delBtn) {
    currentImages.splice(Number(delBtn.dataset.idx), 1);
    renderGallery();
  }
  if (coverBtn) {
    const idx = Number(coverBtn.dataset.cover);
    const [chosen] = currentImages.splice(idx, 1);
    currentImages.unshift(chosen);
    renderGallery();
  }
});

imgUrlInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  addImage(imgUrlInput.value.trim());
  imgUrlInput.value = '';
});

// Precio, % de descuento y "precio final" se mantienen en sincro entre sí:
// cambiar cualquiera de los tres recalcula los otros dos.
const finalPriceRow = $('#finalPriceRow');
const finalPriceInput = $('#finalPriceInput');

function refreshFinalPriceFromDiscount() {
  const base = Number(productForm.price.value) || 0;
  const pct = Number(productForm.discount.value) || 0;
  if (!base || !pct) { finalPriceRow.hidden = true; return; }
  finalPriceRow.hidden = false;
  finalPriceInput.value = Math.round(base * (1 - pct / 100));
}

function refreshDiscountFromFinalPrice() {
  const base = Number(productForm.price.value) || 0;
  const final = Number(finalPriceInput.value) || 0;
  if (!base || !final || final >= base) { productForm.discount.value = ''; finalPriceRow.hidden = true; return; }
  productForm.discount.value = Math.round((1 - final / base) * 100);
}

productForm.price.addEventListener('input', refreshFinalPriceFromDiscount);
productForm.discount.addEventListener('input', refreshFinalPriceFromDiscount);
finalPriceInput.addEventListener('input', refreshDiscountFromFinalPrice);

imgFile.addEventListener('change', () => {
  [...imgFile.files].forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => addImage(reader.result);
    reader.readAsDataURL(file);
  });
  imgFile.value = '';
});

function openProductModal(product) {
  productForm.reset();
  imgFile.value = '';
  renderBadgeSelectOptions();
  if (product) {
    $('#productModalTitle').textContent = 'Editar producto';
    productForm.productId.value = product.id;
    productForm.productName.value = product.name;
    productForm.category.value = product.category;
    productForm.badge.value = product.badge || '';
    productForm.price.value = product.oldPrice || product.price;
    productForm.discount.value = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : '';
    productForm.color.value = product.color;
    productForm.sizeType.value = product.sizeType || 'unico';
    productForm.desc.value = product.desc || '';
    renderSizePicker(product.sizes);
    buildStockGrid(product.sizes, product.stock || {});
    setGallery(product.images && product.images.length ? product.images : (product.img ? [product.img] : []));
  } else {
    $('#productModalTitle').textContent = 'Agregar producto';
    productForm.productId.value = '';
    productForm.sizeType.value = 'ropa';
    productForm.badge.value = 'Nuevo';
    renderSizePicker([]);
    buildStockGrid([]);
    setGallery([]);
  }
  refreshFinalPriceFromDiscount();
  overlay.classList.add('is-open');
}

function closeProductModal() {
  overlay.classList.remove('is-open');
}

$('#addProductBtn').addEventListener('click', () => openProductModal(null));
$('#cancelProductBtn').addEventListener('click', closeProductModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProductModal(); });

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(e.target, 'Completá los campos obligatorios antes de guardar el producto.')) return;
  const sizes = productForm.sizes.value.split(',').map((s) => s.trim()).filter(Boolean);
  if (!sizes.length) { showToast('Elegí al menos un talle'); return; }
  if (!currentImages.length) { showToast('Agregá al menos una foto'); return; }
  const stock = {};
  $$('.admin-stock-row', stockGrid).forEach((row) => {
    const current = Number(row.querySelector('.admin-stock-row__current').dataset.current);
    const delta = Number(row.querySelector('.admin-stock-row__delta').value) || 0;
    stock[row.dataset.size] = Math.max(0, current + delta);
  });
  const sizeType = productForm.sizeType.value === 'unico' ? null : productForm.sizeType.value;
  const id = productForm.productId.value || nextProductId(products);
  const basePrice = Number(productForm.price.value) || 0;
  const discountPct = Number(productForm.discount.value) || 0;
  // Se usa el "precio final" tal cual lo dejó el admin (puede haberlo tipeado
  // directo), en vez de recalcularlo desde el % ya redondeado.
  const finalPrice = discountPct > 0 ? (Number(finalPriceInput.value) || Math.round(basePrice * (1 - discountPct / 100))) : basePrice;
  const idx = products.findIndex((p) => p.id === id);
  const isNew = idx < 0;
  const data = {
    id,
    name: productForm.productName.value.trim(),
    category: productForm.category.value,
    price: finalPrice,
    ...(discountPct > 0 ? { oldPrice: basePrice } : {}),
    ...(productForm.badge.value ? { badge: productForm.badge.value } : {}),
    img: currentImages[0],
    images: currentImages,
    color: productForm.color.value.trim(),
    sizeType,
    sizes,
    stock,
    desc: productForm.desc.value.trim(),
    createdAt: isNew ? Date.now() : products[idx].createdAt,
  };
  if (isNew) products.push(data); else products[idx] = data;
  saveProducts(products);
  renderProducts();
  closeProductModal();
  showToast(isNew ? 'Producto agregado' : 'Producto actualizado');
});

$('#productsTable').addEventListener('click', (e) => {
  const editBtn = e.target.closest('[data-edit]');
  const delBtn = e.target.closest('[data-del]');
  const toggleBtn = e.target.closest('[data-toggle]');
  if (editBtn) {
    const p = products.find((x) => x.id === editBtn.dataset.edit);
    if (p) openProductModal(p);
  }
  if (delBtn) {
    if (!confirm('¿Borrar este producto? No se puede deshacer.')) return;
    products = products.filter((p) => p.id !== delBtn.dataset.del);
    saveProducts(products);
    renderProducts();
    showToast('Producto eliminado');
  }
  if (toggleBtn) {
    const p = products.find((x) => x.id === toggleBtn.dataset.toggle);
    if (!p) return;
    p.hidden = !p.hidden;
    saveProducts(products);
    renderProducts();
    showToast(p.hidden ? 'Producto oculto de la tienda' : 'Producto visible de nuevo');
  }
});

$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Esto borra productos nuevos, ediciones, cupones y descuentos, y vuelve a los valores originales. ¿Continuar?')) return;
  resetAdminData();
  products = getRawProducts();
  coupons = getCoupons();
  customBadges = getCustomBadges();
  categories = getCategories();
  sizeGroups = getSizeGroups();
  renderProducts();
  renderCoupons();
  renderDiscount();
  renderBadgesTable();
  renderBadgeSelectOptions();
  renderCategoriesTable();
  renderCategoryOptions();
  renderSizeGroupsSection();
  renderSizeTypeOptions();
  showToast('Valores restaurados');
});

$('#productSearch').addEventListener('input', renderProducts);
$('#productFilterCategory').addEventListener('change', renderProducts);
$('#productSort').addEventListener('change', renderProducts);

renderCategoriesTable();
renderCategoryOptions();
renderSizeGroupsSection();
renderSizeTypeOptions();
renderProducts();
renderCoupons();
renderDiscount();
renderBadgesTable();
renderBadgeSelectOptions();
