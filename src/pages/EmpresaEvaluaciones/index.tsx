import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { EvaluacionApi } from '../../api/EvaluacionApi';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../common/Breadcrumb';
import type { EvaluacionResponse } from '../../api/types/Evaluacion';
import { getErrorMessage } from '../../utils/errorHandler';

export default function EmpresaEvaluaciones() {
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    EvaluacionApi.list(0, 100)
      .then((p) => setEvaluaciones(p.content.filter((ev) => ev.createdBy === user?.userId)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mis evaluaciones' }]} />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontWeight: 600, margin: 0 }}>Mis evaluaciones</h3>
          <p className="text-secondary mb-0">Pruebas que puedes exigir en tus ofertas de trabajo</p>
        </div>
        <Button as={Link as any} to="/empresa/evaluaciones/nueva" variant="primary">
          + Crear evaluación
        </Button>
      </div>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && evaluaciones.length === 0 && (
        <div className="text-center py-5 text-secondary">
          <FileText size={40} className="mb-2" aria-hidden="true" />
          <p className="mt-2 mb-0">Aún no has creado evaluaciones.</p>
          <p style={{ fontSize: 13 }}>Crea una y luego exígela en una oferta para filtrar postulantes.</p>
        </div>
      )}

      {!loading && !error && evaluaciones.map((ev) => (
        <Card key={ev.id} className="mb-3">
          <Card.Body className="p-3 d-flex justify-content-between align-items-center gap-3">
            <div>
              <div style={{ fontWeight: 600 }}>{ev.title}</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>{ev.description}</div>
            </div>
            <Badge bg="light" text="dark" style={{ fontWeight: 400 }}>{ev.difficulty}</Badge>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
