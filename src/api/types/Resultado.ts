export interface ResultadoResponse {
  id: number;
  userId: number;
  evaluacionId: number;
  evaluationTitle: string;
  obtainedScore: number;
  maxScore: number;
  percentage?: number | null;
  status: string;
  startDate: string;
  endDate?: string | null;
  totalTimeSeconds?: number | null;
  attempts: number;
}
