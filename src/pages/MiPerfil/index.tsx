// =========================================================
// "Mi perfil" (cualquier usuario logueado).
// - Muestra datos de solo-lectura (email, tipo, score, habilidades).
// - Permite EDITAR los datos básicos -> PUT /users/me.
// - Si el usuario es EMPRESA, también edita el perfil de empresa
//   (razón social, sector, descripción, web) -> PUT /empresas/me.
// Tras guardar, refrescamos los datos y actualizamos la sesión para
// que la barra superior ("Hola, X") muestre el nombre nuevo.
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { UserApi } from '../../api/UserApi';
import { useAuth } from '../../context/AuthContext';
import type { UserDetailResponse } from '../../api/types/User';
import NivelBadge from '../../common/NivelBadge';
import { nivelDeScore } from '../../utils/nivel';

export default function MiPerfil() {
  const { updateSessionUser } = useAuth();

  const [me, setMe] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // --- Formulario de datos básicos (todos los usuarios) ---
  const [userForm, setUserForm] = useState({ nombre: '', apellido: '', githubUsername: '' });
  const [guardandoUser, setGuardandoUser] = useState(false);
  const [msgUser, setMsgUser] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  // --- Formulario de empresa (solo EMPRESA) ---
  const [empForm, setEmpForm] = useState({ razonSocial: '', sector: '', descripcion: '', web: '' });
  const [guardandoEmp, setGuardandoEmp] = useState(false);
  const [msgEmp, setMsgEmp] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  // Rellena los formularios a partir de los datos del usuario.
  function llenarFormularios(u: UserDetailResponse) {
    setUserForm({
      nombre: u.firstName ?? '',
      apellido: u.lastName ?? '',
      githubUsername: u.githubUsername ?? '',
    });
    if (u.companyProfile) {
      setEmpForm({
        razonSocial: u.companyProfile.businessName ?? '',
        sector: u.companyProfile.sector ?? '',
        descripcion: u.companyProfile.description ?? '',
        web: u.companyProfile.web ?? '',
      });
    }
  }

  // Carga inicial.
  useEffect(() => {
    let vivo = true;
    UserApi.me()
      .then((u) => {
        if (!vivo) return;
        setMe(u);
        llenarFormularios(u);
      })
      .catch(() => vivo && setErrorCarga('No se pudo cargar tu perfil.'))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  // Guardar datos básicos.
  async function guardarUser(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoUser(true);
    setMsgUser(null);
    try {
      await UserApi.update({
        nombre: userForm.nombre,
        apellido: userForm.apellido,
        githubUsername: userForm.githubUsername || undefined,
      });
      // Refrescamos el perfil completo y la sesión (para la Navbar).
      const actualizado = await UserApi.me();
      setMe(actualizado);
      llenarFormularios(actualizado);
      updateSessionUser({ firstName: actualizado.firstName, lastName: actualizado.lastName });
      setMsgUser({ tipo: 'success', texto: 'Tus datos se guardaron correctamente.' });
    } catch (err: any) {
      setMsgUser({ tipo: 'danger', texto: err?.response?.data?.message ?? 'No se pudieron guardar tus datos.' });
    } finally {
      setGuardandoUser(false);
    }
  }

  // Guardar datos de empresa.
  async function guardarEmpresa(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoEmp(true);
    setMsgEmp(null);
    try {
      await UserApi.updateEmpresa({
        razonSocial: empForm.razonSocial || undefined,
        sector: empForm.sector || undefined,
        descripcion: empForm.descripcion || undefined,
        web: empForm.web || undefined,
      });
      const actualizado = await UserApi.me();
      setMe(actualizado);
      llenarFormularios(actualizado);
      setMsgEmp({ tipo: 'success', texto: 'Los datos de tu empresa se guardaron correctamente.' });
    } catch (err: any) {
      setMsgEmp({ tipo: 'danger', texto: err?.response?.data?.message ?? 'No se pudieron guardar los datos de la empresa.' });
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
      <h3 style={{ fontWeight: 600 }} className="mb-4">Mi perfil</h3>

      {/* Cabecera de solo-lectura */}
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

      {/* Score (solo informativo, para estudiantes) */}
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

            {/* Progreso al siguiente nivel */}
            {(() => {
              const nivel = nivelDeScore(me.skillMatchScore);
              return nivel.siguiente ? (
                <div style={{ marginTop: 14 }}>
                  <div className="d-flex justify-content-between text-secondary" style={{ fontSize: 11, marginBottom: 4 }}>
                    <span>Progreso a {nivel.siguiente}</span>
                    <span>Te faltan {nivel.faltaParaSiguiente?.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 8, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
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

      {/* Formulario: datos básicos */}
      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-4">
          <h5 style={{ fontWeight: 600 }} className="mb-3">Datos básicos</h5>
          {msgUser && <Alert variant={msgUser.tipo}>{msgUser.texto}</Alert>}
          <Form onSubmit={guardarUser}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    value={userForm.nombre}
                    onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    value={userForm.apellido}
                    onChange={(e) => setUserForm({ ...userForm, apellido: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Usuario de GitHub</Form.Label>
              <Form.Control
                value={userForm.githubUsername}
                onChange={(e) => setUserForm({ ...userForm, githubUsername: e.target.value })}
                placeholder="tu-usuario-github"
              />
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

      {/* Formulario: datos de empresa (solo EMPRESA) */}
      {esEmpresa && (
        <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
          <Card.Body className="p-4">
            <h5 style={{ fontWeight: 600 }} className="mb-1">Datos de la empresa</h5>
            {me.companyProfile?.ruc && (
              <p className="text-secondary" style={{ fontSize: 13 }}>RUC: {me.companyProfile.ruc} (no editable)</p>
            )}
            {msgEmp && <Alert variant={msgEmp.tipo}>{msgEmp.texto}</Alert>}
            <Form onSubmit={guardarEmpresa}>
              <Form.Group className="mb-3">
                <Form.Label>Razón social</Form.Label>
                <Form.Control
                  value={empForm.razonSocial}
                  onChange={(e) => setEmpForm({ ...empForm, razonSocial: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sector</Form.Label>
                    <Form.Control
                      value={empForm.sector}
                      onChange={(e) => setEmpForm({ ...empForm, sector: e.target.value })}
                      placeholder="Ej. Fintech"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sitio web</Form.Label>
                    <Form.Control
                      value={empForm.web}
                      onChange={(e) => setEmpForm({ ...empForm, web: e.target.value })}
                      placeholder="https://..."
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={empForm.descripcion}
                  onChange={(e) => setEmpForm({ ...empForm, descripcion: e.target.value })}
                  placeholder="Cuéntale a los candidatos sobre tu empresa..."
                />
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
