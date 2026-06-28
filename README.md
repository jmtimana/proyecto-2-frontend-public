[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/vHoPmQxV)

# SkillMatch — Frontend

Frontend en **React + TypeScript + Vite + react-bootstrap** para la plataforma SkillMatch.

---

## Cómo correrlo (paso a paso)

### 1. Instala las dependencias
Necesitas tener instalado **Node.js** (versión 18 o superior). Luego, en esta carpeta:

```bash
npm install
```

### 2. Configura la URL de tu backend
Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Abre el `.env` y pon la URL real de tu backend (con el prefijo `/api/v1`):

```
VITE_API_BASE_URL=https://skillmatch-tim.duckdns.org/api/v1
```

### 3. Arranca la app
```bash
npm run dev
```

Abre el navegador en la dirección que te muestre (normalmente **http://localhost:5173**).

---

## Estructura del proyecto

```
src/
  api/            -> llamadas al backend + tipos + config de axios (interceptores, refresh token)
  context/        -> AuthContext (la "memoria" de la sesión)
  components/     -> guards de rutas (ProtectedRoute, RoleRoute)
  common/         -> componentes compartidos (Navbar, Pagination, ErrorBoundary, OfertaQR...)
  hooks/          -> hooks reutilizables (useFetch, useDebounce, usePaginationParams)
  pages/          -> cada pantalla (Home, Login, Ofertas, Evaluaciones, Dashboard...)
  utils/          -> helpers (tokenStorage, constantes)
  main.tsx        -> punto de arranque
  Router.tsx      -> qué pantalla se ve en cada URL (con lazy loading)
```

---

## Cambiar el color de marca

Todo el morado sale de una sola variable. Edita `src/index.css`:

```css
:root {
  --brand: #534ab7;   /* cámbialo por el color que quieras */
}
```
