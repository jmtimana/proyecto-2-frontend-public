export interface RespuestaSubmitRequest {
  preguntaId: number;
  evaluacionId: number;
  codigo: string;
  lenguaje: string;
}

export interface RespuestaResponse {
  id: number;
  userId: number;
  preguntaId: number;
  evaluacionId: number;
  submittedCode: string;
  lenguaje: string;
  obtainedOutput: string | null;
  isCorrect: boolean | null;
  executionTimeMs: number | null;
  memoryKb: number | null;
  attempts: number;
  status: string;
  createdAt: string;
}
