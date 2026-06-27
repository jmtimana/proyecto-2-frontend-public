// Pie de página global (se muestra en todas las pantallas).
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1c1a33', color: '#cfcde6' }}>
      <Container className="py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-logo" style={{ width: 26, height: 26, fontSize: 14, borderRadius: 7 }}>S</span>
            <strong style={{ color: '#fff' }}>SkillMatch</strong>
          </div>

          <div className="d-flex gap-3 flex-wrap" style={{ fontSize: 14 }}>
            <Link to="/ofertas" style={{ color: '#cfcde6', textDecoration: 'none' }}>Ofertas</Link>
            <Link to="/evaluaciones" style={{ color: '#cfcde6', textDecoration: 'none' }}>Evaluaciones</Link>
            <Link to="/leaderboard" style={{ color: '#cfcde6', textDecoration: 'none' }}>Ranking</Link>
          </div>

          <div style={{ fontSize: 12, color: '#8f8cb3' }}>
            Proyecto CS 2031 · Desarrollo Basado en Plataforma
          </div>
        </div>
      </Container>
    </footer>
  );
}
