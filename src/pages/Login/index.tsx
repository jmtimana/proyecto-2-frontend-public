// =========================================================
// Página de Login. Llama de verdad a tu backend (/auth/login).
// =========================================================
import { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard'); // entró bien -> al panel
    } catch (err: any) {
      // El backend devuelve un mensaje en err.response.data.message
      setError(err?.response?.data?.message ?? 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: 380, border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <span className="brand-logo">S</span>
            <span style={{ fontWeight: 600, fontSize: 17 }}>SkillMatch</span>
          </div>

          <h5 className="mb-1" style={{ fontWeight: 600 }}>Inicia sesión</h5>
          <p className="text-secondary" style={{ fontSize: 14 }}>Bienvenido de vuelta</p>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 14 }}>Correo</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: 14 }}>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Entrar'}
            </Button>
          </Form>

          <p className="text-center text-secondary mt-3 mb-0" style={{ fontSize: 14 }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="brand-link">Regístrate</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
