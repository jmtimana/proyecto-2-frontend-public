import { useEffect, useMemo, useState } from 'react';
import { Container, Spinner, Alert, Button, Card, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChartNoAxesCombined, Check, Puzzle, Tags, Target, Timer } from 'lucide-react';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import { ResultadoApi } from '../../api/ResultadoApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { Page } from '../../api/types/Page';
import type { EvaluacionResponse } from '../../api/types/Evaluacion';

const PAGE_SIZE = 10;
type EvaluacionSort = 'recent_desc' | 'title_asc' | 'difficulty_asc' | 'score_desc' | 'time_asc';

const dificultadRank: Record<string, number> = {
  FACIL: 1,
  MEDIO: 2,
  DIFICIL: 3,
};

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

  const [completadas, setCompletadas] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<EvaluacionSort>('recent_desc');

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    setError('');

    Promise.all([EvaluacionApi.list(page, PAGE_SIZE), ResultadoApi.list(0, 50)])
      .then(([evs, resultados]) => {
        if (!vivo) return;
        setData(evs);
        const hechas = new Set(
          resultados.content
            .filter((r) => r.status === 'COMPLETADA')
            .map((r) => r.evaluacionId)
        );
        setCompletadas(hechas);
      })
      .catch(() => vivo && setError('No se pudieron cargar las evaluaciones.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [page]);

  const evaluacionesOrdenadas = useMemo(() => {
    const items = data?.content ?? [];
    return items.slice().sort((a, b) => {
      if (sort === 'title_asc') return a.title.localeCompare(b.title);
      if (sort === 'difficulty_asc') {
        return (dificultadRank[a.difficulty] ?? 99) - (dificultadRank[b.difficulty] ?? 99);
      }
      if (sort === 'score_desc') return (b.maxScore ?? -1) - (a.maxScore ?? -1);
      if (sort === 'time_asc') {
        return (a.timeLimitSeconds ?? Number.MAX_SAFE_INTEGER) - (b.timeLimitSeconds ?? Number.MAX_SAFE_INTEGER);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [data?.content, sort]);

  function TarjetaEval({ ev }: { ev: EvaluacionResponse }) {
    const hecha = completadas.has(ev.id);
    const contenido = (
      <Card
        className="mb-3"
        style={{
          border: '0.5px solid var(--app-border)',
          cursor: hecha ? 'default' : 'pointer',
          opacity: hecha ? 0.7 : 1,
          background: hecha ? 'var(--app-surface-soft)' : 'var(--app-surface)',
        }}
      >
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1" style={{ fontWeight: 600 }}>{ev.title}</h5>
              <p className="text-secondary mb-2" style={{ fontSize: 14 }}>{ev.description}</p>
            </div>
            {hecha ? (
              <Badge bg="success" className="d-inline-flex align-items-center gap-1"><Check size={13} /> Completado</Badge>
            ) : (
              <Badge bg={dificultadColor(ev.difficulty)}>{ev.difficulty}</Badge>
            )}
          </div>
          <div className="d-flex gap-3 text-secondary" style={{ fontSize: 13 }}>
            {tiempo(ev.timeLimitSeconds) && <span className="d-inline-flex align-items-center gap-1"><Timer size={13} /> {tiempo(ev.timeLimitSeconds)}</span>}
            {ev.maxScore != null && <span className="d-inline-flex align-items-center gap-1"><Target size={13} /> {ev.maxScore} pts</span>}
            {ev.skills.length > 0 && <span className="d-inline-flex align-items-center gap-1"><Tags size={13} /> {ev.skills.map((s) => s.name).join(', ')}</span>}
          </div>
          {hecha && (
            <div className="mt-2" style={{ fontSize: 12, color: '#198754' }}>
              Ya rendiste esta evaluación. Revisa tu nota en{' '}
              <Link to="/mis-resultados" className="brand-link">Mis resultados</Link>.
            </div>
          )}
        </Card.Body>
      </Card>
    );

    if (hecha) return contenido;
    return (
      <Link to={`/evaluaciones/${ev.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {contenido}
      </Link>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Evaluaciones' }]} />
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h3 style={{ fontWeight: 600, margin: 0 }}>Evaluaciones</h3>
        <Button as={Link as any} to="/mis-resultados" variant="outline-secondary" size="sm" className="d-inline-flex align-items-center gap-1">
          <ChartNoAxesCombined size={15} aria-hidden="true" />
          Mis resultados
        </Button>
      </div>
      <p className="text-secondary mb-4">Rinde evaluaciones técnicas para subir tu SkillMatch Score.</p>

      <div className="d-flex justify-content-end mb-3">
        <Form.Group style={{ minWidth: 220 }}>
          <Form.Label style={{ fontSize: 13 }}>Ordenar por</Form.Label>
          <Form.Select value={sort} onChange={(e) => setSort(e.target.value as EvaluacionSort)}>
            <option value="recent_desc">Mas recientes</option>
            <option value="title_asc">Nombre A-Z</option>
            <option value="difficulty_asc">Dificultad menor</option>
            <option value="score_desc">Mayor puntaje</option>
            <option value="time_asc">Menor tiempo</option>
          </Form.Select>
        </Form.Group>
      </div>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && data && data.empty && (
        <div className="text-center py-5" style={{ color: 'var(--app-empty)' }}>
          <Puzzle size={40} className="mb-2" aria-hidden="true" />
          <p className="mt-2 mb-0">Todavía no hay evaluaciones disponibles.</p>
        </div>
      )}

      {!loading && !error && data && !data.empty && (
        <>
          {evaluacionesOrdenadas.map((ev) => <TarjetaEval key={ev.id} ev={ev} />)}

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
