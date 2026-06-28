import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Card, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ResultadoApi } from '../../api/ResultadoApi';
import type { ResultadoResponse } from '../../api/types/Resultado';

function estadoBadge(status: string) {
  if (status === 'COMPLETADA') return <Badge bg="success">Completada</Badge>;
  if (status === 'EN_PROGRESO') return <Badge bg="warning">En progreso</Badge>;
  return <Badge bg="secondary">{status}</Badge>;
}

export default function MisResultados() {
  const [items, setItems] = useState<ResultadoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    ResultadoApi.list(0, 50)
      .then((res) => vivo && setItems(res.content))
      .catch(() => vivo && setError('No se pudieron cargar tus resultados.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <h3 style={{ fontWeight: 600 }} className="mb-1">Mis resultados</h3>
      <p className="text-secondary mb-4">El historial de las evaluaciones que has rendido.</p>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>📊</div>
          <p className="mt-2 mb-1">Todavía no has rendido ninguna evaluación.</p>
          <Link to="/evaluaciones" className="brand-link">Ver evaluaciones disponibles →</Link>
        </div>
      )}

      {!loading && !error && items.map((r) => {
        const pct = r.maxScore > 0 ? Math.round((r.obtainedScore / r.maxScore) * 100) : 0;
        return (
          <Card key={r.id} className="mb-3" style={{ border: '0.5px solid #e6e6ef' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 style={{ fontWeight: 600, margin: 0 }}>{r.evaluationTitle}</h6>
                {estadoBadge(r.status)}
              </div>
              <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: 13 }}>
                <span>Puntaje: {r.obtainedScore} / {r.maxScore}</span>
                <span>{pct}%</span>
              </div>
              <ProgressBar
                now={pct}
                style={{ height: 6 }}
                variant={pct >= 60 ? 'success' : pct > 0 ? 'warning' : 'secondary'}
              />
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="text-secondary" style={{ fontSize: 12 }}>
                  Intentos: {r.attempts} · Iniciada: {new Date(r.startDate).toLocaleDateString()}
                </span>
                <Link to={`/mis-resultados/${r.evaluacionId}`} className="brand-link" style={{ fontSize: 13, fontWeight: 500 }}>
                  Ver detalle →
                </Link>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </Container>
  );
}
