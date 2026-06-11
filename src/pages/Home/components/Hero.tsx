// =========================================================
// El "héroe" de la landing pública: titular + llamada a la acción.
// =========================================================
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <Container className="py-5">
      <Row className="align-items-center">
        <Col lg={7}>
          <h1 className="display-4" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Demuestra lo que{' '}
            <span style={{ color: 'var(--brand)' }}>realmente sabes</span> hacer
          </h1>
          <p className="lead text-secondary mt-3" style={{ maxWidth: 520 }}>
            SkillMatch conecta a estudiantes con empresas usando evaluaciones
            técnicas reales, no solo un currículum. Resuelve, obtén tu score y
            postula.
          </p>
          <div className="d-flex gap-2 mt-4">
            <Button as={Link as any} to="/register" variant="primary" size="lg">
              Empieza gratis
            </Button>
            <Button
              as={Link as any}
              to="/login"
              variant="outline-secondary"
              size="lg"
            >
              Ya tengo cuenta
            </Button>
          </div>
        </Col>
        <Col lg={5} className="d-none d-lg-block">
          {/* Tarjeta decorativa simple (luego la reemplazamos por algo real) */}
          <div
            style={{
              background: 'var(--brand-light)',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: 'var(--brand-dark)',
              }}
            >
              0.87
            </div>
            <div style={{ color: 'var(--brand-dark)' }}>SkillMatch Score</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
