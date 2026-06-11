// =========================================================
// Como ProtectedRoute, pero además exige un rol específico.
// Ej: <RoleRoute role="ROLE_EMPRESA"> ...solo empresas... </RoleRoute>
//
// (Aún no lo usamos en el Router, pero queda listo para cuando
//  agreguemos pantallas exclusivas de EMPRESA o ADMIN.)
// =========================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  role: string;
  children: ReactNode;
}

export default function RoleRoute({ role, children }: Props) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si no tiene el rol requerido, lo mandamos al dashboard.
  if (!user?.roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
