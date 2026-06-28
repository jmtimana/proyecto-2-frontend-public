import { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserApi } from '../../api/UserApi';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../common/Breadcrumb';
import type { UserDetailResponse } from '../../api/types/User';
import NivelBadge from '../../common/NivelBadge';
import { nivelDeScore } from '../../utils/nivel';
import { getErrorMessage } from '../../utils/errorHandler';

const userSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().optional(),
  githubUsername: z.string().optional(),
});

const empresaSchema = z.object({
  razonSocial: z.string().optional(),
  sector: z.string().optional(),
  descripcion: z.string().optional(),
  web: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
});

type UserFormValues = z.infer<typeof userSchema>;
type EmpresaFormValues = z.infer<typeof empresaSchema>;

export default function MiPerfil() {
  const { updateSessionUser } = useAuth();

  const [me, setMe] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [msgUser, setMsgUser] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  const [guardandoUser, setGuardandoUser] = useState(false);

  const [msgEmp, setMsgEmp] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  const [guardandoEmp, setGuardandoEmp] = useState(false);

  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: errorsUser, touchedFields: touchedUser },
    reset: resetUser,
  } = useForm<UserFormValues>({
    mode: 'onChange',
    resolver: zodResolver(userSchema),
    defaultValues: { nombre: '', apellido: '', githubUsername: '' },
  });

  const {
    register: registerEmp,
    handleSubmit: handleSubmitEmp,
    formState: { errors: errorsEmp, touchedFields: touchedEmp },
    reset: resetEmp,
  } = useForm<EmpresaFormValues>({
    mode: 'onChange',
    resolver: zodResolver(empresaSchema),
    defaultValues: { razonSocial: '', sector: '', descripcion: '', web: '' },
  });

  useEffect(() => {
    let vivo = true;
    UserApi.me()
      .then((u) => {
        if (!vivo) return;
        setMe(u);
        resetUser({
          nombre: u.firstName ?? '',
          apellido: u.lastName ?? '',
          githubUsername: u.githubUsername ?? '',
        });
        if (u.companyProfile) {
          resetEmp({
            razonSocial: u.companyProfile.businessName ?? '',
            sector: u.companyProfile.sector ?? '',
            descripcion: u.companyProfile.description ?? '',
            web: u.companyProfile.web ?? '',
          });
        }
      })
      .catch(() => vivo && setErrorCarga('No se pudo cargar tu perfil.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [resetUser, resetEmp]);

  async function guardarUser(data: UserFormValues) {
    setGuardandoUser(true);
    setMsgUser(null);
    try {
      await UserApi.update({
        nombre: data.nombre,
        apellido: data.apellido,
        githubUsername: data.githubUsername || undefined,
      });

      const actualizado = await UserApi.me();
      setMe(actualizado);
      resetUser({
        nombre: actualizado.firstName ?? '',
        apellido: actualizado.lastName ?? '',
        githubUsername: actualizado.githubUsername ?? '',
      });
      updateSessionUser({ firstName: actualizado.firstName, lastName: actualizado.lastName });
      setMsgUser({ tipo: 'success', texto: 'Tus datos se guardaron correctamente.' });
    } catch (err: any) {
      setMsgUser({ tipo: 'danger', texto: getErrorMessage(err) });
    } finally {
      setGuardandoUser(false);
    }
  }

  async function guardarEmpresa(data: EmpresaFormValues) {
    setGuardandoEmp(true);
    setMsgEmp(null);
    try {
      await UserApi.updateEmpresa({
        razonSocial: data.razonSocial || undefined,
        sector: data.sector || undefined,
        descripcion: data.descripcion || undefined,
        web: data.web || undefined,
      });
      const actualizado = await UserApi.me();
      setMe(actualizado);
      if (actualizado.companyProfile) {
        resetEmp({
          razonSocial: actualizado.companyProfile.businessName ?? '',
          sector: actualizado.companyProfile.sector ?? '',
          descripcion: actualizado.companyProfile.description ?? '',
          web: actualizado.companyProfile.web ?? '',
        });
      }
      setMsgEmp({ tipo: 'success', texto: 'Los datos de tu empresa se guardaron correctamente.' });
    } catch (err: any) {
      setMsgEmp({ tipo: 'danger', texto: getErrorMessage(err) });
    } finally {
      setGuardandoEmp(false);
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: 680 }}>
        <Spinner style={{ color: 'var(--brand)' }} />
      </Container>
    );
  }

  if (errorCarga || !me) {
    return (
      <Container className="py-5" style={{ maxWidth: 680 }}>
        <Alert variant="danger">{errorCarga || 'No se pudo cargar tu perfil.'}</Alert>
      </Container>
    );
  }

  const esEmpresa = me.type === 'EMPRESA';
  const inicial = (me.firstName || me.email || '?').charAt(0).toUpperCase();

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mi perfil' }]} />
      <h3 style={{ fontWeight: 600 }} className="mb-4">Mi perfil</h3>

      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          <div
            style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--brand)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, flexShrink: 0,
            }}
          >
            {inicial}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{me.firstName} {me.lastName}</div>
            <div className="text-secondary" style={{ fontSize: 14 }}>{me.email}</div>
            <Badge bg="light" text="dark" className="mt-1" style={{ fontWeight: 400 }}>
              {esEmpresa ? '🏢 Empresa' : '🎓 Estudiante'}
            </Badge>
          </div>
        </Card.Body>
      </Card>

      {!esEmpresa && (
        <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between">
              <div>
                <div className="text-secondary" style={{ fontSize: 13 }}>SkillMatch Score</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--brand-dark)' }}>
                  {(me.skillMatchScore ?? 0).toFixed(2)}
                </div>
                <div className="mt-1"><NivelBadge score={me.skillMatchScore} size="md" /></div>
              </div>
              <div className="text-end">
                <div className="text-secondary" style={{ fontSize: 13 }}>Score GitHub</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{(me.githubScore ?? 0).toFixed(2)}</div>
              </div>
            </div>

            {(() => {
              const nivel = nivelDeScore(me.skillMatchScore);
              return nivel.siguiente ? (
                <div style={{ marginTop: 14 }}>
                  <div className="d-flex justify-content-between text-secondary" style={{ fontSize: 11, marginBottom: 4 }}>
                    <span>Progreso a {nivel.siguiente}</span>
                    <span>Te faltan {nivel.faltaParaSiguiente?.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--app-surface-soft)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${nivel.progreso}%`, height: '100%', background: 'var(--brand)' }} />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--brand-dark)', fontWeight: 500 }}>
                  ¡Estás en el nivel máximo! 🎉
                </div>
              );
            })()}
            {me.skills && me.skills.length > 0 && (
              <div className="mt-3 d-flex flex-wrap gap-2">
                {me.skills.map((s) => (
                  <Badge key={s.id} bg="light" text="dark" style={{ fontWeight: 400, border: '0.5px solid #ddd' }}>
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-4">
          <h5 style={{ fontWeight: 600 }} className="mb-3">Datos básicos</h5>
          {msgUser && <Alert variant={msgUser.tipo}>{msgUser.texto}</Alert>}
          <Form onSubmit={handleSubmitUser(guardarUser)} noValidate>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    {...registerUser('nombre')}
                    isInvalid={!!errorsUser.nombre}
                    isValid={!errorsUser.nombre && touchedUser.nombre}
                  />
                  <Form.Control.Feedback type="invalid">{errorsUser.nombre?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    {...registerUser('apellido')}
                    isInvalid={!!errorsUser.apellido}
                    isValid={!errorsUser.apellido && touchedUser.apellido}
                  />
                  <Form.Control.Feedback type="invalid">{errorsUser.apellido?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Usuario de GitHub</Form.Label>
              <Form.Control
                {...registerUser('githubUsername')}
                placeholder="tu-usuario-github"
                isInvalid={!!errorsUser.githubUsername}
                isValid={!errorsUser.githubUsername && touchedUser.githubUsername}
              />
              <Form.Control.Feedback type="invalid">{errorsUser.githubUsername?.message}</Form.Control.Feedback>
              <Form.Text className="text-secondary">
                El email no se puede cambiar desde aquí.
              </Form.Text>
            </Form.Group>
            <Button type="submit" variant="primary" disabled={guardandoUser}>
              {guardandoUser ? <Spinner size="sm" /> : 'Guardar datos'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {esEmpresa && (
        <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
          <Card.Body className="p-4">
            <h5 style={{ fontWeight: 600 }} className="mb-1">Datos de la empresa</h5>
            {me.companyProfile?.ruc && (
              <p className="text-secondary" style={{ fontSize: 13 }}>RUC: {me.companyProfile.ruc} (no editable)</p>
            )}
            {msgEmp && <Alert variant={msgEmp.tipo}>{msgEmp.texto}</Alert>}
            <Form onSubmit={handleSubmitEmp(guardarEmpresa)} noValidate>
              <Form.Group className="mb-3">
                <Form.Label>Razón social</Form.Label>
                <Form.Control
                  {...registerEmp('razonSocial')}
                  isInvalid={!!errorsEmp.razonSocial}
                  isValid={!errorsEmp.razonSocial && touchedEmp.razonSocial}
                />
                <Form.Control.Feedback type="invalid">{errorsEmp.razonSocial?.message}</Form.Control.Feedback>
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sector</Form.Label>
                    <Form.Control
                      {...registerEmp('sector')}
                      placeholder="Ej. Fintech"
                      isInvalid={!!errorsEmp.sector}
                      isValid={!errorsEmp.sector && touchedEmp.sector}
                    />
                    <Form.Control.Feedback type="invalid">{errorsEmp.sector?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sitio web</Form.Label>
                    <Form.Control
                      {...registerEmp('web')}
                      placeholder="https://..."
                      isInvalid={!!errorsEmp.web}
                      isValid={!errorsEmp.web && touchedEmp.web}
                    />
                    <Form.Control.Feedback type="invalid">{errorsEmp.web?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  {...registerEmp('descripcion')}
                  placeholder="Cuéntale a los candidatos sobre tu empresa..."
                  isInvalid={!!errorsEmp.descripcion}
                  isValid={!errorsEmp.descripcion && touchedEmp.descripcion}
                />
                <Form.Control.Feedback type="invalid">{errorsEmp.descripcion?.message}</Form.Control.Feedback>
              </Form.Group>
              <Button type="submit" variant="primary" disabled={guardandoEmp}>
                {guardandoEmp ? <Spinner size="sm" /> : 'Guardar empresa'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
