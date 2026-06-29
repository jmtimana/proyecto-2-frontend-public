import { useEffect, useState } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Briefcase, Code, GitFork, LineChart, PartyPopper } from 'lucide-react';
import { UserApi } from '../../../api/UserApi';
import { ResultadoApi } from '../../../api/ResultadoApi';
import { PostulacionApi } from '../../../api/PostulacionApi';
import { OfertaApi } from '../../../api/OfertaApi';
import type { UserDetailResponse } from '../../../api/types/User';
import type { ResultadoResponse } from '../../../api/types/Resultado';
import type { PostulacionResponse } from '../../../api/types/Postulacion';
import type { OfertaLaboralResponse } from '../../../api/types/Oferta';
import MetricCard from './MetricCard';
import ProgresoChart from './ProgresoChart';
import OfertaCard from '../../Ofertas/components/OfertaCard';
import NivelBadge from '../../../common/NivelBadge';
import NivelIcon from '../../../common/NivelIcon';
import Skeleton from '../../../common/Skeleton';
import { nivelDeScore } from '../../../utils/nivel';

const cardStyle = { background: 'var(--app-surface)', border: '0.5px solid var(--app-border)', borderRadius: 14 } as const;

function postBadge(status: string) {
  if (status === 'ACEPTADA') return <Badge bg="success">Aceptada</Badge>;
  if (status === 'RECHAZADA') return <Badge bg="danger">Rechazada</Badge>;
  return <Badge bg="warning" text="dark">Pendiente</Badge>;
}

export default function StudentDashboard({ firstName }: { firstName?: string }) {
  const [me, setMe] = useState<UserDetailResponse | null>(null);
  const [resultados, setResultados] = useState<ResultadoResponse[]>([]);
  const [posts, setPosts] = useState<PostulacionResponse[]>([]);
  const [ofertas, setOfertas] = useState<OfertaLaboralResponse[]>([]);
  const [totalOfertas, setTotalOfertas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.allSettled([
      UserApi.me(),
      ResultadoApi.mine(),
      PostulacionApi.mine(0, 50),
      OfertaApi.list({ estado: 'ACTIVA', size: 20 }),
    ]).then((results) => {
      if (!vivo) return;
      const [meRes, resRes, postRes, ofRes] = results;
      if (meRes.status === 'fulfilled') setMe(meRes.value);
      if (resRes.status === 'fulfilled') setResultados(resRes.value.content);
      if (postRes.status === 'fulfilled') setPosts(postRes.value.content);
      if (ofRes.status === 'fulfilled') {
        setOfertas(ofRes.value.content);
        setTotalOfertas(ofRes.value.totalElements);
      }
      setLoading(false);
    });
    return () => { vivo = false; };
  }, []);

  if (loading) {
    return (
      <>
        <Skeleton width={220} height={28} />
        <Skeleton width={260} height={16} style={{ marginTop: 8 }} />
        <Skeleton height={120} radius={14} style={{ margin: '20px 0' }} />
        <div className="d-flex gap-2 mb-4">
          <Skeleton height={70} radius={10} /><Skeleton height={70} radius={10} /><Skeleton height={70} radius={10} />
        </div>
        <Skeleton height={200} radius={14} />
      </>
    );
  }

  const score = me?.skillMatchScore ?? 0;
  const githubScore = me?.githubScore ?? 0;
  const nivel = nivelDeScore(score);
  const githubConectado = !!me?.githubUsername;
  const evaluacionesHechas = resultados.filter((r) => r.status === 'COMPLETADA').length;

  const recomendadas = [...ofertas]
    .sort((a, b) => {
      const ca = a.minRequiredScore == null || score >= a.minRequiredScore ? 0 : 1;
      const cb = b.minRequiredScore == null || score >= b.minRequiredScore ? 0 : 1;
      return ca - cb;
    })
    .slice(0, 3);

  const recientes = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <>
      <div className="mb-4">
        <h3 style={{ fontWeight: 600, margin: 0 }}>Hola, {firstName}</h3>
        <p className="text-secondary" style={{ margin: '2px 0 0' }}>Este es tu progreso en SkillMatch</p>
      </div>

      <div className="d-flex gap-2 mb-4">
        <MetricCard label="Evaluaciones" value={evaluacionesHechas} />
        <MetricCard label="Postulaciones" value={posts.length} />
        <MetricCard label="Ofertas activas" value={totalOfertas} />
      </div>

      <Row className="g-3">
        <Col lg={7}>
          <div style={{ background: 'var(--brand-light)', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div style={{ fontSize: 13, color: 'var(--brand-dark)' }}>Tu SkillMatch Score</div>
                <div style={{ fontSize: 40, fontWeight: 600, color: 'var(--brand-dark)', lineHeight: 1 }}>{score.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: 'var(--brand)', marginTop: 6 }}>
                  Score técnico {score.toFixed(2)} · GitHub {githubScore.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="d-flex justify-content-center mb-1">
                  <NivelIcon nivel={nivel.nombre} size={34} color="var(--brand-dark)" />
                </div>
                <NivelBadge score={score} size="md" />
              </div>
            </div>
            {nivel.siguiente ? (
              <div style={{ marginTop: 14 }}>
                <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--brand-dark)', marginBottom: 4 }}>
                  <span>Progreso a {nivel.siguiente}</span>
                  <span>Te faltan {nivel.faltaParaSiguiente?.toFixed(2)}</span>
                </div>
                <div style={{ height: 8, background: 'var(--app-surface)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${nivel.progreso}%`, height: '100%', background: 'var(--brand)', transition: 'width .3s' }} />
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-1" style={{ marginTop: 12, fontSize: 12, color: 'var(--brand-dark)', fontWeight: 500 }}>
                ¡Estás en el nivel máximo! <PartyPopper size={14} aria-hidden="true" />
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, padding: '1.25rem 1.5rem' }}>
            <div className="d-flex align-items-center gap-2" style={{ fontWeight: 600, marginBottom: 8 }}>
              <LineChart size={17} aria-hidden="true" />
              Tu progreso
            </div>
            <ProgresoChart resultados={resultados} />
          </div>
        </Col>

        <Col lg={5}>
          <div style={{ ...cardStyle, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <div className="text-secondary mb-2" style={{ fontSize: 13 }}>Acciones rápidas</div>
            <Link to="/evaluaciones" className="lift-card d-block" style={{ textDecoration: 'none', background: 'var(--brand-light)', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: 8 }}>
              <span className="d-inline-flex align-items-center gap-2" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>
                <Code size={17} aria-hidden="true" />
                Rinde una evaluación
              </span>
            </Link>
            <Link to="/ofertas" className="lift-card d-block" style={{ textDecoration: 'none', background: 'var(--app-surface-soft)', borderRadius: 10, padding: '0.7rem 1rem' }}>
              <span className="d-inline-flex align-items-center gap-2" style={{ fontWeight: 600, color: 'var(--app-text)' }}>
                <Briefcase size={17} aria-hidden="true" />
                Explora ofertas
              </span>
            </Link>
          </div>

          {!githubConectado && (
            <Link to="/github" style={{ textDecoration: 'none' }}>
              <div className="lift-card d-flex justify-content-between align-items-center" style={{ ...cardStyle, padding: '0.85rem 1.25rem', marginBottom: '1rem' }}>
                <span className="d-inline-flex align-items-center gap-2" style={{ fontSize: 14, color: 'var(--app-text)' }}>
                  <GitFork size={16} aria-hidden="true" />
                  Conecta tu GitHub
                </span>
                <span style={{ color: 'var(--brand)', fontWeight: 500, fontSize: 13 }}>Conectar →</span>
              </div>
            </Link>
          )}

          <div style={{ ...cardStyle, padding: '1rem 1.25rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontWeight: 600 }}>Postulaciones recientes</span>
              <Link to="/mis-postulaciones" className="brand-link" style={{ fontSize: 12 }}>Ver todas</Link>
            </div>
            {recientes.length === 0 ? (
              <div className="text-secondary" style={{ fontSize: 13 }}>Aún no te has postulado a ninguna oferta.</div>
            ) : (
              recientes.map((p) => (
                <div key={p.id} className="d-flex justify-content-between align-items-center py-1" style={{ borderTop: '0.5px solid #f0f0f4' }}>
                  <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{p.offerTitle}</span>
                  {postBadge(p.status)}
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>

      {recomendadas.length > 0 && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 style={{ fontWeight: 600, margin: 0 }}>Ofertas recomendadas para ti</h5>
            <Link to="/ofertas" className="brand-link" style={{ fontSize: 14 }}>Ver todas →</Link>
          </div>
          {recomendadas.map((o) => (
            <OfertaCard key={o.id} oferta={o} miScore={score} />
          ))}
        </div>
      )}
    </>
  );
}
