// =========================================================
// Editar una oferta existente (empresa).
// 1) Carga la oferta actual con GET /ofertas-laborales/{id} y rellena el form.
// 2) Carga las habilidades disponibles para el multiselect.
// 3) Al guardar -> PUT /ofertas-laborales/{id} (actualización parcial).
// Es "primo" de CrearOferta, pero además permite cambiar el ESTADO
// (ACTIVA / PAUSADA / CERRADA).
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { OfertaApi } from '../../api/OfertaApi';
import { HabilidadApi } from '../../api/HabilidadApi';
import type { HabilidadResponse } from '../../api/types/User';
import { MODALIDAD, ESTADO_OFERTA } from '../../utils/constants';

export default function EditarOferta() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const ofertaId = Number(id);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    modalidad: 'REMOTO',
    salarioMin: '',
    salarioMax: '',
    scoreMinimoRequerido: '',
    estado: 'ACTIVA',
  });
  const [habilidades, setHabilidades] = useState<HabilidadResponse[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  const [cargandoOferta, setCargandoOferta] = useState(true); // estado inicial: trayendo la oferta
  const [errorCarga, setErrorCarga] = useState('');
  const [error, setError] = useState(''); // error al guardar
  const [guardando, setGuardando] = useState(false);

  // Al montar: pedimos la oferta y las habilidades en paralelo.
  useEffect(() => {
    let vivo = true;

    Promise.all([OfertaApi.getById(ofertaId), HabilidadApi.list()])
      .then(([oferta, habs]) => {
        if (!vivo) return;
        setHabilidades(habs);
        setSeleccionadas(oferta.skills.map((s) => s.id));
        // Rellenamos el formulario con los datos actuales de la oferta.
        setForm({
          titulo: oferta.title ?? '',
          descripcion: oferta.description ?? '',
          ubicacion: oferta.ubicacion ?? '',
          modalidad: oferta.modalidad ?? 'REMOTO',
          salarioMin: oferta.minSalary != null ? String(oferta.minSalary) : '',
          salarioMax: oferta.maxSalary != null ? String(oferta.maxSalary) : '',
          scoreMinimoRequerido: oferta.minRequiredScore != null ? String(oferta.minRequiredScore) : '',
          estado: oferta.status ?? 'ACTIVA',
        });
      })
      .catch(() => vivo && setErrorCarga('No se pudo cargar la oferta.'))
      .finally(() => vivo && setCargandoOferta(false));

    return () => {
      vivo = false;
    };
  }, [ofertaId]);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleHabilidad(hid: number) {
    setSeleccionadas((prev) =>
      prev.includes(hid) ? prev.filter((x) => x !== hid) : [...prev, hid]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await OfertaApi.update(ofertaId, {
        titulo: form.titulo,
        descripcion: form.descripcion,
        ubicacion: form.ubicacion || undefined,
        modalidad: form.modalidad,
        salarioMin: form.salarioMin ? Number(form.salarioMin) : undefined,
        salarioMax: form.salarioMax ? Number(form.salarioMax) : undefined,
        scoreMinimoRequerido: form.scoreMinimoRequerido ? Number(form.scoreMinimoRequerido) : undefined,
        estado: form.estado,
        habilidadIds: seleccionadas,
      });
      navigate('/empresa/ofertas'); // guardada -> volvemos a la lista
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo guardar la oferta.');
    } finally {
      setGuardando(false);
    }
  }

  // Estado inicial: cargando la oferta.
  if (cargandoOferta) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: 680 }}>
        <Spinner style={{ color: 'var(--brand)' }} />
      </Container>
    );
  }

  // Estado: no se pudo cargar.
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
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Editar oferta</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título *</Form.Label>
          <Form.Control name="titulo" value={form.titulo} onChange={update} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control as="textarea" rows={4} name="descripcion" value={form.descripcion} onChange={update} required />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ubicación</Form.Label>
              <Form.Control name="ubicacion" value={form.ubicacion} onChange={update} />
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

        {/* Lo nuevo respecto a "crear": cambiar el estado de la oferta. */}
        <Form.Group className="mb-3">
          <Form.Label>Estado de la oferta</Form.Label>
          <Form.Select name="estado" value={form.estado} onChange={update}>
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

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : 'Guardar cambios'}
          </Button>
          <Button as={Link as any} to="/empresa/ofertas" variant="outline-secondary" disabled={guardando}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
