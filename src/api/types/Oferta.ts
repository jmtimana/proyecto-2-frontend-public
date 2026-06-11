// =========================================================
// Tipos de las ofertas laborales (coinciden con tus DTO del backend).
// =========================================================
import type { HabilidadResponse } from './User';

// Versión de lista -> GET /ofertas-laborales
export interface OfertaLaboralResponse {
  id: number;
  empresaUserId: number;
  companyName: string;
  title: string;
  description: string;
  ubicacion: string;
  modalidad: string;        // REMOTO | PRESENCIAL | HIBRIDO
  minSalary: number | null;
  maxSalary: number | null;
  minRequiredScore: number | null;
  status: string;           // ACTIVA | CERRADA | PAUSADA
  skills: HabilidadResponse[];
  applicationsCount: number;
  createdAt: string;
}

// Detalle -> GET /ofertas-laborales/{id} (un par de campos extra)
export interface OfertaLaboralDetailResponse {
  id: number;
  empresaUserId: number;
  companyName: string;
  companyBusinessName: string | null;
  title: string;
  description: string;
  ubicacion: string;
  modalidad: string;
  minSalary: number | null;
  maxSalary: number | null;
  minRequiredScore: number | null;
  status: string;
  skills: HabilidadResponse[];
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

// Lo que enviamos al crear -> POST /ofertas-laborales
// OJO: los campos van en ESPAÑOL (así los espera tu backend).
export interface OfertaLaboralCreateRequest {
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  modalidad?: string;
  salarioMin?: number;
  salarioMax?: number;
  scoreMinimoRequerido?: number;
  habilidadIds?: number[];
}
