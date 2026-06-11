// =========================================================
// Tarjeta de una oferta laboral en la lista.
// Toda la tarjeta es clickeable y lleva al detalle (/ofertas/:id).
// =========================================================
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { OfertaLaboralResponse } from '../../../api/types/Oferta';

function modalidadColor(m: string) {
  if (m === 'REMOTO') return 'success';
  if (m === 'HIBRIDO') return 'info';
  return 'secondary';
}

function salario(min: number | null, max: number | null) {
  if (min == null && max == null) return 'Salario no especificado';
  if (min != null && max != null) return `S/ ${min.toLocaleString()} - ${max.toLocaleString()}`;
  return `Desde S/ ${(min ?? max)!.toLocaleString()}`;
}

export default function OfertaCard({ oferta }: { oferta: OfertaLaboralResponse }) {
  return (
    <Link to={`/ofertas/${oferta.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card
        className="mb-3 oferta-card"
        style={{ border: '0.5px solid #e6e6ef', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow .15s' }}
      >
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1" style={{ fontWeight: 600 }}>{oferta.title}</h5>
              <p className="text-secondary mb-2" style={{ fontSize: 14 }}>
                {oferta.companyName} · {oferta.ubicacion}
              </p>
            </div>
            <Badge bg={modalidadColor(oferta.modalidad)}>{oferta.modalidad}</Badge>
          </div>

          <p className="mb-3" style={{ fontSize: 14, color: '#555' }}>
            {oferta.description.length > 160 ? oferta.description.slice(0, 160) + '...' : oferta.description}
          </p>

          {oferta.skills.length > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-1">
              {oferta.skills.map((s) => (
                <Badge key={s.id} bg="light" text="dark" style={{ fontWeight: 400 }}>{s.name}</Badge>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center" style={{ fontSize: 13 }}>
            <span className="text-secondary">{salario(oferta.minSalary, oferta.maxSalary)}</span>
            {oferta.minRequiredScore != null && (
              <span style={{ color: 'var(--brand-dark)', fontWeight: 500 }}>Score mínimo: {oferta.minRequiredScore}</span>
            )}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}
