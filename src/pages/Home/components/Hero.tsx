// =========================================================
// Hero de la landing: degradado, titular y un "stack" de tarjetas.
// Si el usuario está logueado, se personaliza (su score real y
// botones para ir a su panel).
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { UserApi } from '../../../api/UserApi';
import { nivelDeScore } from '../../../utils/nivel';

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const esEstudiante = isAuthenticated && user?.type === 'ESTUDIANTE';
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!esEstudiante) return;
    UserApi.me().then((u) => setScore(u.skillMatchScore ?? 0)).catch(() => {});
  }, [esEstudiante]);

  // Score a mostrar: el real del estudiante, o 0.87 de ejemplo para visitantes.
  const scoreMostrado = esEstudiante && score != null ? score : 0.87;
  const nivel = nivelDeScore(scoreMostrado);

  return (
    <div className="hero-gradient">
      <Container className="py-5">
        <Row className="align-items-center py-4">
          <Col lg={7}>
            <h1 className="display-4" style={{ fontWeight: 700, lineHeight: 1.15 }}>
              Demuestra lo que{' '}
              <span style={{ color: 'var(--brand)' }}>realmente sabes</span> hacer
            </h1>
            <p className="lead text-secondary mt-3" style={{ maxWidth: 520 }}>
              SkillMatch conecta a estudiantes con empresas usando evaluaciones
              técnicas reales, no solo un currículum. Resuelve, obtén tu score y postula.
            </p>
            <div className="d-flex gap-2 mt-4">
              {isAuthenticated ? (
                <>
                  <Button as={Link as any} to="/dashboard" variant="primary" size="lg">Ir a mi panel</Button>
                  <Button as={Link as any} to="/ofertas" variant="outline-secondary" size="lg">Ver ofertas</Button>
                </>
              ) : (
                <>
                  <Button as={Link as any} to="/register" variant="primary" size="lg">Empieza gratis</Button>
                  <Button as={Link as any} to="/login" variant="outline-secondary" size="lg">Ya tengo cuenta</Button>
                </>
              )}
            </div>
          </Col>

          <Col lg={5} className="d-none d-lg-block">
            {/* Stack de tarjetas que da sensación de "producto vivo" */}
            <div style={{ position: 'relative', height: 280 }}>
              {/* Tarjeta principal: score + nivel */}
              <div
                className="lift-card"
                style={{
                  position: 'absolute', top: 40, left: 36, right: 0,
                  background: '#fff', borderRadius: 18, padding: 28,
                  boxShadow: '0 16px 40px rgba(83,74,183,0.16)', border: '0.5px solid #ece9ff',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--brand-dark)' }}>
                  {esEstudiante ? 'Tu SkillMatch Score' : 'SkillMatch Score'}
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--brand-dark)', lineHeight: 1.1 }}>
                  {scoreMostrado.toFixed(2)}
                </div>
                <span style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                  {nivel.emoji} {nivel.nombre}
                </span>
              </div>

              {/* Tarjetita flotante: match */}
              <div style={{ position: 'absolute', top: 4, left: 0, background: '#fff', borderRadius: 12, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', fontSize: 13, fontWeight: 600, color: '#1f9d57' }}>
                ✓ Cumples el score
              </div>

              {/* Tarjetita flotante: evaluación */}
              <div style={{ position: 'absolute', bottom: 4, right: 8, background: '#fff', borderRadius: 12, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>
                🧑‍💻 Evaluación completada
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
