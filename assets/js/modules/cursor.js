import { $ } from './dom.js';

export function initCursor() {
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  if (!dot || !ring || matchMedia('(pointer:coarse)').matches) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    const onDark = !!e.target.closest('.footer, .promo__copy, .admin-topbar, .admin-shell .footer');
    dot.classList.toggle('is-on-dark', onDark);
    ring.classList.toggle('is-on-dark', onDark);
  });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a,button,input,select,.tab,.product,.collection')) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a,button,input,select,.tab,.product,.collection')) ring.classList.remove('is-active');
  });
}
