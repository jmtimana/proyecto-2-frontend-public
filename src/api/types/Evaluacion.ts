// =========================================================
// Tipos de evaluaciones (coinciden con tus DTO del backend).
// Nota: PreguntaResponse NO trae la solución ni los casos de
// prueba, así que es seguro mostrarla al estudiante.
// =========================================================
import type { HabilidadResponse } from './User';

// Versión de lista -> GET /evaluaciones
export interface EvaluacionResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;        // FACIL | MEDIO | DIFICIL
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
  questionType: string;      // CODIGO | SQL | LOGICA
  lenguaje: string | null;
  templateCode: string | null;
  score: number;
  order: number;
  createdAt: string;
}

// Detalle -> GET /evaluaciones/{id} (incluye las preguntas)
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
