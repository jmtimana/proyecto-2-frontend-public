import { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: FormValues) {
    setError('');
    setLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err));
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

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 14 }}>Correo</Form.Label>
              <Form.Control
                type="email"
                {...register('email')}
                placeholder="tucorreo@ejemplo.com"
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: 14 }}>Contraseña</Form.Label>
              <Form.Control
                type="password"
                {...register('password')}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={loading} aria-busy={loading}>
              {loading ? <><Spinner size="sm" role="status" /> <span className="visually-hidden">Iniciando sesion</span></> : 'Entrar'}
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
