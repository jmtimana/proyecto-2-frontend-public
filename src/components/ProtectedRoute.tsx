// =========================================================
// Envuelve una ruta para exigir que el usuario esté logueado.
// Si no lo está, lo manda a /login.
// =========================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  // Mientras revisamos si hay sesión guardada, no decidimos nada todavía.
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
