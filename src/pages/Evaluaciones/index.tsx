// =========================================================
// Lista de evaluaciones disponibles (requiere sesión).
// Mismo patrón de estados (cargando/error/vacío/datos) + paginación.
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import type { Page } from '../../api/types/Page';
import type { EvaluacionResponse } from '../../api/types/Evaluacion';

const PAGE_SIZE = 10;

function dificultadColor(d: string) {
  if (d === 'FACIL') return 'success';
  if (d === 'MEDIO') return 'warning';
  if (d === 'DIFICIL') return 'danger';
  return 'secondary';
}

function tiempo(segundos: number | null) {
  if (!segundos) return null;
  return `${Math.round(segundos / 60)} min`;
}

export default function Evaluaciones() {
  const [data, setData] = useState<Page<EvaluacionResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    setError('');
    EvaluacionApi.list(page, PAGE_SIZE)
      .then((res) => vivo && setData(res))
      .catch(() => vivo && setError('No se pudieron cargar las evaluaciones.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [page]);

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <h3 style={{ fontWeight: 600 }} className="mb-1">Evaluaciones</h3>
      <p className="text-secondary mb-4">Rinde evaluaciones técnicas para subir tu SkillMatch Score.</p>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && data && data.empty && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>🧩</div>
          <p className="mt-2 mb-0">Todavía no hay evaluaciones disponibles.</p>
        </div>
      )}

      {!loading && !error && data && !data.empty && (
        <>
          {data.content.map((ev) => (
            <Link key={ev.id} to={`/evaluaciones/${ev.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card className="mb-3" style={{ border: '0.5px solid #e6e6ef', cursor: 'pointer' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1" style={{ fontWeight: 600 }}>{ev.title}</h5>
                      <p className="text-secondary mb-2" style={{ fontSize: 14 }}>{ev.description}</p>
                    </div>
                    <Badge bg={dificultadColor(ev.difficulty)}>{ev.difficulty}</Badge>
                  </div>
                  <div className="d-flex gap-3 text-secondary" style={{ fontSize: 13 }}>
                    {tiempo(ev.timeLimitSeconds) && <span>⏱ {tiempo(ev.timeLimitSeconds)}</span>}
                    {ev.maxScore != null && <span>🎯 {ev.maxScore} pts</span>}
                    {ev.skills.length > 0 && <span>🏷 {ev.skills.map((s) => s.name).join(', ')}</span>}
                  </div>
                </Card.Body>
              </Card>
            </Link>
          ))}

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button variant="outline-secondary" size="sm" disabled={data.first} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
            <span className="text-secondary" style={{ fontSize: 14 }}>Página {data.number + 1} de {data.totalPages}</span>
            <Button variant="outline-secondary" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Siguiente →</Button>
          </div>
        </>
      )}
    </Container>
  );
}
