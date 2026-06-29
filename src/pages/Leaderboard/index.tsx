import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
import { Award, ChartNoAxesCombined, Crown, Medal, Trophy } from 'lucide-react';
import { UserApi } from '../../api/UserApi';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../common/Breadcrumb';
import NivelBadge from '../../common/NivelBadge';
import type { UserResponse } from '../../api/types/User';

function medalla(i: number): ReactNode {
  if (i === 0) return <Crown size={24} color="#d9a300" aria-hidden="true" />;
  if (i === 1) return <Medal size={24} color="#8a8a96" aria-hidden="true" />;
  if (i === 2) return <Award size={24} color="#b76e22" aria-hidden="true" />;
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
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Ranking' }]} />
      <h3 style={{ fontWeight: 600 }} className="mb-1 d-flex align-items-center gap-2">
        <Trophy size={26} color="var(--brand)" aria-hidden="true" />
        Ranking de estudiantes
      </h3>
      <p className="text-secondary mb-4">Los mejores SkillMatch Score de la plataforma.</p>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-5 text-secondary" style={{ fontSize: 14 }}>
          <ChartNoAxesCombined size={40} className="mb-2" aria-hidden="true" />
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
              border: esYo ? '1.5px solid var(--brand)' : '0.5px solid var(--app-border)',
              background: esYo ? 'var(--brand-light)' : 'var(--app-surface)',
            }}
          >
            <Card.Body className="p-3 d-flex align-items-center gap-3">
              <div style={{ width: 42, textAlign: 'center', fontSize: i < 3 ? 24 : 16, fontWeight: 700, color: 'var(--app-muted)' }}>
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
