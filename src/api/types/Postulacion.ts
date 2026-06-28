export interface PostulacionResponse {
  id: number;
  userId: number;
  userName: string;
  ofertaLaboralId: number;
  offerTitle: string;
  status: string;
  coverLetter: string | null;
  userSkillMatchScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostulacionCreateRequest {
  ofertaLaboralId: number;
  cartaPresentacion?: string;
}

export interface PostulacionEstadoRequest {
  estado: string;
}
