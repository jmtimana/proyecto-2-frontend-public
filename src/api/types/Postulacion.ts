// Coincide con PostulacionResponse del backend.
export interface PostulacionResponse {
  id: number;
  userId: number;
  userName: string;
  ofertaLaboralId: number;
  offerTitle: string;
  status: string; // PENDIENTE | ACEPTADA | RECHAZADA
  coverLetter: string | null;
  userSkillMatchScore: number | null;
  createdAt: string;
  updatedAt: string;
}

// Lo que enviamos al postularnos -> POST /postulaciones
export interface PostulacionCreateRequest {
  ofertaLaboralId: number;
  cartaPresentacion?: string;
}

// PATCH /postulaciones/{id}/estado
export interface PostulacionEstadoRequest {
  estado: string; // PENDIENTE | ACEPTADA | RECHAZADA
}
