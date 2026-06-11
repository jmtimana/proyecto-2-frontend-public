// Tarjeta pequeña de métrica (un número con su etiqueta). Reutilizable.
interface Props {
  label: string;
  value: number | string;
}

export default function MetricCard({ label, value }: Props) {
  return (
    <div style={{ background: '#f4f4f8', borderRadius: 10, padding: '1rem', flex: 1 }}>
      <div style={{ fontSize: 13, color: '#6b6b76' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
