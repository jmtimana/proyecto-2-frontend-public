import { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';
import type { RegisterRequest } from '../../api/types/Auth';

type Tipo = 'ESTUDIANTE' | 'EMPRESA';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<Tipo>('ESTUDIANTE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().optional(),
    email: z.string().email('Ingresa un correo válido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[a-z]/, 'Debe contener una minúscula')
      .regex(/[A-Z]/, 'Debe contener una mayúscula')
      .regex(/[0-9]/, 'Debe contener un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    razonSocial: tipo === 'EMPRESA'
      ? z.string().min(3, 'Ingresa la razón social')
      : z.string().optional(),
    ruc: tipo === 'EMPRESA'
      ? z.string().min(8, 'Ingresa un RUC válido')
      : z.string().optional(),
    sector: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      razonSocial: '',
      ruc: '',
      sector: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setError('');
    setLoading(true);

    const payload: RegisterRequest = {
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      apellido: data.apellido || undefined,
      tipo,
      ...(tipo === 'EMPRESA' && {
        ruc: data.ruc,
        razonSocial: data.razonSocial,
        sector: data.sector || undefined,
      }),
    };

    try {
      await registerUser(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function cambiarTipo(t: Tipo) {
    setTipo(t);
    setError('');
    reset();
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
    border: activo ? '1.5px solid var(--brand)' : '0.5px solid var(--app-border)',
    color: activo ? 'var(--brand-dark)' : 'var(--app-muted-strong)',
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

          <div className="d-flex gap-2 mb-3" role="group" aria-label="Tipo de cuenta">
            <button
              type="button"
              style={tipoBtn(tipo === 'ESTUDIANTE')}
              onClick={() => cambiarTipo('ESTUDIANTE')}
              aria-pressed={tipo === 'ESTUDIANTE'}
            >
              Estudiante
            </button>
            <button
              type="button"
              style={tipoBtn(tipo === 'EMPRESA')}
              onClick={() => cambiarTipo('EMPRESA')}
              aria-pressed={tipo === 'EMPRESA'}
            >
              Empresa
            </button>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: 14 }}>Nombre</Form.Label>
                  <Form.Control
                    {...register('nombre')}
                    placeholder="Nombre"
                    isInvalid={!!errors.nombre}
                    isValid={!errors.nombre && touchedFields.nombre}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: 14 }}>Apellido</Form.Label>
                  <Form.Control
                    {...register('apellido')}
                    placeholder="Apellido"
                    isInvalid={!!errors.apellido}
                    isValid={!errors.apellido && touchedFields.apellido}
                  />
                  <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {tipo === 'EMPRESA' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: 14 }}>Razon social</Form.Label>
                  <Form.Control
                    {...register('razonSocial')}
                    placeholder="Razón social"
                    isInvalid={!!errors.razonSocial}
                    isValid={!errors.razonSocial && touchedFields.razonSocial}
                  />
                  <Form.Control.Feedback type="invalid">{errors.razonSocial?.message}</Form.Control.Feedback>
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: 14 }}>RUC</Form.Label>
                      <Form.Control
                        {...register('ruc')}
                        placeholder="RUC"
                        isInvalid={!!errors.ruc}
                        isValid={!errors.ruc && touchedFields.ruc}
                      />
                      <Form.Control.Feedback type="invalid">{errors.ruc?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: 14 }}>Sector</Form.Label>
                      <Form.Control
                        {...register('sector')}
                        placeholder="Sector"
                        isInvalid={!!errors.sector}
                        isValid={!errors.sector && touchedFields.sector}
                      />
                      <Form.Control.Feedback type="invalid">{errors.sector?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 14 }}>Correo</Form.Label>
              <Form.Control
                type="email"
                {...register('email')}
                placeholder="Correo"
                isInvalid={!!errors.email}
                isValid={!errors.email && touchedFields.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label style={{ fontSize: 14 }}>Contrasena</Form.Label>
              <Form.Control
                type="password"
                {...register('password')}
                placeholder="Contraseña"
                isInvalid={!!errors.password}
                isValid={!errors.password && touchedFields.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 14 }}>Confirmar contrasena</Form.Label>
              <Form.Control
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirmar contraseña"
                isInvalid={!!errors.confirmPassword}
                isValid={!errors.confirmPassword && touchedFields.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
            </Form.Group>

            <p className="text-secondary mb-4" style={{ fontSize: 12 }}>
              Mín. 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
            </p>

            <Button type="submit" variant="primary" className="w-100" disabled={loading} aria-busy={loading}>
              {loading ? <><Spinner size="sm" role="status" /> <span className="visually-hidden">Creando cuenta</span></> : 'Crear cuenta'}
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
