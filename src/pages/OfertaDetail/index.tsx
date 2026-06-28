import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Badge, Button, Modal, Form } from 'react-bootstrap';
import { OfertaApi } from '../../api/OfertaApi';
import { PostulacionApi } from '../../api/PostulacionApi';
import { UserApi } from '../../api/UserApi';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../common/Breadcrumb';
import NotFound from '../NotFound';
import type { OfertaLaboralDetailResponse } from '../../api/types/Oferta';
import { getErrorMessage } from '../../utils/errorHandler';

export default function OfertaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [oferta, setOferta] = useState<OfertaLaboralDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [carta, setCarta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [postulado, setPostulado] = useState(false);
  const [modalError, setModalError] = useState('');

  const [miScore, setMiScore] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.type !== 'ESTUDIANTE') return;
    let vivo = true;
    UserApi.me()
      .then((u) => vivo && setMiScore(u.skillMatchScore ?? 0))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [isAuthenticated, user?.type]);

  useEffect(() => {
    let vivo = true;
    const ofertaId = Number(id);

    if (!id || Number.isNaN(ofertaId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setNotFound(false);
    OfertaApi.getById(ofertaId)
      .then((res) => vivo && setOferta(res))
      .catch((err) => {
        if (!vivo) return;
        if (err?.response?.status === 404) {
          setNotFound(true);
          return;
        }
        setError('No se pudo cargar la oferta.');
      })
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [id]);

  async function postular() {
    if (!oferta) return;
    setEnviando(true);
    setModalError('');
    try {
      await PostulacionApi.create({
        ofertaLaboralId: oferta.id,
        cartaPresentacion: carta,
      });
      setPostulado(true);
      setShowModal(false);
    } catch (err: any) {

      setModalError(getErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner style={{ color: 'var(--brand)' }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <NotFound
        title="Oferta no encontrada"
        message="La oferta que intentas consultar no existe, fue eliminada o ya no esta disponible."
      />
    );
  }

  if (error || !oferta) {
    return (
      <Container className="py-5" style={{ maxWidth: 720 }}>
        <Alert variant="danger">{error || 'Oferta no encontrada.'}</Alert>
        <Link to="/ofertas" className="brand-link">← Volver a ofertas</Link>
      </Container>
    );
  }

  const esEstudiante = isAuthenticated && user?.type === 'ESTUDIANTE';
  const esEmpresa = isAuthenticated && user?.type === 'EMPRESA';

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <Link to="/ofertas" className="brand-link" style={{ fontSize: 14 }}>← Volver a ofertas</Link>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Ofertas', href: '/ofertas' }, { label: oferta.title }]} />

      <div className="d-flex justify-content-between align-items-start mt-3">
        <div>
          <h3 style={{ fontWeight: 600, margin: 0 }}>{oferta.title}</h3>
          <p className="text-secondary mt-1 mb-0">{oferta.companyName} · {oferta.ubicacion}</p>
        </div>
        <Badge bg="info">{oferta.modalidad}</Badge>
      </div>

      <hr />

      <h6 className="text-secondary">Descripción</h6>
      <p style={{ whiteSpace: 'pre-line' }}>{oferta.description}</p>

      {oferta.skills.length > 0 && (
        <>
          <h6 className="text-secondary mt-4">Habilidades requeridas</h6>
          <div className="d-flex flex-wrap gap-1">
            {oferta.skills.map((s) => (
              <Badge key={s.id} bg="light" text="dark" style={{ fontWeight: 400 }}>{s.name}</Badge>
            ))}
          </div>
        </>
      )}

      <div className="d-flex gap-4 mt-4" style={{ fontSize: 14 }}>
        {(oferta.minSalary != null || oferta.maxSalary != null) && (
          <div>
            <div className="text-secondary" style={{ fontSize: 12 }}>Salario</div>
            <div>S/ {(oferta.minSalary ?? oferta.maxSalary)!.toLocaleString()}
              {oferta.maxSalary != null && oferta.minSalary != null && ` - ${oferta.maxSalary.toLocaleString()}`}
            </div>
          </div>
        )}
        {oferta.minRequiredScore != null && (
          <div>
            <div className="text-secondary" style={{ fontSize: 12 }}>Score mínimo</div>
            <div>{oferta.minRequiredScore}</div>
          </div>
        )}
      </div>

      <hr className="my-4" />

      {esEstudiante && oferta.minRequiredScore != null && miScore != null && (
        miScore >= oferta.minRequiredScore ? (
          <Alert variant="success" className="py-2">
            ✓ <strong>Cumples el score mínimo.</strong> Tu score es {miScore.toFixed(2)} y esta oferta pide {oferta.minRequiredScore}.
          </Alert>
        ) : (
          <Alert variant="warning" className="py-2">
            Te faltan <strong>{(oferta.minRequiredScore - miScore).toFixed(2)}</strong> para alcanzar el score mínimo
            (tu score: {miScore.toFixed(2)}, requerido: {oferta.minRequiredScore}). Aún puedes postularte, pero rinde más
            evaluaciones para mejorar tus chances.
          </Alert>
        )
      )}

      {postulado ? (
        <Alert variant="success">✅ ¡Postulación enviada! Revisa su estado en tu panel.</Alert>
      ) : esEstudiante ? (
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>Postularme</Button>
      ) : esEmpresa ? (
        <Alert variant="secondary">Las cuentas de empresa no pueden postularse a ofertas.</Alert>
      ) : (
        <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
          Inicia sesión para postular
        </Button>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18 }}>Postularme a {oferta.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger" className="py-2">{modalError}</Alert>}
          <Form.Group>
            <Form.Label style={{ fontSize: 14 }}>Carta de presentación (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={carta}
              onChange={(e) => setCarta(e.target.value)}
              placeholder="Cuéntale a la empresa por qué eres un buen candidato..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={postular} disabled={enviando}>
            {enviando ? <Spinner size="sm" /> : 'Enviar postulación'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
