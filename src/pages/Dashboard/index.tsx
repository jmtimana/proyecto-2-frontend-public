// =========================================================
// Dashboard role-aware: decide qué versión mostrar según el
// tipo de usuario (ESTUDIANTE o EMPRESA).
// =========================================================
import { Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './components/StudentDashboard';
import EmpresaDashboard from './components/EmpresaDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const esEmpresa = user?.type === 'EMPRESA';

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      {esEmpresa ? (
        <EmpresaDashboard firstName={user?.firstName} userId={user?.userId} />
      ) : (
        <StudentDashboard firstName={user?.firstName} />
      )}
    </Container>
  );
}
