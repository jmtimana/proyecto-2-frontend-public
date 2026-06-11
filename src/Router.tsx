import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ofertas from './pages/Ofertas';
import OfertaDetail from './pages/OfertaDetail';
import EmpresaOfertas from './pages/EmpresaOfertas';
import CrearOferta from './pages/CrearOferta';
import Postulantes from './pages/Postulantes';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

export default function Router() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/ofertas" element={<Ofertas />} />
      <Route path="/ofertas/:id" element={<OfertaDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Ruta protegida (cualquier usuario logueado) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rutas solo de EMPRESA */}
      <Route
        path="/empresa/ofertas"
        element={<RoleRoute role="ROLE_EMPRESA"><EmpresaOfertas /></RoleRoute>}
      />
      <Route
        path="/empresa/ofertas/nueva"
        element={<RoleRoute role="ROLE_EMPRESA"><CrearOferta /></RoleRoute>}
      />
      <Route
        path="/empresa/ofertas/:id/postulantes"
        element={<RoleRoute role="ROLE_EMPRESA"><Postulantes /></RoleRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
