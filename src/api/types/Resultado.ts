// Coincide con ResultadoResponse del backend.
export interface ResultadoResponse {
  id: number;
  userId: number;
  evaluacionId: number;
  evaluationTitle: string;
  obtainedScore: number | null;
  maxScore: number | null;
  percentage: number | null;
  status: string; // EN_PROGRESO | COMPLETADA | ABANDONADA
  startDate: string | null;
  endDate: string | null;
  attempts: number;
  totalTimeSeconds: number | null;
}
