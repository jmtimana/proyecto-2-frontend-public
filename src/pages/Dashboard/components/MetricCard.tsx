interface Props {
  label: string;
  value: number | string;
}

export default function MetricCard({ label, value }: Props) {
  return (
    <div style={{ background: 'var(--app-surface-soft)', borderRadius: 10, padding: '1rem', flex: 1 }}>
      <div style={{ fontSize: 13, color: 'var(--app-muted)' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
