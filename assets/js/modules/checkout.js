import { $, $$ } from './dom.js';
import { money } from './format.js';
import { DEMO_ORDERS } from './data.js';
import { PRODUCTS, COUPONS } from './admin-store.js';
import { store, saveCart, cartTotal } from './store.js';
import { mediaHTML } from './product-card.js';
import { renderCart, updateBadges } from './cart.js';
import { variantText } from './sizes.js';

const SHIPPING_FLAT = 4500, FREE_SHIPPING_FROM = 80000;

const checkoutPage = $('#checkoutPage');
if (checkoutPage) {
  if (store.cart.length === 0) {
    window.location.href = 'pages/tienda/productos.html';
  } else {
    renderCheckoutSummary();
    goToStep(1);
  }
}

const doneBtn = $('#doneBtn');
if (doneBtn) doneBtn.addEventListener('click', () => { window.location.href = 'index.html'; });

function renderCheckoutSummary() {
  $('#checkoutSummaryItems').innerHTML = store.cart.map((l) => {
    const p = PRODUCTS.find((x) => x.id === l.id);
    return `<div class="summary-item">
      <div class="summary-item__media">${mediaHTML(p)}</div>
      <span class="summary-item__name">${p.name}<small class="summary-item__variant">${variantText(p, l.size)}</small></span>
      <span class="summary-item__qty">×${l.qty}</span>
      <span class="summary-item__price">${money(p.price * l.qty)}</span>
    </div>`;
  }).join('');
  const subtotal = cartTotal();
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT;
  const discount = store.coupon ? Math.round(subtotal * store.coupon.rate) : 0;
  $('#sumSubtotal').textContent = money(subtotal);
  const discountRow = $('#sumDiscountRow');
  if (discountRow) {
    discountRow.hidden = discount === 0;
    $('#sumDiscount').textContent = '−' + money(discount);
  }
  $('#sumShipping').textContent = shipping === 0 ? 'Gratis' : money(shipping);
  $('#sumTotal').textContent = money(subtotal - discount + shipping);
}

const couponInput = $('#couponInput'), couponApply = $('#couponApply'), couponMsg = $('#couponMsg');
if (couponApply) {
  couponApply.addEventListener('click', () => {
    if (couponApply.dataset.applied) {
      store.coupon = null;
      couponInput.disabled = false; couponInput.value = '';
      couponApply.textContent = 'Aplicar'; delete couponApply.dataset.applied;
      couponMsg.hidden = true;
      renderCheckoutSummary();
      return;
    }
    const code = couponInput.value.trim().toUpperCase();
    if (!code) return;
    const coupon = COUPONS[code];
    const isExpired = coupon?.expires && new Date(`${coupon.expires}T23:59:59`) < new Date();
    if (coupon && !isExpired) {
      store.coupon = { code, rate: coupon.rate };
      couponMsg.textContent = `Cupón "${code}" aplicado: ${Math.round(coupon.rate * 100)}% OFF`;
      couponMsg.className = 'coupon__msg is-success';
      couponInput.disabled = true;
      couponApply.textContent = 'Quitar';
      couponApply.dataset.applied = '1';
    } else {
      store.coupon = null;
      couponMsg.textContent = isExpired ? 'Ese cupón ya venció.' : 'Cupón inválido o vencido.';
      couponMsg.className = 'coupon__msg is-error';
    }
    couponMsg.hidden = false;
    renderCheckoutSummary();
  });
  couponInput.addEventListener('input', () => { couponMsg.hidden = true; });
}

function goToStep(n) {
  $$('.checkout__step').forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === n));
  $$('#checkoutSteps > li[data-step]').forEach((li) => {
    const s = Number(li.dataset.step);
    li.classList.toggle('is-active', s === n);
    li.classList.toggle('is-done', s < n);
  });
  $$('#checkoutSteps > li.checkout__steps-line').forEach((line, i) => {
    line.classList.toggle('is-done', n > i + 1);
  });
}

export function validateForm(form) {
  const required = $$('input[required], textarea[required]', form);
  const invalids = required.filter((i) => !i.checkValidity());
  required.forEach((i) => i.classList.toggle('is-invalid', !i.checkValidity()));
  const alertEl = form.querySelector('.form-alert');
  if (alertEl) alertEl.hidden = invalids.length === 0;
  if (invalids.length) {
    invalids[0].focus();
    return false;
  }
  return true;
}

document.addEventListener('input', (e) => {
  if (!e.target.matches('input[required], textarea[required]')) return;
  if (e.target.checkValidity()) e.target.classList.remove('is-invalid');
  const form = e.target.closest('form');
  const alertEl = form && form.querySelector('.form-alert');
  if (alertEl) alertEl.hidden = true;
});

// lo que sigue sólo existe en /pages/tienda/checkout.html
const stepShipping = $('#stepShipping');
if (stepShipping) {
  stepShipping.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(stepShipping)) return;
    goToStep(2);
  });
  $$('[data-back]').forEach((b) => b.addEventListener('click', () => goToStep(Number(b.dataset.back))));

  const payMethods = $('#payMethods');
  payMethods.addEventListener('click', (e) => {
    const btn = e.target.closest('.pay-method');
    if (!btn) return;
    $$('.pay-method', payMethods).forEach((b) => b.classList.toggle('is-active', b === btn));
    $$('.pay-panel').forEach((p) => p.classList.remove('is-active'));
    const map = { tarjeta: 'panelTarjeta', mercadopago: 'panelMercadopago', transferencia: 'panelTransferencia' };
    $('#' + map[btn.dataset.method]).classList.add('is-active');
    const cardInputs = $$('#panelTarjeta input');
    cardInputs.forEach((i) => (i.required = btn.dataset.method === 'tarjeta'));
  });

  const cardNumber = $('#cardNumber'), cardName = $('#cardName'), cardExpiry = $('#cardExpiry'), cardCvv = $('#cardCvv');
  const cardBrand = $('#cardBrand'), pvNumber = $('#cardPreviewNumber'), pvName = $('#cardPreviewName'), pvExp = $('#cardPreviewExp');

  const detectBrand = (num) => {
    if (/^4/.test(num)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(num)) return 'MASTERCARD';
    if (/^3[47]/.test(num)) return 'AMEX';
    return 'NOEMA PAY';
  };
  cardNumber.addEventListener('input', () => {
    const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
    cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
    cardBrand.textContent = detectBrand(digits);
    pvNumber.textContent = digits ? digits.replace(/(.{4})/g, '$1 ').trim().padEnd(19, '•').slice(0, 19) : '•••• •••• •••• ••••';
  });
  cardName.addEventListener('input', () => { pvName.textContent = cardName.value.toUpperCase() || 'NOMBRE APELLIDO'; });
  cardExpiry.addEventListener('input', () => {
    let v = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    cardExpiry.value = v;
    pvExp.textContent = v || 'MM/AA';
  });
  cardCvv.addEventListener('input', () => { cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4); });

  $('#stepPayment').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(e.target)) return;
    const payBtn = $('#payBtn');
    payBtn.classList.add('is-loading'); payBtn.disabled = true;
    setTimeout(() => {
      payBtn.classList.remove('is-loading'); payBtn.disabled = false;
      const codes = Object.keys(DEMO_ORDERS);
      const code = codes[Math.floor(Math.random() * codes.length)];
      const email = encodeURIComponent(stepShipping.email.value.trim());
      $('#orderNumber').textContent = '#' + code;
      $('#trackOrderBtn').href = `pages/ayuda/estado-pedido.html?pedido=${code}&email=${email}`;
      goToStep(3);
      store.cart = []; saveCart(); updateBadges(); renderCart();
    }, 1400);
  });
}
