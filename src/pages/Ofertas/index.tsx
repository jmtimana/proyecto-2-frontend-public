// =========================================================
// Página de Ofertas laborales (pública).
// Muestra una lista paginada. Maneja 3 estados: cargando,
// error, y vacío. Este es el patrón que reutilizaremos en
// casi todas las listas de la app.
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { OfertaApi } from '../../api/OfertaApi';
import type { Page } from '../../api/types/Page';
import type { OfertaLaboralResponse } from '../../api/types/Oferta';
import OfertaCard from './components/OfertaCard';

const PAGE_SIZE = 10;

export default function Ofertas() {
  const [data, setData] = useState<Page<OfertaLaboralResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cada vez que cambia "page", pedimos esa página al backend.
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError('');

    OfertaApi.list({ page, size: PAGE_SIZE, estado: 'ACTIVA' })
      .then((res) => {
        if (!cancelado) setData(res);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudieron cargar las ofertas.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    // Si el componente se desmonta antes de que llegue la respuesta, la ignoramos.
    return () => {
      cancelado = true;
    };
  }, [page]);

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <h3 style={{ fontWeight: 600 }} className="mb-1">Ofertas laborales</h3>
      <p className="text-secondary mb-4">Explora las vacantes activas y encuentra tu próximo reto.</p>

      {/* Estado: cargando */}
      {loading && (
        <div className="text-center py-5">
          <Spinner style={{ color: 'var(--brand)' }} />
        </div>
      )}

      {/* Estado: error */}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {/* Estado: vacío */}
      {!loading && !error && data && data.empty && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <p className="mt-2 mb-0">Todavía no hay ofertas activas.</p>
          <p style={{ fontSize: 13 }}>Vuelve pronto o crea una si eres empresa.</p>
        </div>
      )}

      {/* Estado: con datos */}
      {!loading && !error && data && !data.empty && (
        <>
          {data.content.map((oferta) => (
            <OfertaCard key={oferta.id} oferta={oferta} />
          ))}

          {/* Controles de paginación */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={data.first}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </Button>
            <span className="text-secondary" style={{ fontSize: 14 }}>
              Página {data.number + 1} de {data.totalPages}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente →
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}
