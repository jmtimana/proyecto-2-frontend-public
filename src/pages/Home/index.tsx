import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChartNoAxesCombined, FileText, Handshake } from 'lucide-react';
import Hero from './components/Hero';
import OfertaCard from '../Ofertas/components/OfertaCard';
import { OfertaApi } from '../../api/OfertaApi';
import type { OfertaLaboralResponse } from '../../api/types/Oferta';

const PASOS = [
  { icon: FileText, titulo: 'Rinde evaluaciones reales', desc: 'Resuelve retos de código que se ejecutan de verdad y se califican al instante.' },
  { icon: ChartNoAxesCombined, titulo: 'Obtén tu SkillMatch Score', desc: 'Tu desempeño técnico y tu GitHub forman un score que demuestra lo que sabes.' },
  { icon: Handshake, titulo: 'Postula y haz match', desc: 'Las empresas te encuentran por tu score y tus habilidades, no solo por tu CV.' },
];

export default function Home() {
  const [destacadas, setDestacadas] = useState<OfertaLaboralResponse[]>([]);
  const [totalOfertas, setTotalOfertas] = useState(0);

  useEffect(() => {

    OfertaApi.list({ estado: 'ACTIVA', size: 3 })
      .then((r) => {
        setDestacadas(r.content);
        setTotalOfertas(r.totalElements);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      <Container className="py-5 fade-up">
        <h2 className="text-center mb-1" style={{ fontWeight: 700 }}>Cómo funciona</h2>
        <p className="text-center text-secondary mb-5">
          En tres pasos pasas de "lo digo en mi CV" a "lo demuestro".
        </p>
        <Row className="g-4">
          {PASOS.map((p, i) => (
            <Col md={4} key={i}>
              <div className="lift-card text-center h-100" style={{ background: 'var(--app-surface)', border: '0.5px solid var(--app-border)', borderRadius: 16, padding: '2rem 1.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                  <p.icon size={28} color="var(--brand)" aria-hidden="true" />
                </div>
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{i + 1}. {p.titulo}</div>
                <div className="text-secondary" style={{ fontSize: 14 }}>{p.desc}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <div style={{ background: 'var(--brand)', color: '#fff' }}>
        <Container className="py-4">
          <Row className="text-center g-3">
            <Col xs={4}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{totalOfertas}</div>
              <div style={{ opacity: 0.85, fontSize: 14 }}>Ofertas activas</div>
            </Col>
            <Col xs={4}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>4</div>
              <div style={{ opacity: 0.85, fontSize: 14 }}>Lenguajes</div>
            </Col>
            <Col xs={4}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>100%</div>
              <div style={{ opacity: 0.85, fontSize: 14 }}>Gratis para estudiantes</div>
            </Col>
          </Row>
        </Container>
      </div>

      {destacadas.length > 0 && (
        <Container className="py-5 fade-up">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ fontWeight: 700, margin: 0 }}>Ofertas destacadas</h2>
            <Link to="/ofertas" className="brand-link">Ver todas →</Link>
          </div>
          {destacadas.map((o) => (
            <OfertaCard key={o.id} oferta={o} />
          ))}
        </Container>
      )}
    </>
  );
}
