import { useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserApi } from '../../api/UserApi';
import { useFetch } from '../../hooks/useFetch';
import Breadcrumb from '../../common/Breadcrumb';
import { usePaginationParams } from '../../hooks/usePaginationParams';
import Pagination from '../../common/Pagination';
import NivelBadge from '../../common/NivelBadge';

export default function BuscarCandidatos() {
  const { page, size, getParam, setParams, setPage, setSize } = usePaginationParams({ size: 10 });

  const scoreMin = Number(getParam('scoreMin', '0'));
  const scoreMax = Number(getParam('scoreMax', '1'));

  const [minInput, setMinInput] = useState(getParam('scoreMin', '0'));
  const [maxInput, setMaxInput] = useState(getParam('scoreMax', '1'));

  const { data, loading, error } = useFetch(
    (signal) => UserApi.search({ scoreMin, scoreMax, page, size }, signal),
    [scoreMin, scoreMax, page, size],
    'No se pudo realizar la búsqueda de candidatos.',
  );

  function buscar(e: React.FormEvent) {
    e.preventDefault();

    setParams({
      scoreMin: minInput || '0',
      scoreMax: maxInput || '1',
      page: 0,
    });
  }

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Buscar candidatos' }]} />
      <h3 style={{ fontWeight: 600 }} className="mb-1">Buscar candidatos</h3>
      <p className="text-secondary mb-4">Encuentra estudiantes por su SkillMatch Score (0 a 1).</p>

      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-3">
          <Form onSubmit={buscar}>
            <Row className="align-items-end g-2">
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 13 }}>Score mínimo</Form.Label>
                  <Form.Control
                    type="number" step="0.1" min="0" max="1"
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 13 }}>Score máximo</Form.Label>
                  <Form.Control
                    type="number" step="0.1" min="0" max="1"
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
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

      {loading && (
        <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && data && data.empty && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <p className="mt-2 mb-0">No hay candidatos en ese rango de score.</p>
          <p style={{ fontSize: 13 }}>Prueba ampliando el rango (por ejemplo, de 0 a 1).</p>
        </div>
      )}

      {!loading && !error && data && !data.empty && (
        <>
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
                      <div className="d-flex gap-2 align-items-center mt-1">
                        <Link to={`/candidatos/${u.id}`} className="brand-link" style={{ fontSize: 12, fontWeight: 500 }}>
                          Ver perfil →
                        </Link>
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
                  </div>
                  <div className="text-end" style={{ flexShrink: 0 }}>
                    <Badge bg="light" text="dark" style={{ fontWeight: 400, fontSize: 11 }}>Score</Badge>
                    <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--brand-dark)' }}>
                      {(u.skillMatchScore ?? 0).toFixed(2)}
                    </div>
                    <div className="mt-1"><NivelBadge score={u.skillMatchScore} /></div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}

          <Pagination
            page={data.number}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            pageSize={data.size}
            itemsInPage={data.numberOfElements}
            first={data.first}
            last={data.last}
            onPrev={() => setPage(data.number - 1)}
            onNext={() => setPage(data.number + 1)}
            onSizeChange={setSize}
          />
        </>
      )}
    </Container>
  );
}
