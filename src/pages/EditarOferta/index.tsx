import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OfertaApi } from '../../api/OfertaApi';
import { HabilidadApi } from '../../api/HabilidadApi';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { HabilidadResponse } from '../../api/types/User';
import type { EvaluacionResponse } from '../../api/types/Evaluacion';
import { MODALIDAD, ESTADO_OFERTA } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorHandler';

const schema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  ubicacion: z.string().optional(),
  modalidad: z.string().min(1, 'Selecciona una modalidad'),
  salarioMin: z.string().optional(),
  salarioMax: z.string().optional(),
  scoreMinimoRequerido: z.string().optional(),
  evaluacionRequeridaId: z.string().optional(),
  notaMinimaAprobacion: z.string().optional(),
  estado: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function EditarOferta() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const ofertaId = Number(id);

  const [habilidades, setHabilidades] = useState<HabilidadResponse[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionResponse[]>([]);
  const [cargandoOferta, setCargandoOferta] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
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
      evaluacionRequeridaId: '',
      notaMinimaAprobacion: '70',
      estado: 'ACTIVA',
    },
  });

  const watchEvaluacionId = watch('evaluacionRequeridaId');

  useEffect(() => {
    let vivo = true;

    Promise.all([OfertaApi.getById(ofertaId), HabilidadApi.list(), EvaluacionApi.list(0, 100)])
      .then(([oferta, habs, evals]) => {
        if (!vivo) return;
        setHabilidades(habs);
        setEvaluaciones(evals.content);
        setSeleccionadas(oferta.skills.map((s) => s.id));
        reset({
          titulo: oferta.title ?? '',
          descripcion: oferta.description ?? '',
          ubicacion: oferta.ubicacion ?? '',
          modalidad: oferta.modalidad ?? 'REMOTO',
          salarioMin: oferta.minSalary != null ? String(oferta.minSalary) : '',
          salarioMax: oferta.maxSalary != null ? String(oferta.maxSalary) : '',
          scoreMinimoRequerido: oferta.minRequiredScore != null ? String(oferta.minRequiredScore) : '',
          evaluacionRequeridaId: oferta.evaluacionRequeridaId != null ? String(oferta.evaluacionRequeridaId) : '',
          notaMinimaAprobacion: oferta.notaMinimaAprobacion != null ? String(oferta.notaMinimaAprobacion) : '70',
          estado: oferta.status ?? 'ACTIVA',
        });
      })
      .catch((err) => vivo && setErrorCarga(getErrorMessage(err)))
      .finally(() => vivo && setCargandoOferta(false));

    return () => {
      vivo = false;
    };
  }, [ofertaId, reset]);

  function toggleHabilidad(hid: number) {
    setSeleccionadas((prev) =>
      prev.includes(hid) ? prev.filter((x) => x !== hid) : [...prev, hid]
    );
  }

  async function onSubmit(data: FormValues) {
    setError('');
    setGuardando(true);
    try {
      await OfertaApi.update(ofertaId, {
        titulo: data.titulo,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion || undefined,
        modalidad: data.modalidad,
        salarioMin: data.salarioMin ? Number(data.salarioMin) : undefined,
        salarioMax: data.salarioMax ? Number(data.salarioMax) : undefined,
        scoreMinimoRequerido: data.scoreMinimoRequerido ? Number(data.scoreMinimoRequerido) : undefined,
        evaluacionRequeridaId: data.evaluacionRequeridaId ? Number(data.evaluacionRequeridaId) : -1,
        notaMinimaAprobacion: data.evaluacionRequeridaId && data.notaMinimaAprobacion
          ? Number(data.notaMinimaAprobacion)
          : undefined,
        estado: data.estado,
        habilidadIds: seleccionadas,
      });
      navigate('/empresa/ofertas');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoOferta) {
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
        <Link to="/empresa/ofertas" className="brand-link">← Volver a mis ofertas</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <Link to="/empresa/ofertas" className="brand-link" style={{ fontSize: 14 }}>← Volver a mis ofertas</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mis ofertas', href: '/empresa/ofertas' }, { label: 'Editar oferta' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Editar oferta</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Form.Group className="mb-3">
          <Form.Label>Título *</Form.Label>
          <Form.Control
            {...register('titulo')}
            isInvalid={!!errors.titulo}
          />
          <Form.Control.Feedback type="invalid">{errors.titulo?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control
            as="textarea" rows={4}
            {...register('descripcion')}
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

        <Form.Group className="mb-3">
          <Form.Label>Evaluación requerida para postular (opcional)</Form.Label>
          <Form.Select {...register('evaluacionRequeridaId')}>
            <option value="">Ninguna — cualquiera puede postular</option>
            {evaluaciones.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </Form.Select>
          <Form.Text className="text-secondary">
            Si eliges una, el postulante deberá aprobarla antes de poder postular.
          </Form.Text>
          {watchEvaluacionId && (
            <div className="mt-2" style={{ maxWidth: 220 }}>
              <Form.Label style={{ fontSize: 13 }}>Nota mínima para aprobar (%)</Form.Label>
              <Form.Control
                type="number" min="0" max="100"
                {...register('notaMinimaAprobacion')}
              />
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Estado de la oferta</Form.Label>
          <Form.Select
            {...register('estado')}
          >
            {ESTADO_OFERTA.map((e) => <option key={e} value={e}>{e}</option>)}
          </Form.Select>
          <Form.Text className="text-secondary">
            PAUSADA o CERRADA la oculta de la lista pública de ofertas activas.
          </Form.Text>
        </Form.Group>

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

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={guardando} aria-busy={guardando}>
            {guardando ? <><Spinner size="sm" role="status" /> <span className="visually-hidden">Guardando cambios</span></> : 'Guardar cambios'}
          </Button>
          <Button as={Link as any} to="/empresa/ofertas" variant="outline-secondary" disabled={guardando}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
