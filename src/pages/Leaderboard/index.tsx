// =========================================================
// Ranking de los mejores estudiantes por SkillMatch Score.
// Consume: GET /users/leaderboard (UserApi.leaderboard).
// Resalta tu propia fila si apareces en el top.
// =========================================================
import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
import { UserApi } from '../../api/UserApi';
import { useAuth } from '../../context/AuthContext';
import NivelBadge from '../../common/NivelBadge';
import type { UserResponse } from '../../api/types/User';

function medalla(i: number): string {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return `#${i + 1}`;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    UserApi.leaderboard()
      .then(setItems)
      .catch(() => setError('No se pudo cargar el ranking.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <h3 style={{ fontWeight: 600 }} className="mb-1">🏆 Ranking de estudiantes</h3>
      <p className="text-secondary mb-4">Los mejores SkillMatch Score de la plataforma.</p>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-5 text-secondary" style={{ fontSize: 14 }}>
          <div style={{ fontSize: 40 }}>📊</div>
          Aún no hay estudiantes con score. ¡Rinde evaluaciones para aparecer aquí!
        </div>
      )}

      {!loading && !error && items.map((u, i) => {
        const esYo = u.id === user?.userId;
        return (
          <Card
            key={u.id}
            className="mb-2"
            style={{
              border: esYo ? '1.5px solid var(--brand)' : '0.5px solid #e6e6ef',
              background: esYo ? '#f6f5ff' : '#fff',
            }}
          >
            <Card.Body className="p-3 d-flex align-items-center gap-3">
              <div style={{ width: 42, textAlign: 'center', fontSize: i < 3 ? 24 : 16, fontWeight: 700, color: '#6b6b76' }}>
                {medalla(i)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {u.firstName} {u.lastName}
                  {esYo && <span style={{ fontSize: 12, color: 'var(--brand)', marginLeft: 6 }}>(tú)</span>}
                </div>
                <div className="mt-1"><NivelBadge score={u.skillMatchScore} /></div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--brand-dark)' }}>
                {(u.skillMatchScore ?? 0).toFixed(2)}
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </Container>
  );
}
