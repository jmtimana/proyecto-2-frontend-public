// =========================================================
// Dashboard de la EMPRESA.
// Carga su perfil (plan FREE/PRO) y sus ofertas. Las métricas
// se calculan filtrando las ofertas por las de ESTA empresa.
// =========================================================
import { useEffect, useState } from 'react';
import { Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserApi } from '../../../api/UserApi';
import { OfertaApi } from '../../../api/OfertaApi';
import MetricCard from './MetricCard';

interface Props {
  firstName?: string;
  userId?: number;
}

export default function EmpresaDashboard({ firstName, userId }: Props) {
  const [plan, setPlan] = useState<string>('FREE');
  const [stats, setStats] = useState({ publicadas: 0, activas: 0, postulaciones: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;

    Promise.allSettled([UserApi.me(), OfertaApi.list({ size: 200 })]).then((results) => {
      if (!vivo) return;
      const [meRes, ofRes] = results;

      if (meRes.status === 'fulfilled') {
        setPlan(meRes.value.companyProfile?.subscription ?? 'FREE');
      }

      if (ofRes.status === 'fulfilled') {
        const mias = ofRes.value.content.filter((o) => o.empresaUserId === userId);
        setStats({
          publicadas: mias.length,
          activas: mias.filter((o) => o.status === 'ACTIVA').length,
          postulaciones: mias.reduce((acc, o) => acc + (o.applicationsCount ?? 0), 0),
        });
      }

      setLoading(false);
    });

    return () => {
      vivo = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner style={{ color: 'var(--brand)' }} />
      </div>
    );
  }

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

      <div className="d-flex gap-2 mb-4">
        <MetricCard label="Ofertas publicadas" value={stats.publicadas} />
        <MetricCard label="Ofertas activas" value={stats.activas} />
        <MetricCard label="Postulaciones recibidas" value={stats.postulaciones} />
      </div>

      <div className="text-secondary mb-2" style={{ fontSize: 13 }}>Acciones</div>
      <div className="d-flex gap-2 flex-wrap">
        <Link to="/empresa/ofertas/nueva" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#1f2230' }}>📢 Publicar oferta</div>
            <div style={{ fontSize: 12, color: '#6b6b76' }}>Crea una nueva vacante</div>
          </div>
        </Link>
        <Link to="/empresa/ofertas" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#1f2230' }}>📋 Mis ofertas y postulantes</div>
            <div style={{ fontSize: 12, color: '#6b6b76' }}>Gestiona tus vacantes</div>
          </div>
        </Link>
        <Link to="/empresa/candidatos" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#1f2230' }}>🔍 Buscar candidatos</div>
            <div style={{ fontSize: 12, color: '#6b6b76' }}>Encuentra talento por score</div>
          </div>
        </Link>
      </div>
    </>
  );
}
