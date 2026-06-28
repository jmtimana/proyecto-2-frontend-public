import { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { RegisterRequest } from '../../api/types/Auth';

type Tipo = 'ESTUDIANTE' | 'EMPRESA';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<Tipo>('ESTUDIANTE');
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    ruc: '',
    razonSocial: '',
    sector: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: RegisterRequest = {
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      apellido: form.apellido,
      tipo,
      ...(tipo === 'EMPRESA' && {
        ruc: form.ruc,
        razonSocial: form.razonSocial,
        sector: form.sector,
      }),
    };

    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  const tipoBtn = (activo: boolean): React.CSSProperties => ({
    flex: 1,
    textAlign: 'center',
    padding: '9px 0',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: activo ? 600 : 400,
    background: activo ? 'var(--brand-light)' : 'transparent',
    border: activo ? '1.5px solid var(--brand)' : '0.5px solid #ccc',
    color: activo ? 'var(--brand-dark)' : '#666',
  });

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Card style={{ width: 420, border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <span className="brand-logo">S</span>
            <span style={{ fontWeight: 600, fontSize: 17 }}>SkillMatch</span>
          </div>

          <h5 className="mb-1" style={{ fontWeight: 600 }}>Crea tu cuenta</h5>
          <p className="text-secondary" style={{ fontSize: 14 }}>Empieza gratis</p>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          <div className="d-flex gap-2 mb-3">
            <div style={tipoBtn(tipo === 'ESTUDIANTE')} onClick={() => setTipo('ESTUDIANTE')}>
              Estudiante
            </div>
            <div style={tipoBtn(tipo === 'EMPRESA')} onClick={() => setTipo('EMPRESA')}>
              Empresa
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Control name="nombre" value={form.nombre} onChange={update} placeholder="Nombre" required />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Control name="apellido" value={form.apellido} onChange={update} placeholder="Apellido" />
                </Form.Group>
              </Col>
            </Row>

            {tipo === 'EMPRESA' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Control name="razonSocial" value={form.razonSocial} onChange={update} placeholder="Razón social" required />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Control name="ruc" value={form.ruc} onChange={update} placeholder="RUC" required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Control name="sector" value={form.sector} onChange={update} placeholder="Sector" />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Control type="email" name="email" value={form.email} onChange={update} placeholder="Correo" required />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Control type="password" name="password" value={form.password} onChange={update} placeholder="Contraseña" required />
            </Form.Group>
            <p className="text-secondary mb-4" style={{ fontSize: 12 }}>
              Mín. 8 caracteres, 1 mayúscula y 1 número.
            </p>

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Crear cuenta'}
            </Button>
          </Form>

          <p className="text-center text-secondary mt-3 mb-0" style={{ fontSize: 14 }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="brand-link">Inicia sesión</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
