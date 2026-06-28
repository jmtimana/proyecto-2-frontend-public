import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Badge, Button } from 'react-bootstrap';
import { PostulacionApi } from '../../api/PostulacionApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { PostulacionResponse } from '../../api/types/Postulacion';

function estadoBadge(estado: string) {
  if (estado === 'ACEPTADA') return 'success';
  if (estado === 'RECHAZADA') return 'danger';
  return 'warning';
}

export default function Postulantes() {
  const { id } = useParams();
  const [postulantes, setPostulantes] = useState<PostulacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    PostulacionApi.byOferta(Number(id))
      .then((res) => vivo && setPostulantes(res.content))
      .catch(() => vivo && setError('No se pudieron cargar los postulantes.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [id]);

  async function cambiarEstado(postulacionId: number, estado: string) {
    setActualizando(postulacionId);
    try {
      const actualizada = await PostulacionApi.updateEstado(postulacionId, estado);

      setPostulantes((prev) => prev.map((p) => (p.id === postulacionId ? actualizada : p)));
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'No se pudo actualizar el estado.');
    } finally {
      setActualizando(null);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Link to="/empresa/ofertas" className="brand-link" style={{ fontSize: 14 }}>← Volver a mis ofertas</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mis ofertas', href: '/empresa/ofertas' }, { label: 'Postulantes' }]} />
      <h3 style={{ fontWeight: 600 }} className="mt-3 mb-4">Postulantes</h3>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && postulantes.length === 0 && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>👤</div>
          <p className="mt-2">Aún no hay postulantes para esta oferta.</p>
        </div>
      )}

      {!loading && !error && postulantes.map((p) => (
        <Card key={p.id} className="mb-3" style={{ border: '0.5px solid #e6e6ef' }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-1" style={{ fontWeight: 600 }}>{p.userName}</h6>
                {p.userSkillMatchScore != null && (
                  <span className="text-secondary" style={{ fontSize: 13 }}>
                    SkillMatch Score: {p.userSkillMatchScore.toFixed(2)}
                  </span>
                )}
              </div>
              <Badge bg={estadoBadge(p.status)}>{p.status}</Badge>
            </div>

            {p.coverLetter && (
              <p className="mb-3" style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-line' }}>
                "{p.coverLetter}"
              </p>
            )}

            {p.status === 'PENDIENTE' && (
              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  disabled={actualizando === p.id}
                  onClick={() => cambiarEstado(p.id, 'ACEPTADA')}
                >
                  {actualizando === p.id ? <Spinner size="sm" /> : 'Aceptar'}
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  disabled={actualizando === p.id}
                  onClick={() => cambiarEstado(p.id, 'RECHAZADA')}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
