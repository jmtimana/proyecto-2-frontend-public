import { Button, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../common/Breadcrumb';

interface Props {
  title?: string;
  message?: string;
  showPath?: boolean;
}

export default function NotFound({
  title = 'Pagina no encontrada',
  message = 'La ruta que intentas visitar no existe o fue movida.',
  showPath = true,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: '404' }]} />

      <div className="bg-white border rounded-3 p-4 p-md-5 text-center shadow-sm">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: 'var(--brand-light)',
            color: 'var(--brand)',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          404
        </div>

        <h1 className="h3 mb-2" style={{ fontWeight: 700 }}>
          {title}
        </h1>
        <p className="text-secondary mb-3">{message}</p>

        {showPath && (
          <p className="text-muted mb-4" style={{ fontSize: 14 }}>
            URL solicitada: <code>{location.pathname}</code>
          </p>
        )}

        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <Button variant="primary" as={Link as any} to="/">
            Ir al inicio
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            Volver atras
          </Button>
        </div>
      </div>
    </Container>
  );
}
