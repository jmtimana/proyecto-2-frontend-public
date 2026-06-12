// =========================================================
// Barra superior que se ve en todas las páginas.
// =========================================================
import { Navbar as BsNavbar, Container, Button, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const esEmpresa = user?.type === 'EMPRESA';

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <BsNavbar bg="white" className="border-bottom py-2">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <span className="brand-logo">S</span>
          <span style={{ fontWeight: 600 }}>SkillMatch</span>
        </BsNavbar.Brand>

        <Nav className="me-auto ms-3">
          <Nav.Link as={Link} to="/ofertas">Ofertas</Nav.Link>
          {isAuthenticated && !esEmpresa && (
            <Nav.Link as={Link} to="/evaluaciones">Evaluaciones</Nav.Link>
          )}
          {isAuthenticated && !esEmpresa && (
            <Nav.Link as={Link} to="/mis-postulaciones">Mis postulaciones</Nav.Link>
          )}
          {isAuthenticated && esEmpresa && (
            <Nav.Link as={Link} to="/empresa/ofertas">Mis ofertas</Nav.Link>
          )}
          {isAuthenticated && esEmpresa && (
            <Nav.Link as={Link} to="/empresa/candidatos">Buscar candidatos</Nav.Link>
          )}
        </Nav>

        <Nav className="align-items-center gap-2">
          {isAuthenticated ? (
            <>
              <Nav.Link as={Link} to="/perfil" className="text-secondary me-2 p-0">Hola, {user?.firstName}</Nav.Link>
              <Button as={Link as any} to="/dashboard" variant="outline-secondary" size="sm">Mi panel</Button>
              <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Salir</Button>
            </>
          ) : (
            <>
              <Button as={Link as any} to="/login" variant="outline-secondary" size="sm">Iniciar sesión</Button>
              <Button as={Link as any} to="/register" variant="primary" size="sm">Registrarse</Button>
            </>
          )}
        </Nav>
      </Container>
    </BsNavbar>
  );
}
