import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ofertas from './pages/Ofertas';
import OfertaDetail from './pages/OfertaDetail';
import EmpresaOfertas from './pages/EmpresaOfertas';
import CrearOferta from './pages/CrearOferta';
import EditarOferta from './pages/EditarOferta';
import Postulantes from './pages/Postulantes';
import BuscarCandidatos from './pages/BuscarCandidatos';
import MisPostulaciones from './pages/MisPostulaciones';
import MiPerfil from './pages/MiPerfil';
import ConectarGitHub from './pages/ConectarGitHub';
import Evaluaciones from './pages/Evaluaciones';
import EvaluacionDetail from './pages/EvaluacionDetail';
import RendirEvaluacion from './pages/RendirEvaluacion';
import MisResultados from './pages/MisResultados';
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

      {/* Rutas para cualquier usuario logueado */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/github" element={<ProtectedRoute><ConectarGitHub /></ProtectedRoute>} />
      <Route path="/evaluaciones" element={<ProtectedRoute><Evaluaciones /></ProtectedRoute>} />
      <Route path="/evaluaciones/:id" element={<ProtectedRoute><EvaluacionDetail /></ProtectedRoute>} />
      <Route path="/evaluaciones/:id/rendir" element={<ProtectedRoute><RendirEvaluacion /></ProtectedRoute>} />
      <Route path="/mis-resultados" element={<ProtectedRoute><MisResultados /></ProtectedRoute>} />
      <Route path="/mis-postulaciones" element={<ProtectedRoute><MisPostulaciones /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />

      {/* Rutas solo de EMPRESA */}
      <Route path="/empresa/ofertas" element={<RoleRoute role="ROLE_EMPRESA"><EmpresaOfertas /></RoleRoute>} />
      <Route path="/empresa/ofertas/nueva" element={<RoleRoute role="ROLE_EMPRESA"><CrearOferta /></RoleRoute>} />
      <Route path="/empresa/ofertas/:id/editar" element={<RoleRoute role="ROLE_EMPRESA"><EditarOferta /></RoleRoute>} />
      <Route path="/empresa/ofertas/:id/postulantes" element={<RoleRoute role="ROLE_EMPRESA"><Postulantes /></RoleRoute>} />
      <Route path="/empresa/candidatos" element={<RoleRoute role="ROLE_EMPRESA"><BuscarCandidatos /></RoleRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
