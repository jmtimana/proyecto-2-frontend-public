import { Award, Medal, Target, Trophy } from 'lucide-react';

interface Props {
  nivel: string;
  size?: number;
  color?: string;
}

export default function NivelIcon({ nivel, size = 16, color = 'currentColor' }: Props) {
  if (nivel === 'EXCELENTE') return <Trophy size={size} color={color} aria-hidden="true" />;
  if (nivel === 'BUENO') return <Medal size={size} color={color} aria-hidden="true" />;
  if (nivel === 'REGULAR') return <Award size={size} color={color} aria-hidden="true" />;
  if (nivel === 'BASICO') return <Target size={size} color={color} aria-hidden="true" />;
  return <Medal size={size} color={color} aria-hidden="true" />;
}
