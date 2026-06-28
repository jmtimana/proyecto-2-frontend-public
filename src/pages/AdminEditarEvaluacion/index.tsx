import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import { HabilidadApi } from '../../api/HabilidadApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { HabilidadResponse } from '../../api/types/User';
import { DIFICULTAD } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorHandler';

export default function AdminEditarEvaluacion() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const evalId = Number(id);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'PROGRAMACION',
    dificultad: 'MEDIO',
    tiempoLimiteSegundos: '',
    puntajeMaximo: '',
    activa: true,
  });
  const [habilidades, setHabilidades] = useState<HabilidadResponse[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    Promise.all([EvaluacionApi.getById(evalId), HabilidadApi.list()])
      .then(([ev, habs]) => {
        if (!vivo) return;
        setHabilidades(habs);
        setSeleccionadas(ev.skills.map((s) => s.id));
        setForm({
          titulo: ev.title ?? '',
          descripcion: ev.description ?? '',
          tipo: ev.type ?? 'PROGRAMACION',
          dificultad: ev.difficulty ?? 'MEDIO',
          tiempoLimiteSegundos: ev.timeLimitSeconds != null ? String(ev.timeLimitSeconds) : '',
          puntajeMaximo: ev.maxScore != null ? String(ev.maxScore) : '',
          activa: ev.active,
        });
      })
      .catch(() => vivo && setErrorCarga('No se pudo cargar la evaluación.'))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, [evalId]);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleHabilidad(hid: number) {
    setSeleccionadas((prev) => (prev.includes(hid) ? prev.filter((x) => x !== hid) : [...prev, hid]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await EvaluacionApi.update(evalId, {
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: form.tipo,
        dificultad: form.dificultad,
        tiempoLimiteSegundos: form.tiempoLimiteSegundos ? Number(form.tiempoLimiteSegundos) : undefined,
        puntajeMaximo: form.puntajeMaximo ? Number(form.puntajeMaximo) : undefined,
        activa: form.activa,
        habilidadIds: seleccionadas,
      });
      navigate('/admin/evaluaciones');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: 680 }}>
        <Spinner style={{ color: 'var(--brand)' }} />
      </Container>
    );
  }

  if (errorCarga) {
    return (
      <Container className="py-5" style={{ maxWidth: 680 }}>
        <Alert variant="danger">{errorCarga}</Alert>
        <Link to="/admin/evaluaciones" className="brand-link">← Volver a evaluaciones</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <Link to="/admin/evaluaciones" className="brand-link" style={{ fontSize: 14 }}>← Volver a evaluaciones</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Admin', href: '/admin/evaluaciones' }, { label: 'Editar evaluación' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Editar evaluación</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título *</Form.Label>
          <Form.Control name="titulo" value={form.titulo} onChange={update} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control as="textarea" rows={3} name="descripcion" value={form.descripcion} onChange={update} required />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Control name="tipo" value={form.tipo} onChange={update} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Dificultad</Form.Label>
              <Form.Select name="dificultad" value={form.dificultad} onChange={update}>
                {DIFICULTAD.map((d) => <option key={d} value={d}>{d}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tiempo límite (segundos)</Form.Label>
              <Form.Control type="number" name="tiempoLimiteSegundos" value={form.tiempoLimiteSegundos} onChange={update} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Puntaje máximo</Form.Label>
              <Form.Control type="number" name="puntajeMaximo" value={form.puntajeMaximo} onChange={update} />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            id="activa-editar"
            label="Evaluación activa (visible para los estudiantes)"
            checked={form.activa}
            onChange={(e) => setForm({ ...form, activa: e.target.checked })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Habilidades asociadas</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {habilidades.length === 0 && <span className="text-secondary" style={{ fontSize: 13 }}>No hay habilidades registradas.</span>}
            {habilidades.map((h) => {
              const activa = seleccionadas.includes(h.id);
              return (
                <Badge
                  key={h.id}
                  onClick={() => toggleHabilidad(h.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleHabilidad(h.id);
                    }
                  }}
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={activa}
                  bg={activa ? 'primary' : 'light'}
                  text={activa ? undefined : 'dark'}
                  className="selectable-badge"
                  style={{ fontWeight: 400, padding: '8px 12px', border: '0.5px solid var(--app-border)' }}
                >
                  {h.name}
                </Badge>
              );
            })}
          </div>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={guardando} aria-busy={guardando}>
            {guardando ? <><Spinner size="sm" role="status" /> <span className="visually-hidden">Guardando cambios</span></> : 'Guardar cambios'}
          </Button>
          <Button as={Link as any} to={`/admin/evaluaciones/${evalId}/preguntas`} variant="outline-secondary" disabled={guardando}>
            Gestionar preguntas
          </Button>
        </div>
      </Form>
    </Container>
  );
}
