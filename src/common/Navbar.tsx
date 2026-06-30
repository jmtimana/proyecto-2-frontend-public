import { useState } from 'react';
import { Navbar as BsNavbar, Container, Button, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const esEmpresa = user?.type === 'EMPRESA';
  const esAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;

  function closeMenu() {
    setExpanded(false);
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    navigate('/');
  }

  return (
    <BsNavbar
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
      className="app-navbar border-bottom py-2"
    >
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2" onClick={closeMenu}>
          <span className="brand-logo">S</span>
          <span style={{ fontWeight: 600 }}>SkillMatch</span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar-nav" aria-label="Abrir menú de navegación" />

        <BsNavbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto ms-lg-3">
            <Nav.Link as={Link} to="/ofertas" onClick={closeMenu}>Ofertas</Nav.Link>
            {isAuthenticated && !esEmpresa && (
              <Nav.Link as={Link} to="/evaluaciones" onClick={closeMenu}>Evaluaciones</Nav.Link>
            )}
            {isAuthenticated && !esEmpresa && (
              <Nav.Link as={Link} to="/mis-postulaciones" onClick={closeMenu}>Mis postulaciones</Nav.Link>
            )}
            {isAuthenticated && !esEmpresa && (
              <Nav.Link as={Link} to="/ofertas-guardadas" onClick={closeMenu}>Guardadas</Nav.Link>
            )}
            {isAuthenticated && !esEmpresa && (
              <Nav.Link as={Link} to="/leaderboard" onClick={closeMenu}>Ranking</Nav.Link>
            )}
            {isAuthenticated && esEmpresa && (
              <Nav.Link as={Link} to="/empresa/ofertas" onClick={closeMenu}>Mis ofertas</Nav.Link>
            )}
            {isAuthenticated && esEmpresa && (
              <Nav.Link as={Link} to="/empresa/candidatos" onClick={closeMenu}>Buscar candidatos</Nav.Link>
            )}
            {isAuthenticated && esEmpresa && (
              <Nav.Link as={Link} to="/empresa/evaluaciones" onClick={closeMenu}>Mis evaluaciones</Nav.Link>
            )}
            {isAuthenticated && esAdmin && (
              <Nav.Link
                as={Link}
                to="/admin/evaluaciones"
                onClick={closeMenu}
                style={{ color: 'var(--brand)', fontWeight: 500 }}
              >
                Admin
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-lg-center gap-2 mt-3 mt-lg-0">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </Button>
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Nav.Link as={Link} to="/perfil" className="text-secondary me-lg-2 p-0" onClick={closeMenu}>
                  Hola, {user?.firstName}
                </Nav.Link>
                <Button as={Link as any} to="/dashboard" variant="outline-secondary" size="sm" onClick={closeMenu}>
                  Mi panel
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Salir</Button>
              </>
            ) : (
              <>
                <Button as={Link as any} to="/login" variant="outline-secondary" size="sm" onClick={closeMenu}>
                  Iniciar sesión
                </Button>
                <Button as={Link as any} to="/register" variant="primary" size="sm" onClick={closeMenu}>
                  Registrarse
                </Button>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
