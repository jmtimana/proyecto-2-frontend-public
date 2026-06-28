import type { ResultadoResponse } from '../../../api/types/Resultado';

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
      <div className="text-center text-secondary py-4">
        <div style={{ fontSize: 34 }}>📈</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>
          Aún no tienes evaluaciones completadas.<br />¡Rinde una para ver tu progreso aquí!
        </div>
      </div>
    );
  }

  const ALTO = 130;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: datos.length < 4 ? 'flex-start' : 'space-around', gap: 18, height: ALTO + 36, paddingTop: 6 }}>
      {datos.map((d, i) => {
        const h = Math.max(6, Math.round((d.pct / 100) * ALTO));
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 84 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-dark)', marginBottom: 4 }}>{d.pct}%</div>
            <div
              style={{
                width: 34, height: h,
                background: 'linear-gradient(180deg, var(--brand) 0%, #8076d8 100%)',
                borderRadius: '7px 7px 0 0',
                transition: 'height .4s ease',
              }}
            />
            <div title={d.label} style={{ fontSize: 10, color: '#8a8a96', marginTop: 6, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
