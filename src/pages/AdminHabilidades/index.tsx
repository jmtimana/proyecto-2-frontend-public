import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HabilidadApi } from '../../api/HabilidadApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { HabilidadResponse } from '../../api/types/User';
import { getErrorMessage } from '../../utils/errorHandler';

export default function AdminHabilidades() {
  const [habilidades, setHabilidades] = useState<HabilidadResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [form, setForm] = useState({ nombre: '', categoria: '', descripcion: '' });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  function cargar() {
    HabilidadApi.list()
      .then((h) => { setHabilidades(h); setErrorCarga(''); })
      .catch((err) => setErrorCarga(getErrorMessage(err)))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando(true);
    try {
      await HabilidadApi.create({
        nombre: form.nombre,
        categoria: form.categoria || undefined,
        descripcion: form.descripcion || undefined,
      });
      setForm({ nombre: '', categoria: '', descripcion: '' });
      setMensaje({ tipo: 'success', texto: 'Habilidad creada correctamente.' });
      cargar();
    } catch (err: any) {
      setMensaje({ tipo: 'danger', texto: getErrorMessage(err) });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <Link to="/admin/evaluaciones" className="brand-link" style={{ fontSize: 14 }}>← Volver a evaluaciones</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Admin', href: '/admin/evaluaciones' }, { label: 'Habilidades' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Habilidades</h3>

      {cargando && <div className="text-center py-4"><Spinner style={{ color: 'var(--brand)' }} /></div>}
      {!cargando && errorCarga && <Alert variant="danger">{errorCarga}</Alert>}
      {!cargando && !errorCarga && (
        <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
          <Card.Body className="p-3">
            {habilidades.length === 0 ? (
              <span className="text-secondary" style={{ fontSize: 14 }}>No hay habilidades registradas todavía.</span>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {habilidades.map((h) => (
                  <Badge key={h.id} bg="light" text="dark" style={{ fontWeight: 400, padding: '8px 12px', border: '0.5px solid #ddd' }}>
                    {h.name}{h.category ? ` · ${h.category}` : ''}
                  </Badge>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Card style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-4">
          <h5 style={{ fontWeight: 600 }} className="mb-3">Nueva habilidad</h5>
          {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}
          <Form onSubmit={crear}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej. Spring Boot" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ej. Backend" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={guardando}>
              {guardando ? <Spinner size="sm" /> : '+ Crear habilidad'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
