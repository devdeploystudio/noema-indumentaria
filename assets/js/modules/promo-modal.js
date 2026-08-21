import { $ } from './dom.js';

const modal = $('#promoModal');

if (modal) {
  const SEEN_KEY = 'noema_promo_seen';

  if (!localStorage.getItem(SEEN_KEY)) {
    const openPromo = () => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); };
    const closePromo = () => {
      modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
      localStorage.setItem(SEEN_KEY, '1');
    };

    const timer = setTimeout(openPromo, 1800);
    $('#promoClose').addEventListener('click', closePromo);
    $('#promoSkip').addEventListener('click', closePromo);
    modal.addEventListener('click', (e) => { if (e.target === modal) closePromo(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closePromo();
    });

    $('#promoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = e.target.querySelector('input[type="email"]');
      if (!input.checkValidity()) { input.classList.add('is-invalid'); return; }
      clearTimeout(timer);
      modal.classList.add('is-success');
      localStorage.setItem(SEEN_KEY, '1');
    });
  }
}
