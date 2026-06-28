import { useEffect, useMemo, useState } from 'react';
import { Container, Alert, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { OfertaApi } from '../../api/OfertaApi';
import { UserApi } from '../../api/UserApi';
import { OfertaGuardadaApi } from '../../api/OfertaGuardadaApi';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { usePaginationParams } from '../../hooks/usePaginationParams';
import { MODALIDAD } from '../../utils/constants';
import OfertaCard from './components/OfertaCard';
import Pagination from '../../common/Pagination';
import Skeleton from '../../common/Skeleton';

export default function Ofertas() {

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

  const [guardadas, setGuardadas] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!esEstudiante) return;
    OfertaGuardadaApi.list()
      .then((ofs) => setGuardadas(new Set(ofs.map((o) => o.id))))
      .catch(() => {});
  }, [esEstudiante]);

  async function toggleGuardar(id: number) {
    const yaGuardada = guardadas.has(id);

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

      setGuardadas((prev) => {
        const next = new Set(prev);
        if (yaGuardada) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  }

  const { page, size, getParam, setParams, setPage, setSize } = usePaginationParams({ size: 10 });
  const modalidad = getParam('modalidad', 'TODAS');

  const [textoInput, setTextoInput] = useState(getParam('q'));
  const debounced = useDebounce(textoInput, 350);

  useEffect(() => {

    if (debounced !== getParam('q')) {
      setParams({ q: debounced || null });
    }

  }, [debounced]);

  const { data, loading, error } = useFetch(
    (signal) => OfertaApi.list({ page: 0, size: 200, estado: 'ACTIVA' }, signal),
    [],
    'No se pudieron cargar las ofertas.',
  );
  const todas = useMemo(() => data?.content ?? [], [data]);

  const filtradas = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return todas.filter((o) => {
      const coincideTexto =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.companyName.toLowerCase().includes(q) ||
        (o.description ?? '').toLowerCase().includes(q);
      const coincideModalidad = modalidad === 'TODAS' || o.modalidad === modalidad;
      return coincideTexto && coincideModalidad;
    });
  }, [todas, debounced, modalidad]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / size));
  const pageSafe = Math.min(page, totalPages - 1);
  const visibles = filtradas.slice(pageSafe * size, pageSafe * size + size);

  function limpiar() {
    setTextoInput('');
    setParams({ q: null, modalidad: null });
  }

  const hayFiltros = debounced.trim() !== '' || modalidad !== 'TODAS';

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <h3 style={{ fontWeight: 600 }} className="mb-1">Ofertas laborales</h3>
      <p className="text-secondary mb-4">Explora las vacantes activas y encuentra tu próximo reto.</p>

      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Buscar</Form.Label>
                <Form.Control
                  placeholder="Título, empresa o palabra clave..."
                  value={textoInput}
                  onChange={(e) => setTextoInput(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={8} md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Modalidad</Form.Label>
                <Form.Select
                  value={modalidad}
                  onChange={(e) => setParams({ modalidad: e.target.value === 'TODAS' ? null : e.target.value })}
                >
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

      {loading && (
        <div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: '#fff', border: '0.5px solid #e6e6ef', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
              <Skeleton width="55%" height={20} />
              <Skeleton width="35%" height={14} style={{ marginTop: 8 }} />
              <Skeleton width="100%" height={12} style={{ marginTop: 14 }} />
              <Skeleton width="80%" height={12} style={{ marginTop: 6 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

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

      {!loading && !error && filtradas.length > 0 && (
        <>
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

          <Pagination
            page={pageSafe}
            totalPages={totalPages}
            totalElements={filtradas.length}
            pageSize={size}
            itemsInPage={visibles.length}
            first={pageSafe === 0}
            last={pageSafe >= totalPages - 1}
            onPrev={() => setPage(pageSafe - 1)}
            onNext={() => setPage(pageSafe + 1)}
            onSizeChange={setSize}
          />
        </>
      )}
    </Container>
  );
}
