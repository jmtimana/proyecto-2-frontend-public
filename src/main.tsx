import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. El CSS de Bootstrap (de aquí salen los estilos de react-bootstrap).
import 'bootstrap/dist/css/bootstrap.min.css';
// 2. Nuestro CSS propio (va DESPUÉS para poder sobreescribir a Bootstrap).
import './index.css';

import App from './App';
import { AuthProvider } from './context/AuthContext';

// Aquí React "se monta" en el <div id="root"> del index.html.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* BrowserRouter habilita la navegación por URLs */}
    <BrowserRouter>
      {/* AuthProvider hace que "quién está logueado" esté disponible en toda la app */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
