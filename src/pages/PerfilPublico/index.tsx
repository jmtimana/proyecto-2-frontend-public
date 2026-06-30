import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
import { GitFork } from 'lucide-react';
import { UserApi } from '../../api/UserApi';
import { getErrorMessage } from '../../utils/errorHandler';
import NivelBadge from '../../common/NivelBadge';
import { nivelDeScore } from '../../utils/nivel';
import type { UserResponse } from '../../api/types/User';

export default function PerfilPublico() {
  const { id } = useParams();
  const [u, setU] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    UserApi.getById(Number(id))
      .then((res) => vivo && setU(res))
      .catch((err) => vivo && setError(getErrorMessage(err)))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>
    );
  }

  if (error || !u) {
    return (
      <Container className="py-5" style={{ maxWidth: 680 }}>
        <Alert variant="danger">{error || 'Perfil no encontrado.'}</Alert>
        <Link to="/empresa/candidatos" className="brand-link">← Volver a candidatos</Link>
      </Container>
    );
  }

  const inicial = (u.firstName || u.email || '?').charAt(0).toUpperCase();
  const nivel = nivelDeScore(u.skillMatchScore);

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <Link to="/empresa/candidatos" className="brand-link" style={{ fontSize: 14 }}>← Volver a candidatos</Link>

      <Card className="mt-3 mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--brand)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, flexShrink: 0,
            }}
          >
            {inicial}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 20 }}>{u.firstName} {u.lastName}</div>
            <div className="text-secondary" style={{ fontSize: 14 }}>{u.email}</div>
            <div className="mt-1"><NivelBadge score={u.skillMatchScore} size="md" /></div>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between">
            <div>
              <div className="text-secondary" style={{ fontSize: 13 }}>SkillMatch Score</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--brand-dark)' }}>
                {(u.skillMatchScore ?? 0).toFixed(2)}
              </div>
            </div>
            <div className="text-end">
              <div className="text-secondary" style={{ fontSize: 13 }}>Score GitHub</div>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{(u.githubScore ?? 0).toFixed(2)}</div>
            </div>
          </div>

          {nivel.siguiente && (
            <div style={{ marginTop: 14 }}>
              <div className="d-flex justify-content-between text-secondary" style={{ fontSize: 11, marginBottom: 4 }}>
                <span>Progreso a {nivel.siguiente}</span>
                <span>Le faltan {nivel.faltaParaSiguiente?.toFixed(2)}</span>
              </div>
              <div style={{ height: 8, background: 'var(--app-surface-soft)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${nivel.progreso}%`, height: '100%', background: 'var(--brand)' }} />
              </div>
            </div>
          )}

          {u.githubUsername && (
            <div className="mt-3">
              <a
                href={`https://github.com/${u.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="brand-link"
                style={{ fontSize: 14 }}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <GitFork size={14} aria-hidden="true" />
                  github.com/{u.githubUsername}
                </span>
              </a>
            </div>
          )}
        </Card.Body>
      </Card>

      {u.bio && (
        <Card className="mb-4" style={{ border: '0.5px solid #e6e6ef' }}>
          <Card.Body className="p-4">
            <h6 className="text-secondary mb-2">Sobre mí</h6>
            <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{u.bio}</p>
          </Card.Body>
        </Card>
      )}

      <p className="text-secondary" style={{ fontSize: 12 }}>
        Miembro desde {new Date(u.createdAt).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
      </p>
    </Container>
  );
}
