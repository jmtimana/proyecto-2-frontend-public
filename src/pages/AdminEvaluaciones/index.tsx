import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Card, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import type { Page } from '../../api/types/Page';
import type { EvaluacionResponse } from '../../api/types/Evaluacion';

const PAGE_SIZE = 10;

function dificultadColor(d: string) {
  if (d === 'FACIL') return 'success';
  if (d === 'MEDIO') return 'warning';
  if (d === 'DIFICIL') return 'danger';
  return 'secondary';
}

export default function AdminEvaluaciones() {
  const [data, setData] = useState<Page<EvaluacionResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [aEliminar, setAEliminar] = useState<EvaluacionResponse | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  function cargar() {
    setLoading(true);
    setError('');
    EvaluacionApi.list(page, PAGE_SIZE)
      .then(setData)
      .catch(() => setError('No se pudieron cargar las evaluaciones.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();

  }, [page]);

  async function confirmarEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await EvaluacionApi.remove(aEliminar.id);
      setAEliminar(null);
      cargar();
    } catch (err: any) {
      setErrorEliminar(err?.response?.data?.message ?? 'No se pudo eliminar la evaluación.');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 820 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontWeight: 600, margin: 0 }}>Administrar evaluaciones</h3>
          <p className="text-secondary mb-0">Crea evaluaciones, edítalas y gestiona sus preguntas.</p>
        </div>
        <div className="d-flex gap-2">
          <Button as={Link as any} to="/admin/habilidades" variant="outline-secondary">Habilidades</Button>
          <Button as={Link as any} to="/admin/evaluaciones/nueva" variant="primary">+ Nueva evaluación</Button>
        </div>
      </div>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && data && data.empty && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>🧩</div>
          <p className="mt-2 mb-0">No hay evaluaciones todavía.</p>
          <p style={{ fontSize: 13 }}>Crea la primera con el botón de arriba.</p>
        </div>
      )}

      {!loading && !error && data && !data.empty && (
        <>
          {data.content.map((ev) => (
            <Card key={ev.id} className="mb-3" style={{ border: '0.5px solid #e6e6ef' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h5 className="mb-0" style={{ fontWeight: 600 }}>{ev.title}</h5>
                      <Badge bg={dificultadColor(ev.difficulty)}>{ev.difficulty}</Badge>
                      <Badge bg={ev.active ? 'success' : 'secondary'}>{ev.active ? 'Activa' : 'Inactiva'}</Badge>
                    </div>
                    <p className="text-secondary mb-0" style={{ fontSize: 14 }}>{ev.description}</p>
                    <div className="text-secondary mt-1" style={{ fontSize: 13 }}>
                      {ev.maxScore != null && <>🎯 {ev.maxScore} pts</>}
                      {ev.skills.length > 0 && <> · 🏷 {ev.skills.map((s) => s.name).join(', ')}</>}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <Button as={Link as any} to={`/admin/evaluaciones/${ev.id}/preguntas`} variant="outline-primary" size="sm">
                    Gestionar preguntas
                  </Button>
                  <Button as={Link as any} to={`/admin/evaluaciones/${ev.id}/editar`} variant="outline-secondary" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => { setAEliminar(ev); setErrorEliminar(''); }}>
                    Eliminar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button variant="outline-secondary" size="sm" disabled={data.first} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
            <span className="text-secondary" style={{ fontSize: 14 }}>Página {data.number + 1} de {data.totalPages}</span>
            <Button variant="outline-secondary" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Siguiente →</Button>
          </div>
        </>
      )}

      <Modal show={!!aEliminar} onHide={() => !eliminando && setAEliminar(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18 }}>Eliminar evaluación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorEliminar && <Alert variant="danger">{errorEliminar}</Alert>}
          <p className="mb-1">¿Seguro que quieres eliminar <strong>{aEliminar?.title}</strong>?</p>
          <p className="text-secondary mb-0" style={{ fontSize: 14 }}>
            Se eliminarán también sus preguntas. Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setAEliminar(null)} disabled={eliminando}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminar} disabled={eliminando}>
            {eliminando ? <Spinner size="sm" /> : 'Sí, eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
