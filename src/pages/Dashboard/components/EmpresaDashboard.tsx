// =========================================================
// Dashboard de la EMPRESA (rediseñado: 2 columnas, métricas,
// tus ofertas con barra de postulantes, postulantes recientes
// de TODAS tus ofertas, acciones rápidas y skeletons).
// =========================================================
import { useEffect, useState } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserApi } from '../../../api/UserApi';
import { OfertaApi } from '../../../api/OfertaApi';
import { PostulacionApi } from '../../../api/PostulacionApi';
import type { OfertaLaboralResponse } from '../../../api/types/Oferta';
import type { PostulacionResponse } from '../../../api/types/Postulacion';
import MetricCard from './MetricCard';
import Skeleton from '../../../common/Skeleton';

interface Props {
  firstName?: string;
  userId?: number;
}

const cardStyle = { background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 14 } as const;

function ofertaEstadoColor(e: string) {
  if (e === 'ACTIVA') return 'success';
  if (e === 'PAUSADA') return 'warning';
  return 'secondary';
}

function postBadge(status: string) {
  if (status === 'ACEPTADA') return <Badge bg="success">Aceptada</Badge>;
  if (status === 'RECHAZADA') return <Badge bg="danger">Rechazada</Badge>;
  return <Badge bg="warning" text="dark">Pendiente</Badge>;
}

export default function EmpresaDashboard({ firstName, userId }: Props) {
  const [plan, setPlan] = useState('FREE');
  const [mias, setMias] = useState<OfertaLaboralResponse[]>([]);
  const [postulantes, setPostulantes] = useState<PostulacionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [meRes, ofRes] = await Promise.allSettled([UserApi.me(), OfertaApi.list({ size: 200 })]);
      if (!vivo) return;
      if (meRes.status === 'fulfilled') setPlan(meRes.value.companyProfile?.subscription ?? 'FREE');

      let misOfertas: OfertaLaboralResponse[] = [];
      if (ofRes.status === 'fulfilled') {
        misOfertas = ofRes.value.content.filter((o) => o.empresaUserId === userId);
        setMias(misOfertas);
      }

      // Postulantes recientes: juntamos los de todas mis ofertas que tienen alguno.
      const conPostulantes = misOfertas.filter((o) => (o.applicationsCount ?? 0) > 0).slice(0, 15);
      const listas = await Promise.all(
        conPostulantes.map((o) =>
          PostulacionApi.byOferta(o.id, 0, 20).then((r) => r.content).catch(() => [])
        )
      );
      if (!vivo) return;
      setPostulantes(listas.flat());
      setLoading(false);
    })();
    return () => { vivo = false; };
  }, [userId]);

  if (loading) {
    return (
      <>
        <Skeleton width={220} height={28} />
        <Skeleton width={260} height={16} style={{ marginTop: 8 }} />
        <div className="d-flex gap-2" style={{ margin: '20px 0' }}>
          <Skeleton height={70} radius={10} /><Skeleton height={70} radius={10} /><Skeleton height={70} radius={10} />
        </div>
        <Skeleton height={220} radius={14} />
      </>
    );
  }

  const publicadas = mias.length;
  const activas = mias.filter((o) => o.status === 'ACTIVA').length;
  const totalPost = mias.reduce((a, o) => a + (o.applicationsCount ?? 0), 0);
  const maxApp = Math.max(1, ...mias.map((o) => o.applicationsCount ?? 0));
  const ofertasTop = [...mias].sort((a, b) => (b.applicationsCount ?? 0) - (a.applicationsCount ?? 0)).slice(0, 5);
  const recientes = [...postulantes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 style={{ fontWeight: 600, margin: 0 }}>Hola, {firstName} 👋</h3>
          <p className="text-secondary" style={{ margin: '2px 0 0' }}>Gestiona tus ofertas y candidatos</p>
        </div>
        <Badge bg={plan === 'PRO' ? 'warning' : 'secondary'} text={plan === 'PRO' ? 'dark' : undefined}>
          Plan {plan}
        </Badge>
      </div>

      {/* Métricas */}
      <div className="d-flex gap-2 mb-4">
        <MetricCard label="Ofertas publicadas" value={publicadas} />
        <MetricCard label="Ofertas activas" value={activas} />
        <MetricCard label="Postulaciones recibidas" value={totalPost} />
      </div>

      <Row className="g-3">
        {/* Izquierda: tus ofertas con barra de postulantes */}
        <Col lg={7}>
          <div style={{ ...cardStyle, padding: '1.1rem 1.35rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontWeight: 600 }}>Tus ofertas</span>
              <Link to="/empresa/ofertas" className="brand-link" style={{ fontSize: 13 }}>Ver todas</Link>
            </div>

            {ofertasTop.length === 0 ? (
              <div className="text-center py-3" style={{ color: '#999' }}>
                <div style={{ fontSize: 34 }}>📋</div>
                <p className="mb-2" style={{ fontSize: 14 }}>Aún no has publicado ofertas.</p>
                <Link to="/empresa/ofertas/nueva" className="brand-link">Publicar la primera →</Link>
              </div>
            ) : (
              ofertasTop.map((o) => {
                const apps = o.applicationsCount ?? 0;
                return (
                  <Link key={o.id} to={`/empresa/ofertas/${o.id}/postulantes`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="lift-card" style={{ padding: '0.6rem 0.25rem', borderTop: '0.5px solid #f0f0f4' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{o.title}</span>
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg={ofertaEstadoColor(o.status)} style={{ fontSize: 10 }}>{o.status}</Badge>
                          <span style={{ fontSize: 12, color: 'var(--brand-dark)', fontWeight: 600 }}>{apps} postul.</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
                        <div style={{ width: `${Math.round((apps / maxApp) * 100)}%`, height: '100%', background: 'var(--brand)' }} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </Col>

        {/* Derecha: acciones + postulantes recientes */}
        <Col lg={5}>
          <div style={{ ...cardStyle, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <div className="text-secondary mb-2" style={{ fontSize: 13 }}>Acciones rápidas</div>
            <Link to="/empresa/ofertas/nueva" className="lift-card d-block" style={{ textDecoration: 'none', background: 'var(--brand-light)', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>📢 Publicar oferta</span>
            </Link>
            <Link to="/empresa/candidatos" className="lift-card d-block" style={{ textDecoration: 'none', background: '#f4f4f8', borderRadius: 10, padding: '0.7rem 1rem' }}>
              <span style={{ fontWeight: 600, color: '#1f2230' }}>🔍 Buscar candidatos</span>
            </Link>
          </div>

          <div style={{ ...cardStyle, padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Postulantes recientes</div>
            {recientes.length === 0 ? (
              <div className="text-secondary" style={{ fontSize: 13 }}>Todavía no tienes postulantes.</div>
            ) : (
              recientes.map((p) => (
                <div key={p.id} className="d-flex justify-content-between align-items-center py-2" style={{ borderTop: '0.5px solid #f0f0f4' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <Link to={`/candidatos/${p.userId}`} className="brand-link" style={{ fontSize: 14, fontWeight: 600 }}>{p.userName}</Link>
                    <div className="text-secondary" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.offerTitle}</div>
                  </div>
                  <div className="text-end" style={{ flexShrink: 0 }}>
                    {postBadge(p.status)}
                    <div style={{ fontSize: 11, color: 'var(--brand-dark)', fontWeight: 600, marginTop: 2 }}>
                      {(p.userSkillMatchScore ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
