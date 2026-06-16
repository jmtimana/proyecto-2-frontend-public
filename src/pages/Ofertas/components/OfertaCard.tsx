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

export default function OfertaCard({
  oferta,
  miScore,
  mostrarGuardar = false,
  guardada = false,
  onToggleGuardar,
}: {
  oferta: OfertaLaboralResponse;
  miScore?: number | null;
  mostrarGuardar?: boolean;
  guardada?: boolean;
  onToggleGuardar?: (id: number) => void;
}) {
  // Si tenemos el score del estudiante y la oferta exige un mínimo, comparamos.
  const mostrarMatch = miScore != null && oferta.minRequiredScore != null;
  const cumple = mostrarMatch && (miScore as number) >= (oferta.minRequiredScore as number);
  const faltan = mostrarMatch ? ((oferta.minRequiredScore as number) - (miScore as number)) : 0;

  return (
    <Link to={`/ofertas/${oferta.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card
        className="mb-3 oferta-card"
        style={{ position: 'relative', border: '0.5px solid #e6e6ef', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow .15s' }}
      >
        {/* Botón de guardar (estrella). No navega: detiene el clic. */}
        {mostrarGuardar && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleGuardar?.(oferta.id);
            }}
            aria-label={guardada ? 'Quitar de guardadas' : 'Guardar oferta'}
            title={guardada ? 'Quitar de guardadas' : 'Guardar oferta'}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              color: guardada ? '#f5b301' : '#c9c9d2',
              zIndex: 2,
            }}
          >
            {guardada ? '★' : '☆'}
          </button>
        )}
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1" style={{ fontWeight: 600 }}>{oferta.title}</h5>
              <p className="text-secondary mb-2" style={{ fontSize: 14 }}>
                {oferta.companyName} · {oferta.ubicacion}
              </p>
            </div>
            <Badge bg={modalidadColor(oferta.modalidad)} style={{ marginRight: mostrarGuardar ? 28 : 0 }}>{oferta.modalidad}</Badge>
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
            <div className="d-flex align-items-center gap-2">
              {oferta.minRequiredScore != null && (
                <span style={{ color: 'var(--brand-dark)', fontWeight: 500 }}>Score mínimo: {oferta.minRequiredScore}</span>
              )}
              {mostrarMatch && (
                cumple ? (
                  <Badge bg="success">✓ Cumples</Badge>
                ) : (
                  <Badge bg="warning" text="dark">Te faltan {faltan.toFixed(2)}</Badge>
                )
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}
