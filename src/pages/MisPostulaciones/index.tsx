import { useEffect, useMemo, useState } from 'react';
import { Container, Spinner, Alert, Card, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PostulacionApi } from '../../api/PostulacionApi';
import Breadcrumb from '../../common/Breadcrumb';
import type { Page } from '../../api/types/Page';
import type { PostulacionResponse } from '../../api/types/Postulacion';

const PAGE_SIZE = 10;
type PostulacionSort = 'recent_desc' | 'recent_asc' | 'status_pending' | 'title_asc';

const estadoRank: Record<string, number> = {
  PENDIENTE: 1,
  ACEPTADA: 2,
  RECHAZADA: 3,
};

function estadoBadge(estado: string) {
  if (estado === 'ACEPTADA') return { bg: 'success', texto: '✓ Aceptada' };
  if (estado === 'RECHAZADA') return { bg: 'danger', texto: '✕ Rechazada' };
  return { bg: 'warning', texto: '⏳ Pendiente' };
}

function fecha(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function MisPostulaciones() {
  const [data, setData] = useState<Page<PostulacionResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<PostulacionSort>('recent_desc');

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError('');

    PostulacionApi.mine(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelado) setData(res);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudieron cargar tus postulaciones.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [page]);

  const postulacionesOrdenadas = useMemo(() => {
    const items = data?.content ?? [];
    return items.slice().sort((a, b) => {
      if (sort === 'recent_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'status_pending') {
        return (estadoRank[a.status] ?? 99) - (estadoRank[b.status] ?? 99);
      }
      if (sort === 'title_asc') return a.offerTitle.localeCompare(b.offerTitle);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [data?.content, sort]);

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mis postulaciones' }]} />
      <h3 style={{ fontWeight: 600 }} className="mb-1">Mis postulaciones</h3>
      <p className="text-secondary mb-4">Revisa el estado de las ofertas a las que te postulaste.</p>

      <div className="d-flex justify-content-end mb-3">
        <Form.Group style={{ minWidth: 220 }}>
          <Form.Label style={{ fontSize: 13 }}>Ordenar por</Form.Label>
          <Form.Select value={sort} onChange={(e) => setSort(e.target.value as PostulacionSort)}>
            <option value="recent_desc">Mas recientes</option>
            <option value="recent_asc">Mas antiguas</option>
            <option value="status_pending">Estado pendiente primero</option>
            <option value="title_asc">Oferta A-Z</option>
          </Form.Select>
        </Form.Group>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner style={{ color: 'var(--brand)' }} />
        </div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && data && data.empty && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <p className="mt-2 mb-0">Aún no te has postulado a ninguna oferta.</p>
          <p style={{ fontSize: 13 }}>Explora las vacantes y postúlate a la que te interese.</p>
          <Button as={Link as any} to="/ofertas" variant="primary" size="sm" className="mt-2">
            Ver ofertas
          </Button>
        </div>
      )}

      {!loading && !error && data && !data.empty && (
        <>
          {postulacionesOrdenadas.map((p) => {
            const badge = estadoBadge(p.status);
            return (
              <Card key={p.id} className="mb-3" style={{ border: '0.5px solid #e6e6ef' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 className="mb-0" style={{ fontWeight: 600 }}>{p.offerTitle}</h5>
                        <Badge bg={badge.bg}>{badge.texto}</Badge>
                      </div>
                      <p className="text-secondary mb-0" style={{ fontSize: 13 }}>
                        Postulado el {fecha(p.createdAt)}
                      </p>
                    </div>
                    <Button
                      as={Link as any}
                      to={`/ofertas/${p.ofertaLaboralId}`}
                      variant="outline-secondary"
                      size="sm"
                    >
                      Ver oferta
                    </Button>
                  </div>

                  {p.coverLetter && (
                    <div
                      className="mt-3"
                      style={{
                        background: '#faf9ff',
                        border: '0.5px solid #ecebf6',
                        borderRadius: 10,
                        padding: '0.75rem 1rem',
                        fontSize: 14,
                        color: '#3a3a44',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#8a8a96', marginBottom: 4 }}>Tu carta de presentación</div>
                      {p.coverLetter}
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}

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
