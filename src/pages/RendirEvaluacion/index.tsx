// =========================================================
// Rendir una evaluación: iniciar -> escribir código por
// pregunta -> enviar -> "vigilar" (polling) hasta que Piston
// califique -> mostrar resultado.
// Ruta: /evaluaciones/:id/rendir
// =========================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';

import { EvaluacionApi } from '../../api/EvaluacionApi';
import { RespuestaApi } from '../../api/RespuestaApi';
import type {
  EvaluacionDetailResponse,
  PreguntaResponse,
} from '../../api/types/Evaluacion';

// Elige la extensión de CodeMirror según el lenguaje de la pregunta.
function extensionsFor(lenguaje: string | null) {
  const l = (lenguaje || '').toLowerCase();
  if (l.includes('python')) return [python()];
  if (l.includes('java') && !l.includes('script')) return [java()];
  if (l.includes('javascript') || l.includes('node')) return [javascript()];
  if (l.includes('sql')) return [sql()];
  return [];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// =========================================================
// Tarjeta de una pregunta: editor + enviar + resultado.
// =========================================================
function PreguntaCard({
  pregunta,
  numero,
  evaluacionId,
}: {
  pregunta: PreguntaResponse;
  numero: number;
  evaluacionId: number;
}) {
  const [code, setCode] = useState(pregunta.templateCode || '');
  const [phase, setPhase] = useState<'editing' | 'running' | 'done'>('editing');
  const [status, setStatus] = useState<string>(''); // CORRECTA | INCORRECTA | ERROR
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Para cancelar el polling si el componente se desmonta.
  const vivo = useRef(true);
  useEffect(() => {
    vivo.current = true; // <- clave: re-activar al montar (arregla el bug de StrictMode)
    return () => {
      vivo.current = false;
    };
  }, []);

  const ext = useMemo(() => extensionsFor(pregunta.lenguaje), [pregunta.lenguaje]);

  async function enviar() {
    setError('');
    setStatus('');
    setOutput(null);
    setPhase('running');
    try {
      // 1. Enviar la respuesta -> queda PENDIENTE
      const creada = await RespuestaApi.submit({
        preguntaId: pregunta.id,
        evaluacionId,
        codigo: code,
        lenguaje: pregunta.lenguaje || 'python',
      });

      // 2. Polling: consultar el estado hasta que deje de estar PENDIENTE
      let intentos = 0;
      const MAX = 20; // ~40s
      while (vivo.current && intentos < MAX) {
        await sleep(2000);
        if (!vivo.current) return;
        const r = await RespuestaApi.getById(creada.id);
        if (r.status !== 'PENDIENTE') {
          setStatus(r.status);
          setOutput(r.obtainedOutput);
          setPhase('done');
          return;
        }
        intentos++;
      }
      // Si salió del bucle sin resolver
      if (vivo.current) {
        setError('La calificación está tardando más de lo normal. Intenta de nuevo en un momento.');
        setPhase('editing');
      }
    } catch (e: any) {
      if (!vivo.current) return;
      setError(
        e?.response?.data?.message ||
          'No se pudo enviar la respuesta. ¿Iniciaste la evaluación?'
      );
      setPhase('editing');
    }
  }

  const correcta = status === 'CORRECTA';

  return (
    <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ fontWeight: 600 }}>Pregunta {numero}</span>
          <span style={{ fontSize: 12 }}>
            {pregunta.lenguaje && (
              <Badge bg="light" text="dark" className="me-1" style={{ fontWeight: 400 }}>
                {pregunta.lenguaje}
              </Badge>
            )}
            <span className="text-secondary">{pregunta.score} pts</span>
          </span>
        </div>
        <p style={{ color: '#444' }}>{pregunta.questionText}</p>

        {/* Editor de código */}
        <div style={{ border: '1px solid #e0e0e8', borderRadius: 8, overflow: 'hidden' }}>
          <CodeMirror
            value={code}
            height="200px"
            extensions={ext}
            editable={phase !== 'running' && !correcta}
            onChange={(v) => setCode(v)}
          />
        </div>

        {error && <Alert variant="danger" className="mt-3 mb-0 py-2" style={{ fontSize: 14 }}>{error}</Alert>}

        {/* Resultado */}
        {phase === 'done' && (
          <div className="mt-3">
            {correcta ? (
              <Alert variant="success" className="mb-0 py-2"><strong>✅ Correcta</strong></Alert>
            ) : status === 'ERROR' ? (
              <Alert variant="warning" className="mb-0 py-2">
                <strong>⚠️ Error al ejecutar</strong>
                {output && <pre className="mt-2 mb-0" style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{output}</pre>}
              </Alert>
            ) : (
              <Alert variant="danger" className="mb-0 py-2">
                <strong>❌ Incorrecta</strong>
                {output != null && (
                  <div className="mt-2" style={{ fontSize: 13 }}>
                    Tu salida fue: <code>{output || '(vacía)'}</code>
                  </div>
                )}
              </Alert>
            )}
          </div>
        )}

        {/* Botón */}
        <div className="mt-3">
          {!correcta && (
            <Button variant="primary" onClick={enviar} disabled={phase === 'running'}>
              {phase === 'running' ? (
                <><Spinner size="sm" className="me-2" />Ejecutando…</>
              ) : phase === 'done' ? (
                'Reintentar'
              ) : (
                'Enviar respuesta'
              )}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

// =========================================================
// Página principal: intro -> iniciar -> responder.
// =========================================================
export default function RendirEvaluacion() {
  const { id } = useParams();
  const evalId = Number(id);

  const [ev, setEv] = useState<EvaluacionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startWarn, setStartWarn] = useState('');

  useEffect(() => {
    let vivo = true;
    EvaluacionApi.getById(evalId)
      .then((res) => vivo && setEv(res))
      .catch(() => vivo && setLoadError('No se pudo cargar la evaluación.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [evalId]);

  async function comenzar() {
    setStarting(true);
    setStartWarn('');
    try {
      await EvaluacionApi.iniciar(evalId);
    } catch (e: any) {
      // Si ya hay un intento en progreso, no es un error fatal: seguimos.
      setStartWarn('Ya tenías un intento en progreso, continuamos con ese.');
    } finally {
      setStarting(false);
      setStarted(true);
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>;

  if (loadError || !ev) {
    return (
      <Container className="py-5" style={{ maxWidth: 760 }}>
        <Alert variant="danger">{loadError || 'Evaluación no encontrada.'}</Alert>
        <Link to="/evaluaciones" className="brand-link">← Volver a evaluaciones</Link>
      </Container>
    );
  }

  const preguntas = ev.questions.slice().sort((a, b) => a.order - b.order);

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Link to={`/evaluaciones/${evalId}`} className="brand-link" style={{ fontSize: 14 }}>
        ← Volver al detalle
      </Link>
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-1">{ev.title}</h3>
      <p className="text-secondary">{ev.description}</p>

      {!started ? (
        // ---- Pantalla de intro ----
        <Card style={{ border: '0.5px solid #e6e6ef' }} className="mt-4">
          <Card.Body className="p-4 text-center">
            <div style={{ fontSize: 40 }}>🚀</div>
            <h5 className="mt-2" style={{ fontWeight: 600 }}>¿Listo para comenzar?</h5>
            <p className="text-secondary" style={{ fontSize: 14 }}>
              Tienes {preguntas.length} pregunta(s).
              {ev.timeLimitSeconds ? ` Tiempo sugerido: ${Math.round(ev.timeLimitSeconds / 60)} min.` : ''}
            </p>
            <Button variant="primary" size="lg" onClick={comenzar} disabled={starting}>
              {starting ? <><Spinner size="sm" className="me-2" />Iniciando…</> : 'Comenzar evaluación'}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        // ---- Responder las preguntas ----
        <div className="mt-4">
          {startWarn && <Alert variant="info" className="py-2" style={{ fontSize: 14 }}>{startWarn}</Alert>}
          {preguntas.map((q, i) => (
            <PreguntaCard key={q.id} pregunta={q} numero={i + 1} evaluacionId={evalId} />
          ))}
          <div className="text-center mt-4">
            <Button as={Link as any} to="/mis-resultados" variant="outline-secondary">
              📊 Ver mis resultados
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
