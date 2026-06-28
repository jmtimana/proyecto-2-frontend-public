import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <Container className="py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-logo" style={{ width: 26, height: 26, fontSize: 14, borderRadius: 7 }}>S</span>
            <strong>SkillMatch</strong>
          </div>

          <div className="d-flex gap-3 flex-wrap app-footer-links" style={{ fontSize: 14 }}>
            <Link to="/ofertas">Ofertas</Link>
            <Link to="/evaluaciones">Evaluaciones</Link>
            <Link to="/leaderboard">Ranking</Link>
          </div>

          <div className="app-footer-meta" style={{ fontSize: 12 }}>
            Proyecto CS 2031 - Desarrollo Basado en Plataforma
          </div>
        </div>
      </Container>
    </footer>
  );
}
