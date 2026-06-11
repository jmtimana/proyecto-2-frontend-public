// =========================================================
// "Mis ofertas" (empresa). Lista las ofertas de esta empresa,
// con un botón para publicar una nueva y otro para ver los
// postulantes de cada una.
//
// Nota: como no hay endpoint propio de "mis ofertas", traemos
// todas y filtramos por empresaUserId en el frontend.
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { OfertaApi } from '../../api/OfertaApi';
import { useAuth } from '../../context/AuthContext';
import type { OfertaLaboralResponse } from '../../api/types/Oferta';

function estadoColor(e: string) {
  if (e === 'ACTIVA') return 'success';
  if (e === 'PAUSADA') return 'warning';
  return 'secondary';
}

export default function EmpresaOfertas() {
  const { user } = useAuth();
  const [ofertas, setOfertas] = useState<OfertaLaboralResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    OfertaApi.list({ size: 200 })
      .then((res) => {
        if (!vivo) return;
        setOfertas(res.content.filter((o) => o.empresaUserId === user?.userId));
      })
      .catch(() => vivo && setError('No se pudieron cargar tus ofertas.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [user?.userId]);

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontWeight: 600, margin: 0 }}>Mis ofertas</h3>
          <p className="text-secondary mb-0">Gestiona tus vacantes y revisa postulantes</p>
        </div>
        <Button as={Link as any} to="/empresa/ofertas/nueva" variant="primary">
          + Publicar oferta
        </Button>
      </div>

      {loading && (
        <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && ofertas.length === 0 && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>📋</div>
          <p className="mt-2 mb-0">Aún no has publicado ninguna oferta.</p>
          <p style={{ fontSize: 13 }}>Crea la primera con el botón de arriba.</p>
        </div>
      )}

      {!loading && !error && ofertas.map((o) => (
        <Card key={o.id} className="mb-3" style={{ border: '0.5px solid #e6e6ef' }}>
          <Card.Body className="p-4 d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="mb-0" style={{ fontWeight: 600 }}>{o.title}</h5>
                <Badge bg={estadoColor(o.status)}>{o.status}</Badge>
              </div>
              <p className="text-secondary mb-0" style={{ fontSize: 14 }}>
                {o.ubicacion} · {o.modalidad} · {o.applicationsCount} postulante(s)
              </p>
            </div>
            <Button
              as={Link as any}
              to={`/empresa/ofertas/${o.id}/postulantes`}
              variant="outline-secondary"
              size="sm"
            >
              Ver postulantes
            </Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
