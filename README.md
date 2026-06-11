# SkillMatch — Frontend

Frontend en **React + TypeScript + Vite + react-bootstrap** para la plataforma SkillMatch.

Este es el **andamiaje inicial**: trae login, registro y un dashboard funcionando
de verdad contra tu backend. Las demás pantallas (ofertas, evaluaciones,
postulaciones, etc.) se irán agregando una por una.

---

## Cómo correrlo (paso a paso)

### 1. Instala las dependencias
Necesitas tener instalado **Node.js** (versión 18 o superior). Luego, en esta carpeta:

```bash
npm install
```

Esto descarga todas las librerías (React, react-bootstrap, axios...). Se hace una sola vez.

### 2. Configura la URL de tu backend
Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Abre el `.env` y pon la URL real de tu backend (con el prefijo `/api/v1`):

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 3. Arranca la app
```bash
npm run dev
```

Abre el navegador en la dirección que te muestre (normalmente **http://localhost:5173**).

---

## Qué puedes probar ya

- **Registrarte** (como estudiante o empresa) en `/register`.
- **Iniciar sesión** en `/login`.
- Al entrar, te lleva al **Dashboard** que muestra tus datos de sesión.

> Para que login/registro funcionen, tu backend tiene que estar corriendo
> y aceptar peticiones desde este frontend (revisa la config de CORS).

---

## Estructura del proyecto

```
src/
  api/            -> llamadas al backend (AuthApi) + tipos + config de axios
  context/        -> AuthContext (la "memoria" de la sesión)
  components/     -> guards de rutas (ProtectedRoute, RoleRoute)
  common/         -> componentes compartidos (Navbar)
  pages/          -> cada pantalla (Home, Login, Register, Dashboard)
  utils/          -> helpers (tokenStorage, constantes)
  main.tsx        -> punto de arranque
  Router.tsx      -> qué pantalla se ve en cada URL
```

---

## Cambiar el color de marca

Todo el morado sale de una sola variable. Edita `src/index.css`:

```css
:root {
  --brand: #534ab7;   /* cámbialo por el color que quieras */
}
```
