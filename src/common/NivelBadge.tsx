// Insignia (medalla) con el nivel del usuario según su score.
import { Badge } from 'react-bootstrap';
import { nivelDeScore } from '../utils/nivel';

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
      {n.emoji} {n.nombre}
    </Badge>
  );
}
