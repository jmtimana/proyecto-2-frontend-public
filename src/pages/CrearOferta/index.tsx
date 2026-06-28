import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { OfertaApi } from '../../api/OfertaApi';
import { HabilidadApi } from '../../api/HabilidadApi';
import type { HabilidadResponse } from '../../api/types/User';
import { MODALIDAD } from '../../utils/constants';

export default function CrearOferta() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    modalidad: 'REMOTO',
    salarioMin: '',
    salarioMax: '',
    scoreMinimoRequerido: '',
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
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await OfertaApi.create({
        titulo: form.titulo,
        descripcion: form.descripcion,
        ubicacion: form.ubicacion || undefined,
        modalidad: form.modalidad,

        salarioMin: form.salarioMin ? Number(form.salarioMin) : undefined,
        salarioMax: form.salarioMax ? Number(form.salarioMax) : undefined,
        scoreMinimoRequerido: form.scoreMinimoRequerido ? Number(form.scoreMinimoRequerido) : undefined,
        habilidadIds: seleccionadas,
      });
      navigate('/empresa/ofertas');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo crear la oferta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <Link to="/empresa/ofertas" className="brand-link" style={{ fontSize: 14 }}>← Volver a mis ofertas</Link>
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Publicar nueva oferta</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título *</Form.Label>
          <Form.Control name="titulo" value={form.titulo} onChange={update} required placeholder="Ej. Desarrollador Backend Java" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control as="textarea" rows={4} name="descripcion" value={form.descripcion} onChange={update} required placeholder="Describe el puesto, responsabilidades y requisitos..." />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ubicación</Form.Label>
              <Form.Control name="ubicacion" value={form.ubicacion} onChange={update} placeholder="Ej. Lima, Perú" />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Modalidad</Form.Label>
              <Form.Select name="modalidad" value={form.modalidad} onChange={update}>
                {MODALIDAD.map((m) => <option key={m} value={m}>{m}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Salario mín. (S/)</Form.Label>
              <Form.Control type="number" name="salarioMin" value={form.salarioMin} onChange={update} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Salario máx. (S/)</Form.Label>
              <Form.Control type="number" name="salarioMax" value={form.salarioMax} onChange={update} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Score mín. (0-1)</Form.Label>
              <Form.Control type="number" step="0.1" min="0" max="1" name="scoreMinimoRequerido" value={form.scoreMinimoRequerido} onChange={update} />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Habilidades requeridas</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {habilidades.length === 0 && <span className="text-secondary" style={{ fontSize: 13 }}>No hay habilidades registradas.</span>}
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
          {loading ? <Spinner size="sm" /> : 'Publicar oferta'}
        </Button>
      </Form>
    </Container>
  );
}
