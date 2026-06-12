// =========================================================
// "Buscar candidatos" (empresa).
// La empresa busca estudiantes por rango de SkillMatch Score.
// Consume: GET /users/search?scoreMin&scoreMax&page&size (UserApi.search).
// Reusa el patrón de 4 estados: cargando / error / vacío / datos.
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { UserApi } from '../../api/UserApi';
import type { Page } from '../../api/types/Page';
import type { UserResponse } from '../../api/types/User';

const PAGE_SIZE = 10;

export default function BuscarCandidatos() {
  // Filtros que el usuario ESTÁ escribiendo (todavía sin aplicar).
  const [scoreMin, setScoreMin] = useState('0');
  const [scoreMax, setScoreMax] = useState('1');

  // Filtros YA aplicados (los que se envían al backend). Separarlos evita
  // que cada tecleo dispare una búsqueda: solo se busca al dar "Buscar".
  const [filtros, setFiltros] = useState({ scoreMin: 0, scoreMax: 1 });
  const [page, setPage] = useState(0);

  const [data, setData] = useState<Page<UserResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cada vez que cambian los filtros aplicados o la página, buscamos.
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError('');

    UserApi.search({
      scoreMin: filtros.scoreMin,
      scoreMax: filtros.scoreMax,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        if (!cancelado) setData(res);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo realizar la búsqueda de candidatos.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [filtros, page]);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    // Aplicamos los filtros (convertimos texto -> número) y volvemos a la página 0.
    const min = scoreMin ? Number(scoreMin) : 0;
    const max = scoreMax ? Number(scoreMax) : 1;
    setPage(0);
    setFiltros({ scoreMin: min, scoreMax: max });
  }

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <h3 style={{ fontWeight: 600 }} className="mb-1">Buscar candidatos</h3>
      <p className="text-secondary mb-4">Encuentra estudiantes por su SkillMatch Score (0 a 1).</p>

      {/* Filtros */}
      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-3">
          <Form onSubmit={buscar}>
            <Row className="align-items-end g-2">
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 13 }}>Score mínimo</Form.Label>
                  <Form.Control
                    type="number" step="0.1" min="0" max="1"
                    value={scoreMin}
                    onChange={(e) => setScoreMin(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 13 }}>Score máximo</Form.Label>
                  <Form.Control
                    type="number" step="0.1" min="0" max="1"
                    value={scoreMax}
                    onChange={(e) => setScoreMax(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="primary" className="w-100">Buscar</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Estado: cargando */}
      {loading && (
        <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>
      )}

      {/* Estado: error */}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {/* Estado: vacío */}
      {!loading && !error && data && data.empty && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <p className="mt-2 mb-0">No hay candidatos en ese rango de score.</p>
          <p style={{ fontSize: 13 }}>Prueba ampliando el rango (por ejemplo, de 0 a 1).</p>
        </div>
      )}

      {/* Estado: con datos */}
      {!loading && !error && data && !data.empty && (
        <>
          <p className="text-secondary mb-3" style={{ fontSize: 14 }}>
            {data.totalElements} candidato(s) encontrado(s)
          </p>

          {data.content.map((u) => {
            const inicial = (u.firstName || u.email || '?').charAt(0).toUpperCase();
            return (
              <Card key={u.id} className="mb-3" style={{ border: '0.5px solid #e6e6ef' }}>
                <Card.Body className="p-3 d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-light)',
                        color: 'var(--brand-dark)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      {inicial}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                      <div className="text-secondary" style={{ fontSize: 13 }}>{u.email}</div>
                      {u.githubUsername && (
                        <a
                          href={`https://github.com/${u.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="brand-link"
                          style={{ fontSize: 12 }}
                        >
                          🐙 {u.githubUsername}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-end" style={{ flexShrink: 0 }}>
                    <Badge bg="light" text="dark" style={{ fontWeight: 400, fontSize: 11 }}>Score</Badge>
                    <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--brand-dark)' }}>
                      {(u.skillMatchScore ?? 0).toFixed(2)}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}

          {/* Paginación (mismo patrón de siempre) */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button variant="outline-secondary" size="sm" disabled={data.first} onClick={() => setPage((p) => p - 1)}>
              ← Anterior
            </Button>
            <span className="text-secondary" style={{ fontSize: 14 }}>
              Página {data.number + 1} de {data.totalPages}
            </span>
            <Button variant="outline-secondary" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
              Siguiente →
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}
