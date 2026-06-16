// =========================================================
// Gráfico de línea (SVG puro, sin librerías) con el % obtenido
// en cada evaluación COMPLETADA, en orden cronológico.
// Muestra cómo evoluciona el desempeño del estudiante.
// =========================================================
import type { ResultadoResponse } from '../../../api/types/Resultado';

const BRAND = '#534AB7';
const BRAND_DARK = '#3b3490';

export default function ProgresoChart({ resultados }: { resultados: ResultadoResponse[] }) {
  const datos = [...resultados]
    .filter((r) => r.status === 'COMPLETADA' && r.maxScore > 0)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .map((r) => ({
      label: r.evaluationTitle,
      pct: Math.max(0, Math.min(100, Math.round((r.obtainedScore / r.maxScore) * 100))),
    }));

  if (datos.length === 0) {
    return (
      <div className="text-center text-secondary py-3" style={{ fontSize: 13 }}>
        Aún no tienes evaluaciones completadas. ¡Rinde una para ver tu progreso!
      </div>
    );
  }

  const W = 320;
  const H = 150;
  const P = 26; // padding interno
  const innerW = W - P * 2;
  const innerH = H - P * 2;
  const n = datos.length;

  const x = (i: number) => (n === 1 ? P + innerW / 2 : P + (innerW * i) / (n - 1));
  const y = (pct: number) => P + innerH - (innerH * pct) / 100;

  const linea = datos.map((d, i) => `${x(i)},${y(d.pct)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Líneas guía 0 / 50 / 100 */}
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={P} y1={y(g)} x2={W - P} y2={y(g)} stroke="#eee" strokeWidth={1} />
          <text x={2} y={y(g) + 3} fontSize={8} fill="#aaa">{g}</text>
        </g>
      ))}

      {/* Línea de progreso */}
      <polyline points={linea} fill="none" stroke={BRAND} strokeWidth={2} strokeLinejoin="round" />

      {/* Puntos con su % */}
      {datos.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.pct)} r={3.5} fill={BRAND} />
          <text x={x(i)} y={y(d.pct) - 7} fontSize={9} fill={BRAND_DARK} textAnchor="middle" fontWeight="600">
            {d.pct}%
          </text>
        </g>
      ))}
    </svg>
  );
}
