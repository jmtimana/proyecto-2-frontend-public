import { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Check, Code } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { UserApi } from '../../../api/UserApi';
import { nivelDeScore } from '../../../utils/nivel';
import NivelIcon from '../../../common/NivelIcon';

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const esEstudiante = isAuthenticated && user?.type === 'ESTUDIANTE';
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!esEstudiante) return;
    UserApi.me().then((u) => setScore(u.skillMatchScore ?? 0)).catch(() => {});
  }, [esEstudiante]);

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
            <div style={{ position: 'relative', height: 280 }}>
              <div
                className="lift-card"
                style={{
                  position: 'absolute', top: 40, left: 36, right: 0,
                  background: 'var(--app-surface)', borderRadius: 18, padding: 28,
                  boxShadow: 'var(--app-shadow)', border: '0.5px solid var(--app-border)',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--brand-dark)' }}>
                  {esEstudiante ? 'Tu SkillMatch Score' : 'SkillMatch Score'}
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--brand-dark)', lineHeight: 1.1 }}>
                  {scoreMostrado.toFixed(2)}
                </div>
                <span style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                  <span className="d-inline-flex align-items-center gap-1">
                    <NivelIcon nivel={nivel.nombre} size={13} />
                    {nivel.nombre}
                  </span>
                </span>
              </div>

              <div className="d-flex align-items-center gap-1" style={{ position: 'absolute', top: 4, left: 0, background: 'var(--app-surface)', borderRadius: 12, padding: '8px 14px', boxShadow: 'var(--app-shadow)', fontSize: 13, fontWeight: 600, color: '#1f9d57' }}>
                <Check size={15} aria-hidden="true" />
                Cumples el score
              </div>

              <div className="d-flex align-items-center gap-1" style={{ position: 'absolute', bottom: 4, right: 8, background: 'var(--app-surface)', borderRadius: 12, padding: '8px 14px', boxShadow: 'var(--app-shadow)', fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>
                <Code size={15} aria-hidden="true" />
                Evaluación completada
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
