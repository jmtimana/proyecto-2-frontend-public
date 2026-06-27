// Bloque "cargando" con brillo animado. Se usa en lugar de los spinners.
interface Props {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = '100%', height = 16, radius = 8, className = '', style }: Props) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
