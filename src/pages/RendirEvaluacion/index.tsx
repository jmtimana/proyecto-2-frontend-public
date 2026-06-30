import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { ChartNoAxesCombined, CircleCheck, CircleX, Rocket, TriangleAlert } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';

import Breadcrumb from '../../common/Breadcrumb';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import { RespuestaApi } from '../../api/RespuestaApi';
import { getErrorMessage } from '../../utils/errorHandler';
import { useTheme } from '../../context/ThemeContext';
import type {
  EvaluacionDetailResponse,
  PreguntaResponse,
} from '../../api/types/Evaluacion';

function extensionsFor(lenguaje: string | null) {
  const l = (lenguaje || '').toLowerCase();
  if (l.includes('python')) return [python()];
  if (l.includes('java') && !l.includes('script')) return [java()];
  if (l.includes('javascript') || l.includes('node')) return [javascript()];
  if (l.includes('sql')) return [sql()];
  return [];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function PreguntaCard({
  pregunta,
  numero,
  evaluacionId,
}: {
  pregunta: PreguntaResponse;
  numero: number;
  evaluacionId: number;
}) {
  const { theme: appTheme } = useTheme();
  const [code, setCode] = useState(pregunta.templateCode || '');
  const [phase, setPhase] = useState<'editing' | 'running' | 'done'>('editing');
  const [status, setStatus] = useState<string>('');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState('');

  const vivo = useRef(true);
  useEffect(() => {
    vivo.current = true;
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

      const creada = await RespuestaApi.submit({
        preguntaId: pregunta.id,
        evaluacionId,
        codigo: code,
        lenguaje: pregunta.lenguaje || 'python',
      });

      let intentos = 0;
      const MAX = 20;
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

      if (vivo.current) {
        setError('La calificación está tardando más de lo normal. Intenta de nuevo en un momento.');
        setPhase('editing');
      }
    } catch (e: any) {
      if (!vivo.current) return;
      setError(getErrorMessage(e));
      setPhase('editing');
    }
  }

  const correcta = status === 'CORRECTA';

  return (
    <Card className="mb-4" style={{ border: '0.5px solid var(--app-border)' }}>
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
        <p style={{ color: 'var(--app-text)' }}>{pregunta.questionText}</p>

        <div style={{ border: '1px solid var(--app-border)', borderRadius: 8, overflow: 'hidden' }}>
          <CodeMirror
            value={code}
            height="200px"
            extensions={ext}
            theme={appTheme === 'dark' ? oneDark : undefined}
            editable={phase !== 'running' && !correcta}
            onChange={(v) => setCode(v)}
          />
        </div>

        {error && <Alert variant="danger" className="mt-3 mb-0 py-2" style={{ fontSize: 14 }}>{error}</Alert>}

        {phase === 'done' && (
          <div className="mt-3">
            {correcta ? (
              <Alert variant="success" className="mb-0 py-2">
                <strong className="d-inline-flex align-items-center gap-1"><CircleCheck size={16} /> Correcta</strong>
              </Alert>
            ) : status === 'ERROR' ? (
              <Alert variant="warning" className="mb-0 py-2">
                <strong className="d-inline-flex align-items-center gap-1"><TriangleAlert size={16} /> Error al ejecutar</strong>
                {output && <pre className="mt-2 mb-0" style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{output}</pre>}
              </Alert>
            ) : (
              <Alert variant="danger" className="mb-0 py-2">
                <strong className="d-inline-flex align-items-center gap-1"><CircleX size={16} /> Incorrecta</strong>
                {output != null && (
                  <div className="mt-2" style={{ fontSize: 13 }}>
                    Tu salida fue: <code>{output || '(vacía)'}</code>
                  </div>
                )}
              </Alert>
            )}
          </div>
        )}

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
      .catch((err) => vivo && setLoadError(getErrorMessage(err)))
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
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Evaluaciones', href: '/evaluaciones' }, { label: 'Rendir evaluación' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-1">{ev.title}</h3>
      <p className="text-secondary">{ev.description}</p>

      {!started ? (

        <Card style={{ border: '0.5px solid var(--app-border)' }} className="mt-4">
          <Card.Body className="p-4 text-center">
            <Rocket size={40} color="var(--brand)" aria-hidden="true" />
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

        <div className="mt-4">
          {startWarn && <Alert variant="info" className="py-2" style={{ fontSize: 14 }}>{startWarn}</Alert>}
          {preguntas.map((q, i) => (
            <PreguntaCard key={q.id} pregunta={q} numero={i + 1} evaluacionId={evalId} />
          ))}
          <div className="text-center mt-4">
            <Button as={Link as any} to="/mis-resultados" variant="outline-secondary" className="d-inline-flex align-items-center gap-2">
              <ChartNoAxesCombined size={16} aria-hidden="true" />
              Ver mis resultados
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
