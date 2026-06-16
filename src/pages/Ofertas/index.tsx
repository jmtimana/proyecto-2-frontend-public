// =========================================================
// Página de Ofertas laborales (pública), ahora CON FILTROS.
// Como el backend solo filtra por "estado", traemos las ofertas
// activas una vez y filtramos en el front por:
//   - texto (título / empresa / descripción)
//   - modalidad (REMOTO / PRESENCIAL / HIBRIDO)
// La paginación también es del lado del cliente (sobre lo filtrado).
// Mantiene el patrón de 4 estados: cargando / error / vacío / datos.
// =========================================================
import { useEffect, useMemo, useState } from 'react';
import { Container, Spinner, Alert, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { OfertaApi } from '../../api/OfertaApi';
import { UserApi } from '../../api/UserApi';
import { OfertaGuardadaApi } from '../../api/OfertaGuardadaApi';
import { useAuth } from '../../context/AuthContext';
import type { OfertaLaboralResponse } from '../../api/types/Oferta';
import { MODALIDAD } from '../../utils/constants';
import OfertaCard from './components/OfertaCard';

const PAGE_SIZE = 10;

export default function Ofertas() {
  const [todas, setTodas] = useState<OfertaLaboralResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Score del estudiante logueado (para el badge "cumples el score").
  const { user } = useAuth();
  const esEstudiante = user?.type === 'ESTUDIANTE';
  const [miScore, setMiScore] = useState<number | null>(null);

  useEffect(() => {
    if (!esEstudiante) {
      setMiScore(null);
      return;
    }
    let vivo = true;
    UserApi.me()
      .then((u) => vivo && setMiScore(u.skillMatchScore ?? 0))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [esEstudiante]);

  // IDs de ofertas que el estudiante ya guardó (para pintar la estrella).
  const [guardadas, setGuardadas] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!esEstudiante) return;
    OfertaGuardadaApi.list()
      .then((ofs) => setGuardadas(new Set(ofs.map((o) => o.id))))
      .catch(() => {});
  }, [esEstudiante]);

  async function toggleGuardar(id: number) {
    const yaGuardada = guardadas.has(id);
    // Actualización optimista
    setGuardadas((prev) => {
      const next = new Set(prev);
      if (yaGuardada) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (yaGuardada) await OfertaGuardadaApi.quitar(id);
      else await OfertaGuardadaApi.guardar(id);
    } catch {
      // si falla, revertimos
      setGuardadas((prev) => {
        const next = new Set(prev);
        if (yaGuardada) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  }

  // Filtros
  const [texto, setTexto] = useState('');
  const [modalidad, setModalidad] = useState('TODAS');
  const [page, setPage] = useState(0);

  // Traemos todas las ofertas activas una sola vez (lote grande).
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError('');

    OfertaApi.list({ page: 0, size: 200, estado: 'ACTIVA' })
      .then((res) => {
        if (!cancelado) setTodas(res.content);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudieron cargar las ofertas.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Resultado de aplicar los filtros (se recalcula solo cuando algo cambia).
  const filtradas = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return todas.filter((o) => {
      const coincideTexto =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.companyName.toLowerCase().includes(q) ||
        (o.description ?? '').toLowerCase().includes(q);
      const coincideModalidad = modalidad === 'TODAS' || o.modalidad === modalidad;
      return coincideTexto && coincideModalidad;
    });
  }, [todas, texto, modalidad]);

  // Cada vez que cambian los filtros, volvemos a la primera página.
  useEffect(() => {
    setPage(0);
  }, [texto, modalidad]);

  // Paginación en el cliente.
  const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const visibles = filtradas.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function limpiar() {
    setTexto('');
    setModalidad('TODAS');
  }

  const hayFiltros = texto.trim() !== '' || modalidad !== 'TODAS';

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <h3 style={{ fontWeight: 600 }} className="mb-1">Ofertas laborales</h3>
      <p className="text-secondary mb-4">Explora las vacantes activas y encuentra tu próximo reto.</p>

      {/* Barra de filtros */}
      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Buscar</Form.Label>
                <Form.Control
                  placeholder="Título, empresa o palabra clave..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={8} md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Modalidad</Form.Label>
                <Form.Select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
                  <option value="TODAS">Todas</option>
                  {MODALIDAD.map((m) => <option key={m} value={m}>{m}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={4} md={2}>
              <Button variant="outline-secondary" className="w-100" onClick={limpiar} disabled={!hayFiltros}>
                Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Estado: cargando */}
      {loading && (
        <div className="text-center py-5">
          <Spinner style={{ color: 'var(--brand)' }} />
        </div>
      )}

      {/* Estado: error */}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {/* Estado: vacío (sin ofertas o sin resultados de filtro) */}
      {!loading && !error && filtradas.length === 0 && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>{hayFiltros ? '🔍' : '📭'}</div>
          {hayFiltros ? (
            <>
              <p className="mt-2 mb-0">Ninguna oferta coincide con tu búsqueda.</p>
              <p style={{ fontSize: 13 }}>Prueba con otras palabras o limpia los filtros.</p>
            </>
          ) : (
            <>
              <p className="mt-2 mb-0">Todavía no hay ofertas activas.</p>
              <p style={{ fontSize: 13 }}>Vuelve pronto o crea una si eres empresa.</p>
            </>
          )}
        </div>
      )}

      {/* Estado: con datos */}
      {!loading && !error && filtradas.length > 0 && (
        <>
          <p className="text-secondary mb-3" style={{ fontSize: 14 }}>
            {filtradas.length} oferta(s) encontrada(s)
          </p>

          {visibles.map((oferta) => (
            <OfertaCard
              key={oferta.id}
              oferta={oferta}
              miScore={miScore}
              mostrarGuardar={esEstudiante}
              guardada={guardadas.has(oferta.id)}
              onToggleGuardar={toggleGuardar}
            />
          ))}

          {/* Paginación (cliente) */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <Button variant="outline-secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                ← Anterior
              </Button>
              <span className="text-secondary" style={{ fontSize: 14 }}>
                Página {page + 1} de {totalPages}
              </span>
              <Button variant="outline-secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
