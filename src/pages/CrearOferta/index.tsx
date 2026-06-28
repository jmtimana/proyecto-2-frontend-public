import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OfertaApi } from '../../api/OfertaApi';
import { HabilidadApi } from '../../api/HabilidadApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { HabilidadResponse } from '../../api/types/User';
import { MODALIDAD } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorHandler';

const schema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  ubicacion: z.string().optional(),
  modalidad: z.string().min(1, 'Selecciona una modalidad'),
  salarioMin: z.string().optional(),
  salarioMax: z.string().optional(),
  scoreMinimoRequerido: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CrearOferta() {
  const navigate = useNavigate();

  const [habilidades, setHabilidades] = useState<HabilidadResponse[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      ubicacion: '',
      modalidad: 'REMOTO',
      salarioMin: '',
      salarioMax: '',
      scoreMinimoRequerido: '',
    },
  });

  useEffect(() => {
    HabilidadApi.list().then(setHabilidades).catch(() => {});
  }, []);

  function toggleHabilidad(id: number) {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function onSubmit(data: FormValues) {
    setError('');
    setLoading(true);
    try {
      await OfertaApi.create({
        titulo: data.titulo,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion || undefined,
        modalidad: data.modalidad,
        salarioMin: data.salarioMin ? Number(data.salarioMin) : undefined,
        salarioMax: data.salarioMax ? Number(data.salarioMax) : undefined,
        scoreMinimoRequerido: data.scoreMinimoRequerido ? Number(data.scoreMinimoRequerido) : undefined,
        habilidadIds: seleccionadas,
      });
      navigate('/empresa/ofertas');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <Link to="/empresa/ofertas" className="brand-link" style={{ fontSize: 14 }}>← Volver a mis ofertas</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mis ofertas', href: '/empresa/ofertas' }, { label: 'Nueva oferta' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Publicar nueva oferta</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Form.Group className="mb-3">
          <Form.Label>Título *</Form.Label>
          <Form.Control
            {...register('titulo')}
            placeholder="Ej. Desarrollador Backend Java"
            isInvalid={!!errors.titulo}
          />
          <Form.Control.Feedback type="invalid">{errors.titulo?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control
            as="textarea" rows={4}
            {...register('descripcion')}
            placeholder="Describe el puesto, responsabilidades y requisitos..."
            isInvalid={!!errors.descripcion}
          />
          <Form.Control.Feedback type="invalid">{errors.descripcion?.message}</Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ubicación</Form.Label>
              <Form.Control
                {...register('ubicacion')}
                placeholder="Ej. Lima, Perú"
                isInvalid={!!errors.ubicacion}
              />
              <Form.Control.Feedback type="invalid">{errors.ubicacion?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Modalidad</Form.Label>
              <Form.Select
                {...register('modalidad')}
                isInvalid={!!errors.modalidad}
              >
                {MODALIDAD.map((m) => <option key={m} value={m}>{m}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.modalidad?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Salario mín. (S/)</Form.Label>
              <Form.Control
                type="number"
                {...register('salarioMin')}
                isInvalid={!!errors.salarioMin}
              />
              <Form.Control.Feedback type="invalid">{errors.salarioMin?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Salario máx. (S/)</Form.Label>
              <Form.Control
                type="number"
                {...register('salarioMax')}
                isInvalid={!!errors.salarioMax}
              />
              <Form.Control.Feedback type="invalid">{errors.salarioMax?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Score mín. (0-1)</Form.Label>
              <Form.Control
                type="number" step="0.1" min="0" max="1"
                {...register('scoreMinimoRequerido')}
                isInvalid={!!errors.scoreMinimoRequerido}
              />
              <Form.Control.Feedback type="invalid">{errors.scoreMinimoRequerido?.message}</Form.Control.Feedback>
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

        <Button type="submit" variant="primary" disabled={loading} aria-busy={loading}>
          {loading ? <><Spinner size="sm" role="status" /> <span className="visually-hidden">Publicando oferta</span></> : 'Publicar oferta'}
        </Button>
      </Form>
    </Container>
  );
}
