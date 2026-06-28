import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import { RespuestaApi } from '../../api/RespuestaApi';
import type { EvaluacionDetailResponse, PreguntaResponse } from '../../api/types/Evaluacion';
import type { RespuestaResponse } from '../../api/types/Respuesta';

function ultimaRespuesta(respuestas: RespuestaResponse[], preguntaId: number): RespuestaResponse | null {
  const delaPregunta = respuestas.filter((r) => r.preguntaId === preguntaId);
  if (delaPregunta.length === 0) return null;
  return delaPregunta.reduce((mejor, r) => (r.attempts >= mejor.attempts ? r : mejor));
}

function estadoBadge(status: string | undefined) {
  if (status === 'CORRECTA') return <Badge bg="success">✅ Correcta</Badge>;
  if (status === 'INCORRECTA') return <Badge bg="danger">❌ Incorrecta</Badge>;
  if (status === 'ERROR') return <Badge bg="warning" text="dark">⚠️ Error</Badge>;
  if (status === 'PENDIENTE') return <Badge bg="secondary">⏳ Pendiente</Badge>;
  return <Badge bg="light" text="dark">Sin responder</Badge>;
}

function Bloque({ titulo, contenido }: { titulo: string; contenido: string }) {
  return (
    <div className="mt-2">
      <div className="text-secondary" style={{ fontSize: 12, marginBottom: 2 }}>{titulo}</div>
      <pre
        style={{
          background: '#1e1e2e', color: '#e6e6f0', padding: '10px 12px', borderRadius: 8,
          fontSize: 12.5, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}
      >
        {contenido}
      </pre>
    </div>
  );
}

export default function ResultadoDetalle() {
  const { evaluacionId } = useParams();
  const id = Number(evaluacionId);

  const [evaluacion, setEvaluacion] = useState<EvaluacionDetailResponse | null>(null);
  const [respuestas, setRespuestas] = useState<RespuestaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    Promise.all([EvaluacionApi.getById(id), RespuestaApi.byEvaluacion(id)])
      .then(([ev, resp]) => {
        if (!vivo) return;
        setEvaluacion(ev);
        setRespuestas(resp);
      })
      .catch(() => vivo && setError('No se pudo cargar el detalle.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [id]);

  if (loading) {
    return <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>;
  }

  if (error || !evaluacion) {
    return (
      <Container className="py-5" style={{ maxWidth: 720 }}>
        <Alert variant="danger">{error || 'Evaluación no encontrada.'}</Alert>
        <Link to="/mis-resultados" className="brand-link">← Volver a mis resultados</Link>
      </Container>
    );
  }

  const preguntas: PreguntaResponse[] = [...evaluacion.questions].sort((a, b) => a.order - b.order);

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <Link to="/mis-resultados" className="brand-link" style={{ fontSize: 14 }}>← Volver a mis resultados</Link>
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-1">{evaluacion.title}</h3>
      <p className="text-secondary mb-4">Detalle de tus respuestas, pregunta por pregunta.</p>

      {preguntas.map((p, i) => {
        const r = ultimaRespuesta(respuestas, p.id);
        return (
          <Card key={p.id} className="mb-3" style={{ border: '0.5px solid #e6e6ef' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h6 style={{ fontWeight: 600, margin: 0 }}>Pregunta {i + 1}</h6>
                {estadoBadge(r?.status)}
              </div>
              <p style={{ whiteSpace: 'pre-line', fontSize: 14 }}>{p.questionText}</p>

              {r ? (
                <>
                  {r.submittedCode && <Bloque titulo="Tu código" contenido={r.submittedCode} />}
                  {r.obtainedOutput != null && r.obtainedOutput !== '' && (
                    <Bloque titulo="Salida obtenida" contenido={r.obtainedOutput} />
                  )}
                  <div className="text-secondary mt-2" style={{ fontSize: 12 }}>
                    Intentos: {r.attempts}
                    {r.executionTimeMs != null && ` · ${r.executionTimeMs} ms`}
                  </div>
                </>
              ) : (
                <div className="text-secondary" style={{ fontSize: 13 }}>No respondiste esta pregunta.</div>
              )}
            </Card.Body>
          </Card>
        );
      })}
    </Container>
  );
}
