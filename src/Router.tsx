import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Ofertas = lazy(() => import('./pages/Ofertas'));
const OfertaDetail = lazy(() => import('./pages/OfertaDetail'));
const EmpresaOfertas = lazy(() => import('./pages/EmpresaOfertas'));
const CrearOferta = lazy(() => import('./pages/CrearOferta'));
const EditarOferta = lazy(() => import('./pages/EditarOferta'));
const Postulantes = lazy(() => import('./pages/Postulantes'));
const BuscarCandidatos = lazy(() => import('./pages/BuscarCandidatos'));
const MisPostulaciones = lazy(() => import('./pages/MisPostulaciones'));
const OfertasGuardadas = lazy(() => import('./pages/OfertasGuardadas'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const PerfilPublico = lazy(() => import('./pages/PerfilPublico'));
const ResultadoDetalle = lazy(() => import('./pages/ResultadoDetalle'));
const MiPerfil = lazy(() => import('./pages/MiPerfil'));
const ConectarGitHub = lazy(() => import('./pages/ConectarGitHub'));
const Evaluaciones = lazy(() => import('./pages/Evaluaciones'));
const EvaluacionDetail = lazy(() => import('./pages/EvaluacionDetail'));
const RendirEvaluacion = lazy(() => import('./pages/RendirEvaluacion'));
const MisResultados = lazy(() => import('./pages/MisResultados'));
const AdminEvaluaciones = lazy(() => import('./pages/AdminEvaluaciones'));
const AdminCrearEvaluacion = lazy(() => import('./pages/AdminCrearEvaluacion'));
const AdminEditarEvaluacion = lazy(() => import('./pages/AdminEditarEvaluacion'));
const AdminPreguntas = lazy(() => import('./pages/AdminPreguntas'));
const AdminHabilidades = lazy(() => import('./pages/AdminHabilidades'));
const NotFound = lazy(() => import('./pages/NotFound'));

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

const cargando = (
  <div className="text-center py-5">
    <Spinner style={{ color: 'var(--brand)' }} />
  </div>
);

export default function Router() {
  return (
    <Suspense fallback={cargando}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/ofertas/:id" element={<OfertaDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/github" element={<ProtectedRoute><ConectarGitHub /></ProtectedRoute>} />
        <Route path="/evaluaciones" element={<ProtectedRoute><Evaluaciones /></ProtectedRoute>} />
        <Route path="/evaluaciones/:id" element={<ProtectedRoute><EvaluacionDetail /></ProtectedRoute>} />
        <Route path="/evaluaciones/:id/rendir" element={<ProtectedRoute><RendirEvaluacion /></ProtectedRoute>} />
        <Route path="/mis-resultados" element={<ProtectedRoute><MisResultados /></ProtectedRoute>} />
        <Route path="/mis-resultados/:evaluacionId" element={<ProtectedRoute><ResultadoDetalle /></ProtectedRoute>} />
        <Route path="/candidatos/:id" element={<ProtectedRoute><PerfilPublico /></ProtectedRoute>} />
        <Route path="/mis-postulaciones" element={<ProtectedRoute><MisPostulaciones /></ProtectedRoute>} />
        <Route path="/ofertas-guardadas" element={<ProtectedRoute><OfertasGuardadas /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />

        <Route path="/empresa/ofertas" element={<RoleRoute role="ROLE_EMPRESA"><EmpresaOfertas /></RoleRoute>} />
        <Route path="/empresa/ofertas/nueva" element={<RoleRoute role="ROLE_EMPRESA"><CrearOferta /></RoleRoute>} />
        <Route path="/empresa/ofertas/:id/editar" element={<RoleRoute role="ROLE_EMPRESA"><EditarOferta /></RoleRoute>} />
        <Route path="/empresa/ofertas/:id/postulantes" element={<RoleRoute role="ROLE_EMPRESA"><Postulantes /></RoleRoute>} />
        <Route path="/empresa/candidatos" element={<RoleRoute role="ROLE_EMPRESA"><BuscarCandidatos /></RoleRoute>} />

        <Route path="/admin/evaluaciones" element={<RoleRoute role="ROLE_ADMIN"><AdminEvaluaciones /></RoleRoute>} />
        <Route path="/admin/evaluaciones/nueva" element={<RoleRoute role="ROLE_ADMIN"><AdminCrearEvaluacion /></RoleRoute>} />
        <Route path="/admin/evaluaciones/:id/editar" element={<RoleRoute role="ROLE_ADMIN"><AdminEditarEvaluacion /></RoleRoute>} />
        <Route path="/admin/evaluaciones/:id/preguntas" element={<RoleRoute role="ROLE_ADMIN"><AdminPreguntas /></RoleRoute>} />
        <Route path="/admin/habilidades" element={<RoleRoute role="ROLE_ADMIN"><AdminHabilidades /></RoleRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
