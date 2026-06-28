import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import { HabilidadApi } from '../../api/HabilidadApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { HabilidadResponse } from '../../api/types/User';
import { DIFICULTAD } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorHandler';

export default function AdminCrearEvaluacion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'PROGRAMACION',
    dificultad: 'MEDIO',
    tiempoLimiteSegundos: '3600',
    puntajeMaximo: '100',
    activa: true,
  });
  const [habilidades, setHabilidades] = useState<HabilidadResponse[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    HabilidadApi.list().then(setHabilidades).catch(() => {});
  }, []);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleHabilidad(id: number) {
    setSeleccionadas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const creada = await EvaluacionApi.create({
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: form.tipo,
        dificultad: form.dificultad,
        tiempoLimiteSegundos: form.tiempoLimiteSegundos ? Number(form.tiempoLimiteSegundos) : undefined,
        puntajeMaximo: form.puntajeMaximo ? Number(form.puntajeMaximo) : undefined,
        activa: form.activa,
        habilidadIds: seleccionadas,
      });

      navigate(`/admin/evaluaciones/${creada.id}/preguntas`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <Link to="/admin/evaluaciones" className="brand-link" style={{ fontSize: 14 }}>← Volver a evaluaciones</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Admin', href: '/admin/evaluaciones' }, { label: 'Nueva evaluación' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Nueva evaluación</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título *</Form.Label>
          <Form.Control name="titulo" value={form.titulo} onChange={update} required placeholder="Ej. Evaluación de Java Básico" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control as="textarea" rows={3} name="descripcion" value={form.descripcion} onChange={update} required />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Control name="tipo" value={form.tipo} onChange={update} placeholder="PROGRAMACION" />
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
              <Form.Text className="text-secondary">3600 = 1 hora</Form.Text>
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
            id="activa-nueva"
            label="Evaluación activa (visible para los estudiantes)"
            checked={form.activa}
            onChange={(e) => setForm({ ...form, activa: e.target.checked })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Habilidades asociadas</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {habilidades.length === 0 && <span className="text-secondary" style={{ fontSize: 13 }}>No hay habilidades. Créalas en la sección Habilidades.</span>}
            {habilidades.map((h) => {
              const activa = seleccionadas.includes(h.id);
              return (
                <Badge
                  key={h.id}
                  onClick={() => toggleHabilidad(h.id)}
                  bg={activa ? 'primary' : 'light'}
                  text={activa ? undefined : 'dark'}
                  style={{ cursor: 'pointer', fontWeight: 400, padding: '8px 12px', border: '0.5px solid #ddd' }}
                >
                  {h.name}
                </Badge>
              );
            })}
          </div>
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Crear y agregar preguntas'}
        </Button>
      </Form>
    </Container>
  );
}
