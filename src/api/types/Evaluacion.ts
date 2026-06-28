import type { HabilidadResponse } from './User';

export interface EvaluacionResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimitSeconds: number | null;
  maxScore: number | null;
  active: boolean;
  createdBy: number;
  skills: HabilidadResponse[];
  createdAt: string;
}

export interface PreguntaResponse {
  id: number;
  evaluacionId: number;
  questionText: string;
  questionType: string;
  lenguaje: string | null;
  templateCode: string | null;
  score: number;
  order: number;
  createdAt: string;
}

export interface EvaluacionDetailResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimitSeconds: number | null;
  maxScore: number | null;
  active: boolean;
  createdBy: number;
  skills: HabilidadResponse[];
  questions: PreguntaResponse[];
  createdAt: string;
}

export interface EvaluacionCreateRequest {
  titulo: string;
  descripcion: string;
  tipo: string;
  dificultad: string;
  tiempoLimiteSegundos?: number;
  puntajeMaximo?: number;
  activa: boolean;
  habilidadIds?: number[];
}

export interface EvaluacionUpdateRequest {
  titulo?: string;
  descripcion?: string;
  tipo?: string;
  dificultad?: string;
  tiempoLimiteSegundos?: number;
  puntajeMaximo?: number;
  activa?: boolean;
  habilidadIds?: number[];
}

export interface PreguntaCreateRequest {
  enunciado: string;
  tipoPregunta: string;
  lenguaje?: string;
  codigoPlantilla?: string;
  solucionEsperada: string;
  puntaje: number;
  orden: number;
}
