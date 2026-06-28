import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Card, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { OfertaApi } from '../../api/OfertaApi';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../common/Breadcrumb';
import type { OfertaLaboralResponse } from '../../api/types/Oferta';
import OfertaQR from '../../common/OfertaQR';

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

  const [aEliminar, setAEliminar] = useState<OfertaLaboralResponse | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  function cargar() {
    setLoading(true);
    setError('');
    OfertaApi.list({ size: 200 })
      .then((res) => {
        setOfertas(res.content.filter((o) => o.empresaUserId === user?.userId));
      })
      .catch(() => setError('No se pudieron cargar tus ofertas.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();

  }, [user?.userId]);

  async function confirmarEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await OfertaApi.remove(aEliminar.id);
      setAEliminar(null);
      cargar();
    } catch (err: any) {
      setErrorEliminar(err?.response?.data?.message ?? 'No se pudo eliminar la oferta.');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mis ofertas' }]} />
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
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5 className="mb-0" style={{ fontWeight: 600 }}>{o.title}</h5>
                  <Badge bg={estadoColor(o.status)}>{o.status}</Badge>
                </div>
                <p className="text-secondary mb-0" style={{ fontSize: 14 }}>
                  {o.ubicacion} · {o.modalidad} · {o.applicationsCount} postulante(s)
                </p>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3 flex-wrap">
              <Button
                as={Link as any}
                to={`/empresa/ofertas/${o.id}/postulantes`}
                variant="outline-secondary"
                size="sm"
              >
                Ver postulantes
              </Button>
              <Button
                as={Link as any}
                to={`/empresa/ofertas/${o.id}/editar`}
                variant="outline-secondary"
                size="sm"
              >
                Editar
              </Button>
              <OfertaQR ofertaId={o.id} titulo={o.title} />
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => { setAEliminar(o); setErrorEliminar(''); }}
              >
                Eliminar
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}

      <Modal show={!!aEliminar} onHide={() => !eliminando && setAEliminar(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18 }}>Eliminar oferta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorEliminar && <Alert variant="danger">{errorEliminar}</Alert>}
          <p className="mb-1">
            ¿Seguro que quieres eliminar <strong>{aEliminar?.title}</strong>?
          </p>
          <p className="text-secondary mb-0" style={{ fontSize: 14 }}>
            Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setAEliminar(null)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminar} disabled={eliminando}>
            {eliminando ? <Spinner size="sm" /> : 'Sí, eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
