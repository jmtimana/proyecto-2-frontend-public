// =========================================================
// Conectar GitHub.
// Al cargar, intenta traer el perfil. Si ya está conectado,
// muestra los datos. Si no, muestra el formulario para pegar
// el token personal (PAT).
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { GithubApi } from '../../api/GithubApi';
import type { GithubProfileResponse } from '../../api/types/Github';

export default function ConectarGitHub() {
  const [profile, setProfile] = useState<GithubProfileResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  // Estado del formulario de conexión
  const [token, setToken] = useState('');
  const [conectando, setConectando] = useState(false);
  const [error, setError] = useState('');

  // Al cargar: ¿ya está conectado? Intentamos traer el perfil.
  useEffect(() => {
    let vivo = true;
    GithubApi.profile()
      .then((p) => vivo && setProfile(p))
      .catch(() => {
        // Falla = no está conectado todavía. Se muestra el formulario.
      })
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, []);

  async function conectar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setConectando(true);
    try {
      const p = await GithubApi.connect({ githubToken: token });
      setProfile(p); // conectó -> mostramos el perfil
      setToken('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo conectar. Revisa que el token sea válido.');
    } finally {
      setConectando(false);
    }
  }

  if (cargando) {
    return <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>;
  }

  // ---------- Vista CONECTADO ----------
  if (profile) {
    return (
      <Container className="py-5" style={{ maxWidth: 680 }}>
        <h3 style={{ fontWeight: 600 }} className="mb-4">Tu GitHub</h3>

        <Card style={{ border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }} className="mb-4">
          <Card.Body className="p-4 d-flex align-items-center gap-3">
            <img src={profile.avatarUrl} alt="avatar" width={64} height={64} style={{ borderRadius: '50%' }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 600, fontSize: 18 }}>@{profile.githubUsername}</div>
              {profile.bio && <div className="text-secondary" style={{ fontSize: 14 }}>{profile.bio}</div>}
              <div className="text-secondary mt-1" style={{ fontSize: 13 }}>
                {profile.publicRepos} repos · {profile.followers} seguidores · {profile.following} siguiendo
              </div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: 12, color: 'var(--brand-dark)' }}>GitHub Score</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--brand)' }}>
                {profile.githubScore.toFixed(2)}
              </div>
            </div>
          </Card.Body>
        </Card>

        <h6 className="text-secondary mb-3">Repositorios públicos</h6>
        {profile.repos.map((r) => (
          <Card key={r.name} className="mb-2" style={{ border: '0.5px solid #e6e6ef' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ fontWeight: 500 }}>{r.name}</span>
                <span style={{ fontSize: 13, color: '#6b6b76' }}>★ {r.stars} · ⑂ {r.forks}</span>
              </div>
              {r.description && <div className="text-secondary mt-1" style={{ fontSize: 13 }}>{r.description}</div>}
              {r.language && <Badge bg="light" text="dark" className="mt-2" style={{ fontWeight: 400 }}>{r.language}</Badge>}
            </Card.Body>
          </Card>
        ))}
      </Container>
    );
  }

  // ---------- Vista NO CONECTADO ----------
  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card style={{ border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span style={{ fontSize: 24 }}>🐙</span>
            <h5 style={{ fontWeight: 600, margin: 0 }}>Conecta tu GitHub</h5>
          </div>
          <p className="text-secondary" style={{ fontSize: 14 }}>
            Vincular tu GitHub mejora tu SkillMatch Score con tu actividad real.
          </p>

          <Alert variant="light" style={{ fontSize: 13, border: '0.5px solid #e6e6ef' }}>
            <strong>¿Cómo obtengo un token?</strong>
            <ol className="mb-0 mt-1 ps-3">
              <li>GitHub → Settings → Developer settings</li>
              <li>Personal access tokens → Tokens (classic)</li>
              <li>Generate new token, con el permiso <code>read:user</code></li>
              <li>Copia el token (empieza con <code>ghp_</code>)</li>
            </ol>
          </Alert>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          <Form onSubmit={conectar}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 14 }}>Tu token personal de GitHub</Form.Label>
              <Form.Control
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                required
              />
              <Form.Text className="text-secondary">
                Tu token viaja seguro a tu backend y no se muestra a nadie más.
              </Form.Text>
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={conectando || !token}>
              {conectando ? <Spinner size="sm" /> : 'Conectar GitHub'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
