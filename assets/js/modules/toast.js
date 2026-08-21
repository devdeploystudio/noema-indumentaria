import { $ } from './dom.js';

let toastTimer;

export function showToast(msg) {
  const toast = $('#toast');
  toast.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>${msg}`;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}
