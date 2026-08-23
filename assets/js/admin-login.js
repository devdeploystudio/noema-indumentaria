import { isAuthed, login, DEMO_ADMIN } from './modules/admin-auth.js';
import { initCursor } from './modules/cursor.js';

initCursor();

if (isAuthed()) {
  window.location.href = 'pages/admin/panel.html';
}

const form = document.getElementById('loginForm');
const alertEl = document.getElementById('loginAlert');

document.getElementById('demoHint').addEventListener('click', () => {
  form.user.value = DEMO_ADMIN.user;
  form.pass.value = DEMO_ADMIN.pass;
  alertEl.hidden = true;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (login(form.user.value, form.pass.value)) {
    window.location.href = 'pages/admin/panel.html';
  } else {
    alertEl.hidden = false;
  }
});
