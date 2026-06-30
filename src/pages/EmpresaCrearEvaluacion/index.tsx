import { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import Breadcrumb from '../../common/Breadcrumb';
import { DIFICULTAD, LENGUAJES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorHandler';

interface PreguntaForm {
  enunciado: string;
  lenguaje: string;
  solucionEsperada: string;
  puntaje: string;
}

const preguntaVacia: PreguntaForm = { enunciado: '', lenguaje: 'python', solucionEsperada: '', puntaje: '10' };

export default function EmpresaCrearEvaluacion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    dificultad: 'MEDIO',
    tiempoLimiteSegundos: '1800',
  });
  const [preguntas, setPreguntas] = useState<PreguntaForm[]>([{ ...preguntaVacia }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function updatePregunta(i: number, campo: keyof PreguntaForm, valor: string) {
    setPreguntas((prev) => prev.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));
  }

  function agregarPregunta() {
    setPreguntas((prev) => [...prev, { ...preguntaVacia }]);
  }

  function quitarPregunta(i: number) {
    setPreguntas((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validas = preguntas.filter((p) => p.enunciado.trim() && p.solucionEsperada.trim());
    if (validas.length === 0) {
      setError('Agrega al menos una pregunta con enunciado y solución esperada.');
      return;
    }

    setLoading(true);
    try {
      const creada = await EvaluacionApi.create({
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: 'PROGRAMACION',
        dificultad: form.dificultad,
        tiempoLimiteSegundos: form.tiempoLimiteSegundos ? Number(form.tiempoLimiteSegundos) : undefined,
        activa: true,
      });

      for (let i = 0; i < validas.length; i++) {
        const p = validas[i];
        await EvaluacionApi.createPregunta(creada.id, {
          enunciado: p.enunciado,
          tipoPregunta: 'CODIGO',
          lenguaje: p.lenguaje,
          codigoPlantilla: '',
          solucionEsperada: p.solucionEsperada,
          puntaje: p.puntaje ? Number(p.puntaje) : 10,
          orden: i + 1,
        });
      }

      navigate('/empresa/evaluaciones');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Link to="/empresa/evaluaciones" className="brand-link" style={{ fontSize: 14 }}>← Volver a mis evaluaciones</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mis evaluaciones', href: '/empresa/evaluaciones' }, { label: 'Nueva evaluación' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-1">Nueva evaluación</h3>
      <p className="text-secondary mb-4">
        Esta evaluación es solo para tus ofertas: no suma al SkillMatch score de los estudiantes.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título *</Form.Label>
          <Form.Control name="titulo" value={form.titulo} onChange={update} required placeholder="Ej. Prueba técnica Backend" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control as="textarea" rows={3} name="descripcion" value={form.descripcion} onChange={update} required />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Dificultad</Form.Label>
              <Form.Select name="dificultad" value={form.dificultad} onChange={update}>
                {DIFICULTAD.map((d) => <option key={d} value={d}>{d}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tiempo límite (segundos)</Form.Label>
              <Form.Control type="number" name="tiempoLimiteSegundos" value={form.tiempoLimiteSegundos} onChange={update} />
            </Form.Group>
          </Col>
        </Row>

        <hr className="my-4" />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontWeight: 600, margin: 0 }}>Preguntas (código)</h5>
          <Button variant="outline-primary" size="sm" onClick={agregarPregunta} type="button">+ Agregar pregunta</Button>
        </div>

        <Alert variant="light" style={{ fontSize: 13 }}>
          El alumno escribe código que se ejecuta con Piston. Se aprueba si la <strong>salida exacta</strong> coincide
          con la "solución esperada". Sé claro con el formato pedido.
        </Alert>

        {preguntas.map((p, i) => (
          <Card key={i} className="mb-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong style={{ fontSize: 14 }}>Pregunta {i + 1}</strong>
                {preguntas.length > 1 && (
                  <Button variant="outline-danger" size="sm" type="button" onClick={() => quitarPregunta(i)}>Quitar</Button>
                )}
              </div>
              <Form.Group className="mb-2">
                <Form.Label style={{ fontSize: 13 }}>Enunciado</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  value={p.enunciado}
                  onChange={(e) => updatePregunta(i, 'enunciado', e.target.value)}
                  placeholder="Ej. Imprime la suma de los números del 1 al 100."
                />
              </Form.Group>
              <Row>
                <Col xs={6} md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: 13 }}>Lenguaje</Form.Label>
                    <Form.Select value={p.lenguaje} onChange={(e) => updatePregunta(i, 'lenguaje', e.target.value)}>
                      {LENGUAJES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: 13 }}>Puntaje</Form.Label>
                    <Form.Control type="number" min="1" value={p.puntaje} onChange={(e) => updatePregunta(i, 'puntaje', e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: 13 }}>Solución esperada (salida exacta)</Form.Label>
                    <Form.Control
                      value={p.solucionEsperada}
                      onChange={(e) => updatePregunta(i, 'solucionEsperada', e.target.value)}
                      placeholder="Ej. 5050"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}

        <Button type="submit" variant="primary" disabled={loading} className="mt-2">
          {loading ? <Spinner size="sm" /> : 'Crear evaluación'}
        </Button>
      </Form>
    </Container>
  );
}
