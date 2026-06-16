// =========================================================
// Dashboard del ESTUDIANTE.
// Carga al montar: su perfil (score), sus resultados y sus
// postulaciones. Calcula las métricas a partir de esos datos.
// =========================================================
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserApi } from '../../../api/UserApi';
import { ResultadoApi } from '../../../api/ResultadoApi';
import { PostulacionApi } from '../../../api/PostulacionApi';
import { OfertaApi } from '../../../api/OfertaApi';
import type { UserDetailResponse } from '../../../api/types/User';
import type { ResultadoResponse } from '../../../api/types/Resultado';
import MetricCard from './MetricCard';
import ProgresoChart from './ProgresoChart';
import NivelBadge from '../../../common/NivelBadge';
import { nivelDeScore } from '../../../utils/nivel';

export default function StudentDashboard({ firstName }: { firstName?: string }) {
  const [me, setMe] = useState<UserDetailResponse | null>(null);
  const [evaluacionesHechas, setEvaluacionesHechas] = useState(0);
  const [resultados, setResultados] = useState<ResultadoResponse[]>([]);
  const [postulaciones, setPostulaciones] = useState({ total: 0, pendientes: 0, aceptadas: 0, rechazadas: 0 });
  const [ofertasActivas, setOfertasActivas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;

    // Pedimos todo en paralelo. Si una falla, no rompe las demás.
    Promise.allSettled([
      UserApi.me(),
      ResultadoApi.mine(),
      PostulacionApi.mine(),
      OfertaApi.list({ estado: 'ACTIVA', size: 1 }),
    ]).then((results) => {
      if (!vivo) return;
      const [meRes, resRes, postRes, ofRes] = results;

      if (meRes.status === 'fulfilled') setMe(meRes.value);

      if (resRes.status === 'fulfilled') {
        const completadas = resRes.value.content.filter((r) => r.status === 'COMPLETADA').length;
        setEvaluacionesHechas(completadas);
        setResultados(resRes.value.content);
      }

      if (postRes.status === 'fulfilled') {
        const list = postRes.value.content;
        setPostulaciones({
          total: postRes.value.totalElements,
          pendientes: list.filter((p) => p.status === 'PENDIENTE').length,
          aceptadas: list.filter((p) => p.status === 'ACEPTADA').length,
          rechazadas: list.filter((p) => p.status === 'RECHAZADA').length,
        });
      }

      if (ofRes.status === 'fulfilled') setOfertasActivas(ofRes.value.totalElements);

      setLoading(false);
    });

    return () => {
      vivo = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner style={{ color: 'var(--brand)' }} />
      </div>
    );
  }

  const score = me?.skillMatchScore ?? 0;
  const githubScore = me?.githubScore ?? 0;
  const nivel = nivelDeScore(score);
  const githubConectado = !!me?.githubUsername;

  return (
    <>
      <div className="mb-4">
        <h3 style={{ fontWeight: 600, margin: 0 }}>Hola, {firstName} 👋</h3>
        <p className="text-secondary" style={{ margin: '2px 0 0' }}>Este es tu progreso en SkillMatch</p>
      </div>

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
            <div style={{ fontSize: 34, lineHeight: 1, marginBottom: 4 }}>{nivel.emoji}</div>
            <NivelBadge score={score} size="md" />
          </div>
        </div>

        {/* Progreso hacia el siguiente nivel */}
        {nivel.siguiente ? (
          <div style={{ marginTop: 14 }}>
            <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--brand-dark)', marginBottom: 4 }}>
              <span>Progreso a {nivel.siguiente}</span>
              <span>Te faltan {nivel.faltaParaSiguiente?.toFixed(2)}</span>
            </div>
            <div style={{ height: 8, background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${nivel.progreso}%`, height: '100%', background: 'var(--brand)', transition: 'width .3s' }} />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--brand-dark)', fontWeight: 500 }}>
            ¡Estás en el nivel máximo! 🎉
          </div>
        )}
      </div>

      <div className="d-flex gap-2 mb-4">
        <MetricCard label="Evaluaciones" value={evaluacionesHechas} />
        <MetricCard label="Postulaciones" value={postulaciones.total} />
        <MetricCard label="Ofertas activas" value={ofertasActivas} />
      </div>

      {/* Gráfico de progreso por evaluación */}
      <div className="mb-4" style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>📈 Tu progreso</div>
        <ProgresoChart resultados={resultados} />
      </div>

      {postulaciones.total > 0 && (
        <div className="mb-4" style={{ fontSize: 14 }}>
          <span className="text-secondary">Tus postulaciones: </span>
          <span style={{ color: '#9a7d0a' }}>{postulaciones.pendientes} pendientes</span>
          {' · '}
          <span style={{ color: '#3B6D11' }}>{postulaciones.aceptadas} aceptadas</span>
          {' · '}
          <span style={{ color: '#a32d2d' }}>{postulaciones.rechazadas} rechazadas</span>
        </div>
      )}

      {!githubConectado && (
        <Link to="/github" style={{ textDecoration: 'none' }}>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 12, padding: '0.85rem 1.25rem' }}>
            <span style={{ fontSize: 14, color: '#1f2230' }}>🐙 Conecta tu GitHub para mejorar tu score</span>
            <span style={{ color: 'var(--brand)', fontWeight: 500, fontSize: 13 }}>Conectar →</span>
          </div>
        </Link>
      )}

      <div className="text-secondary mb-2" style={{ fontSize: 13 }}>Próximos pasos</div>
      <div className="d-flex gap-2">
        <Link to="/ofertas" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#1f2230' }}>💼 Explora ofertas</div>
            <div style={{ fontSize: 12, color: '#6b6b76' }}>Encuentra tu próximo reto</div>
          </div>
        </Link>
        <Link to="/evaluaciones" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#1f2230' }}>🧑‍💻 Rinde una evaluación</div>
            <div style={{ fontSize: 12, color: '#6b6b76' }}>Sube tu score técnico</div>
          </div>
        </Link>
      </div>
    </>
  );
}
