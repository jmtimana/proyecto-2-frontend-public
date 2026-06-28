import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { EvaluacionDetailResponse } from '../../api/types/Evaluacion';
import { TIPO_PREGUNTA, LENGUAJES } from '../../utils/constants';

const FORM_VACIO = {
  enunciado: '',
  tipoPregunta: 'CODIGO',
  lenguaje: 'python',
  codigoPlantilla: '',
  solucionEsperada: '',
  puntaje: '10',
};

export default function AdminPreguntas() {
  const { id } = useParams<{ id: string }>();
  const evalId = Number(id);

  const [evaluacion, setEvaluacion] = useState<EvaluacionDetailResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  function cargar() {
    EvaluacionApi.getById(evalId)
      .then((ev) => {
        setEvaluacion(ev);
        setErrorCarga('');
      })
      .catch(() => setErrorCarga('No se pudo cargar la evaluación.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();

  }, [evalId]);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando(true);
    try {

      const siguienteOrden = (evaluacion?.questions.length ?? 0) + 1;
      await EvaluacionApi.createPregunta(evalId, {
        enunciado: form.enunciado,
        tipoPregunta: form.tipoPregunta,
        lenguaje: form.lenguaje || undefined,
        codigoPlantilla: form.codigoPlantilla || undefined,
        solucionEsperada: form.solucionEsperada,
        puntaje: form.puntaje ? Number(form.puntaje) : 0,
        orden: siguienteOrden,
      });
      setForm(FORM_VACIO);
      setMensaje({ tipo: 'success', texto: 'Pregunta agregada correctamente.' });
      cargar();
    } catch (err: any) {
      setMensaje({ tipo: 'danger', texto: err?.response?.data?.message ?? 'No se pudo agregar la pregunta.' });
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: 720 }}>
        <Spinner style={{ color: 'var(--brand)' }} />
      </Container>
    );
  }

  if (errorCarga || !evaluacion) {
    return (
      <Container className="py-5" style={{ maxWidth: 720 }}>
        <Alert variant="danger">{errorCarga || 'No se encontró la evaluación.'}</Alert>
        <Link to="/admin/evaluaciones" className="brand-link">← Volver a evaluaciones</Link>
      </Container>
    );
  }

  const preguntas = evaluacion.questions ?? [];

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <Link to="/admin/evaluaciones" className="brand-link" style={{ fontSize: 14 }}>← Volver a evaluaciones</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Admin', href: '/admin/evaluaciones' }, { label: 'Preguntas' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-1">Preguntas · {evaluacion.title}</h3>
      <p className="text-secondary mb-4">{preguntas.length} pregunta(s) en esta evaluación.</p>

      {preguntas.length === 0 ? (
        <div className="text-center py-4 mb-4" style={{ color: '#999', background: '#fafafa', borderRadius: 12 }}>
          <div style={{ fontSize: 34 }}>❓</div>
          <p className="mt-2 mb-0">Aún no hay preguntas. Agrega la primera abajo.</p>
        </div>
      ) : (
        preguntas
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((p) => (
            <Card key={p.id} className="mb-2" style={{ border: '0.5px solid #e6e6ef' }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <span className="text-secondary" style={{ fontSize: 12 }}>#{p.order}</span>
                    <div style={{ fontWeight: 500 }}>{p.questionText}</div>
                  </div>
                  <div className="text-end" style={{ flexShrink: 0 }}>
                    <Badge bg="light" text="dark" style={{ fontWeight: 400 }}>{p.questionType}</Badge>
                    {p.lenguaje && <Badge bg="light" text="dark" className="ms-1" style={{ fontWeight: 400 }}>{p.lenguaje}</Badge>}
                    <div className="text-secondary mt-1" style={{ fontSize: 12 }}>{p.score} pts</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))
      )}

      <Card className="mt-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-4">
          <h5 style={{ fontWeight: 600 }} className="mb-3">Agregar pregunta</h5>
          {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

          <Form onSubmit={agregar}>
            <Form.Group className="mb-3">
              <Form.Label>Enunciado *</Form.Label>
              <Form.Control as="textarea" rows={2} name="enunciado" value={form.enunciado} onChange={update} required placeholder="Ej. Escribe un programa que imprima el número 5" />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de pregunta</Form.Label>
                  <Form.Select name="tipoPregunta" value={form.tipoPregunta} onChange={update}>
                    {TIPO_PREGUNTA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lenguaje</Form.Label>
                  <Form.Select name="lenguaje" value={form.lenguaje} onChange={update}>
                    {LENGUAJES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Puntaje</Form.Label>
                  <Form.Control type="number" name="puntaje" value={form.puntaje} onChange={update} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Solución esperada *</Form.Label>
              <Form.Control as="textarea" rows={2} name="solucionEsperada" value={form.solucionEsperada} onChange={update} required placeholder="La salida EXACTA que debe imprimir el programa. Ej: 5" />
              <Form.Text className="text-secondary">
                Se compara con el stdout del estudiante (ignorando espacios al inicio y final).
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Código plantilla (opcional)</Form.Label>
              <Form.Control as="textarea" rows={4} name="codigoPlantilla" value={form.codigoPlantilla} onChange={update} placeholder="Código inicial que verá el estudiante en el editor (puede ir vacío)." style={{ fontFamily: 'monospace', fontSize: 13 }} />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={guardando}>
              {guardando ? <Spinner size="sm" /> : '+ Agregar pregunta'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
