// Demo sin backend real: el usuario/contraseña vive acá mismo, a la vista de
// cualquiera que abra el archivo. Sirve para mostrar el flujo de login, pero
// antes de entregarle esto a un cliente real hay que cambiar estas
// credenciales (y saber que no reemplazan una autenticación real).
export const DEMO_ADMIN = { user: 'admin', pass: 'noema2026' };

const LS_AUTH = 'noema_admin_auth';

export function isAuthed() {
  return localStorage.getItem(LS_AUTH) === '1';
}

export function login(user, pass) {
  if (user.trim() === DEMO_ADMIN.user && pass === DEMO_ADMIN.pass) {
    localStorage.setItem(LS_AUTH, '1');
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(LS_AUTH);
}
