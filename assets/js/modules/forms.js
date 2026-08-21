import { $ } from './dom.js';
import { showToast } from './toast.js';
import { validateForm } from './checkout.js';
import { DEMO_ORDERS } from './data.js';

// Campos marcados con data-only="letters" o data-only="digits" solo dejan
// tipear eso — así nadie carga un teléfono con letras ni un nombre con
// números. Va por delegación en document así vale para cualquier form.
// Captura (no bubbling) para filtrar ANTES que cualquier otro listener
// propio del campo (ej. la vista previa de la tarjeta), y que no se
// desincronicen por un instante con el caracter inválido.
document.addEventListener('input', (e) => {
  const only = e.target.dataset?.only;
  if (!only) return;
  const before = e.target.value;
  const start = e.target.selectionStart;
  const after = only === 'digits'
    ? before.replace(/\D/g, '')
    : before.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
  if (after === before) return;
  e.target.value = after;
  const pos = start - (before.length - after.length);
  e.target.setSelectionRange(pos, pos);
}, true);

const newsletterForm = $('#newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('¡Gracias por sumarte! Revisá tu email.');
    e.target.reset();
  });
}

const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(contactForm)) return;
    showToast('¡Mensaje enviado! Te respondemos a la brevedad.');
    contactForm.reset();
  });
}

// consulta de estado de pedido: demo sin backend real
const orderLookupForm = $('#orderLookupForm');
if (orderLookupForm) {
  const TRACK_STEPS = ['Pago confirmado', 'Preparando pedido', 'Despachado', 'En camino', 'Entregado'];

  function renderTrack(activeIndex) {
    return TRACK_STEPS.map((label, i) => {
      const cls = i < activeIndex ? 'is-done' : i === activeIndex ? 'is-active' : '';
      return `<li class="${cls}"><span class="order-track__dot"></span><span class="order-track__label">${label}</span></li>`;
    }).join('');
  }

  function showResult(numero) {
    const code = (numero.startsWith('#') ? numero.slice(1) : numero).toUpperCase();
    const demo = DEMO_ORDERS[code];
    // Si el código no es uno de los 5 de demo, cae al estado "en camino"
    // de siempre (para que cualquier texto que se pruebe siga funcionando).
    const stage = demo ? demo.stage : 3;
    const label = demo ? demo.label : 'En camino';
    const eta = new Date(Date.now() + 3 * 86400000);

    $('#orderResultNumber').textContent = '#' + code;
    $('#orderStatusLabel').textContent = label;
    $('#orderTrack').innerHTML = renderTrack(stage);
    $('#orderResultCarrier').textContent = stage >= 2 ? 'Correo Argentino' : 'A definir al despachar';
    $('#orderResultDate').textContent = eta.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
    $('#orderResult').hidden = false;
  }

  orderLookupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(orderLookupForm)) return;
    showResult(orderLookupForm.pedido.value.trim());
  });

  // Si venís del botón "Seguir mi envío" del checkout, llega con el
  // pedido y el email ya en la URL: los completamos, pero el resultado
  // se muestra recién cuando aprieta "Buscar pedido", como con cualquier
  // otra búsqueda.
  const params = new URLSearchParams(window.location.search);
  const pedidoParam = params.get('pedido');
  if (pedidoParam) {
    orderLookupForm.pedido.value = pedidoParam;
    orderLookupForm.email.value = params.get('email') || '';
  }
}
