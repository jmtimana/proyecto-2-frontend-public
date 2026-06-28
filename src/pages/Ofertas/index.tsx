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
import Breadcrumb from '../../common/Breadcrumb';
import Skeleton from '../../common/Skeleton';

type SortOption =
  | 'salary_asc'
  | 'salary_desc'
  | 'score_asc'
  | 'score_desc'
  | 'recent_desc'
  | 'recent_asc'
  | 'title_asc'
  | 'title_desc'
  | 'applications_desc';

function numberParam(value: string) {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function salaryValue(min: number | null, max: number | null) {
  return max ?? min ?? null;
}

function compareNullable(a: number | null, b: number | null, direction: 'asc' | 'desc') {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return direction === 'asc' ? a - b : b - a;
}

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
  const sort = getParam('sort', 'recent_desc') as SortOption;
  const salarioMin = getParam('salarioMin');
  const salarioMax = getParam('salarioMax');
  const scoreMin = getParam('scoreMin');
  const scoreMax = getParam('scoreMax');

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
    const salarioMinNumber = numberParam(salarioMin);
    const salarioMaxNumber = numberParam(salarioMax);
    const scoreMinNumber = numberParam(scoreMin);
    const scoreMaxNumber = numberParam(scoreMax);

    const resultado = todas.filter((o) => {
      const coincideTexto =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.companyName.toLowerCase().includes(q) ||
        (o.description ?? '').toLowerCase().includes(q);
      const coincideModalidad = modalidad === 'TODAS' || o.modalidad === modalidad;
      const salario = salaryValue(o.minSalary, o.maxSalary);
      const score = o.minRequiredScore;
      const coincideSalarioMin = salarioMinNumber == null || (salario != null && salario >= salarioMinNumber);
      const coincideSalarioMax = salarioMaxNumber == null || (salario != null && salario <= salarioMaxNumber);
      const coincideScoreMin = scoreMinNumber == null || (score != null && score >= scoreMinNumber);
      const coincideScoreMax = scoreMaxNumber == null || (score != null && score <= scoreMaxNumber);

      return (
        coincideTexto &&
        coincideModalidad &&
        coincideSalarioMin &&
        coincideSalarioMax &&
        coincideScoreMin &&
        coincideScoreMax
      );
    });

    return resultado.slice().sort((a, b) => {
      if (sort === 'salary_asc') {
        return compareNullable(salaryValue(a.minSalary, a.maxSalary), salaryValue(b.minSalary, b.maxSalary), 'asc');
      }
      if (sort === 'salary_desc') {
        return compareNullable(salaryValue(a.minSalary, a.maxSalary), salaryValue(b.minSalary, b.maxSalary), 'desc');
      }
      if (sort === 'score_asc') {
        return compareNullable(a.minRequiredScore, b.minRequiredScore, 'asc');
      }
      if (sort === 'score_desc') {
        return compareNullable(a.minRequiredScore, b.minRequiredScore, 'desc');
      }
      if (sort === 'recent_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      if (sort === 'applications_desc') {
        return b.applicationsCount - a.applicationsCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [todas, debounced, modalidad, salarioMin, salarioMax, scoreMin, scoreMax, sort]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / size));
  const pageSafe = Math.min(page, totalPages - 1);
  const visibles = filtradas.slice(pageSafe * size, pageSafe * size + size);

  function limpiar() {
    setTextoInput('');
    setParams({
      q: null,
      modalidad: null,
      sort: null,
      salarioMin: null,
      salarioMax: null,
      scoreMin: null,
      scoreMax: null,
    });
  }

  const hayFiltros =
    debounced.trim() !== '' ||
    modalidad !== 'TODAS' ||
    sort !== 'recent_desc' ||
    salarioMin !== '' ||
    salarioMax !== '' ||
    scoreMin !== '' ||
    scoreMax !== '';

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Ofertas' }]} />
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
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Ordenar por</Form.Label>
                <Form.Select
                  value={sort}
                  onChange={(e) => setParams({ sort: e.target.value === 'recent_desc' ? null : e.target.value })}
                >
                  <option value="recent_desc">Mas recientes</option>
                  <option value="recent_asc">Mas antiguas</option>
                  <option value="salary_desc">Salario mayor</option>
                  <option value="salary_asc">Salario menor</option>
                  <option value="score_desc">Score maximo</option>
                  <option value="score_asc">Score minimo</option>
                  <option value="title_asc">Nombre A-Z</option>
                  <option value="title_desc">Nombre Z-A</option>
                  <option value="applications_desc">Mas postulaciones</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Salario min.</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder="0"
                  value={salarioMin}
                  onChange={(e) => setParams({ salarioMin: e.target.value || null })}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Salario max.</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder="10000"
                  value={salarioMax}
                  onChange={(e) => setParams({ salarioMax: e.target.value || null })}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Score min.</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  placeholder="0.00"
                  value={scoreMin}
                  onChange={(e) => setParams({ scoreMin: e.target.value || null })}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Score max.</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  placeholder="1.00"
                  value={scoreMax}
                  onChange={(e) => setParams({ scoreMax: e.target.value || null })}
                />
              </Form.Group>
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
