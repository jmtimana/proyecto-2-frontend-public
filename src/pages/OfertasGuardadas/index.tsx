import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { OfertaGuardadaApi } from '../../api/OfertaGuardadaApi';
import { UserApi } from '../../api/UserApi';
import { getErrorMessage } from '../../utils/errorHandler';
import Breadcrumb from '../../common/Breadcrumb';
import type { OfertaLaboralResponse } from '../../api/types/Oferta';
import OfertaCard from '../Ofertas/components/OfertaCard';

export default function OfertasGuardadas() {
  const [ofertas, setOfertas] = useState<OfertaLaboralResponse[]>([]);
  const [miScore, setMiScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    Promise.allSettled([OfertaGuardadaApi.list(), UserApi.me()])
      .then(([guardadasRes, meRes]) => {
        if (!vivo) return;
        if (guardadasRes.status === 'fulfilled') setOfertas(guardadasRes.value);
        else if (guardadasRes.status === 'rejected') setError(getErrorMessage(guardadasRes.reason));
        if (meRes.status === 'fulfilled') setMiScore(meRes.value.skillMatchScore ?? 0);
      })
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  async function quitar(id: number) {
    const previa = ofertas;
    setOfertas((prev) => prev.filter((o) => o.id !== id));
    try {
      await OfertaGuardadaApi.quitar(id);
    } catch {
      setOfertas(previa);
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Ofertas guardadas' }]} />
      <h3 style={{ fontWeight: 600 }} className="mb-1 d-flex align-items-center gap-2">
        <Star size={24} fill="#f5b301" color="#f5b301" aria-hidden="true" />
        Ofertas guardadas
      </h3>
      <p className="text-secondary mb-4">Las ofertas que marcaste para revisar después.</p>

      {loading && <div className="text-center py-5"><Spinner style={{ color: 'var(--brand)' }} /></div>}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && ofertas.length === 0 && (
        <div className="text-center py-5" style={{ color: '#999' }}>
          <Star size={40} className="mb-2" aria-hidden="true" />
          <p className="mt-2 mb-0">Aún no has guardado ninguna oferta.</p>
          <p style={{ fontSize: 13 }}>Toca la estrella de una oferta para guardarla.</p>
          <Button as={Link as any} to="/ofertas" variant="primary" size="sm" className="mt-2">
            Ver ofertas
          </Button>
        </div>
      )}

      {!loading && !error && ofertas.map((oferta) => (
        <OfertaCard
          key={oferta.id}
          oferta={oferta}
          miScore={miScore}
          mostrarGuardar
          guardada
          onToggleGuardar={quitar}
        />
      ))}
    </Container>
  );
}
