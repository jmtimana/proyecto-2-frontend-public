// =========================================================
// Detalle de una evaluación: info + preguntas + botón "Rendir".
// (El botón de rendir se activa en la Etapa 2.)
// Ruta: /evaluaciones/:id
// =========================================================
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Badge, Card, Button } from 'react-bootstrap';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import type { EvaluacionDetailResponse } from '../../api/types/Evaluacion';

function dificultadColor(d: string) {
  if (d === 'FACIL') return 'success';
  if (d === 'MEDIO') return 'warning';
  if (d === 'DIFICIL') return 'danger';
  return 'secondary';
}

export default function EvaluacionDetail() {
  const { id } = useParams();
  const [ev, setEv] = useState<EvaluacionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    EvaluacionApi.getById(Number(id))
      .then((res) => vivo && setEv(res))
      .catch(() => vivo && setError('No se pudo cargar la evaluación.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>;

  if (error || !ev) {
    return (
      <Container className="py-5" style={{ maxWidth: 720 }}>
        <Alert variant="danger">{error || 'Evaluación no encontrada.'}</Alert>
        <Link to="/evaluaciones" className="brand-link">← Volver a evaluaciones</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <Link to="/evaluaciones" className="brand-link" style={{ fontSize: 14 }}>← Volver a evaluaciones</Link>

      <div className="d-flex justify-content-between align-items-start mt-3">
        <div>
          <h3 style={{ fontWeight: 600, margin: 0 }}>{ev.title}</h3>
          <p className="text-secondary mt-1 mb-0">{ev.description}</p>
        </div>
        <Badge bg={dificultadColor(ev.difficulty)}>{ev.difficulty}</Badge>
      </div>

      <div className="d-flex gap-4 mt-3 text-secondary" style={{ fontSize: 14 }}>
        {ev.timeLimitSeconds && <span>⏱ {Math.round(ev.timeLimitSeconds / 60)} min</span>}
        {ev.maxScore != null && <span>🎯 {ev.maxScore} puntos</span>}
        <span>❓ {ev.questions.length} pregunta(s)</span>
      </div>

      {ev.skills.length > 0 && (
        <div className="mt-3 d-flex flex-wrap gap-1">
          {ev.skills.map((s) => (
            <Badge key={s.id} bg="light" text="dark" style={{ fontWeight: 400 }}>{s.name}</Badge>
          ))}
        </div>
      )}

      <hr className="my-4" />

      <h6 className="text-secondary mb-3">Preguntas</h6>
      {ev.questions
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((q, i) => (
          <Card key={q.id} className="mb-2" style={{ border: '0.5px solid #e6e6ef' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span style={{ fontWeight: 500 }}>Pregunta {i + 1}</span>
                <span style={{ fontSize: 12 }}>
                  <Badge bg="light" text="dark" className="me-1" style={{ fontWeight: 400 }}>{q.questionType}</Badge>
                  {q.lenguaje && <Badge bg="light" text="dark" className="me-1" style={{ fontWeight: 400 }}>{q.lenguaje}</Badge>}
                  <span className="text-secondary">{q.score} pts</span>
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#555' }}>{q.questionText}</div>
            </Card.Body>
          </Card>
        ))}

      <hr className="my-4" />

      {/* Botón de rendir */}
      <div>
        <Button as={Link as any} to={`/evaluaciones/${ev.id}/rendir`} variant="primary" size="lg">
          Rendir evaluación
        </Button>
      </div>
    </Container>
  );
}
