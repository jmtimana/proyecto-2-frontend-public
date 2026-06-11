import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite. El "server.port" define en qué dirección local
// verás la app cuando corras "npm run dev" (por defecto http://localhost:5173).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
