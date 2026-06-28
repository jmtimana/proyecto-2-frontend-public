import { Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../common/Breadcrumb';
import StudentDashboard from './components/StudentDashboard';
import EmpresaDashboard from './components/EmpresaDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const esEmpresa = user?.type === 'EMPRESA';

  return (
    <Container className="py-5" style={{ maxWidth: 980 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Dashboard' }]} />
      {esEmpresa ? (
        <EmpresaDashboard firstName={user?.firstName} userId={user?.userId} />
      ) : (
        <StudentDashboard firstName={user?.firstName} />
      )}
    </Container>
  );
}
