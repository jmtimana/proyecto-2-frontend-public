export interface NivelInfo {
  nombre: string;
  emoji: string;
  color: string;
  hex: string;
  progreso: number;
  siguiente: string | null;
  faltaParaSiguiente: number | null;
}

export function nivelDeScore(scoreRaw: number | null | undefined): NivelInfo {
  const score = scoreRaw ?? 0;

  if (score >= 0.8) {
    return {
      nombre: 'EXCELENTE', emoji: '🏆', color: 'success', hex: '#1f9d57',
      progreso: 100, siguiente: null, faltaParaSiguiente: null,
    };
  }
  if (score >= 0.6) {
    return {
      nombre: 'BUENO', emoji: '🥇', color: 'primary', hex: '#534AB7',
      progreso: Math.round(((score - 0.6) / 0.2) * 100),
      siguiente: 'EXCELENTE', faltaParaSiguiente: +(0.8 - score).toFixed(2),
    };
  }
  if (score >= 0.4) {
    return {
      nombre: 'REGULAR', emoji: '🥈', color: 'info', hex: '#3aa0c9',
      progreso: Math.round(((score - 0.4) / 0.2) * 100),
      siguiente: 'BUENO', faltaParaSiguiente: +(0.6 - score).toFixed(2),
    };
  }
  return {
    nombre: 'BASICO', emoji: '🥉', color: 'secondary', hex: '#8a8a96',
    progreso: Math.round((score / 0.4) * 100),
    siguiente: 'REGULAR', faltaParaSiguiente: +(0.4 - score).toFixed(2),
  };
}
