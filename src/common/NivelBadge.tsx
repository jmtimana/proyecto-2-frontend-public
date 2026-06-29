import { Badge } from 'react-bootstrap';
import { nivelDeScore } from '../utils/nivel';
import NivelIcon from './NivelIcon';

interface Props {
  score: number | null | undefined;
  size?: 'sm' | 'md';
}

export default function NivelBadge({ score, size = 'sm' }: Props) {
  const n = nivelDeScore(score);
  const fontSize = size === 'md' ? 14 : 12;
  const padding = size === 'md' ? '6px 12px' : '4px 9px';
  return (
    <Badge bg={n.color} style={{ fontWeight: 500, fontSize, padding }}>
      <span className="d-inline-flex align-items-center gap-1">
        <NivelIcon nivel={n.nombre} size={size === 'md' ? 14 : 12} />
        {n.nombre}
      </span>
    </Badge>
  );
}
