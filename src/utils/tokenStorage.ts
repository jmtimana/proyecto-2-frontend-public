// =========================================================
// Guarda y lee los tokens en el navegador (localStorage).
// Lo aislamos aquí para que el resto del código no toque
// localStorage directamente; si mañana cambiamos la forma de
// guardar, solo editamos este archivo.
// =========================================================

const ACCESS_KEY = 'sm_access_token';
const REFRESH_KEY = 'sm_refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  save: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
