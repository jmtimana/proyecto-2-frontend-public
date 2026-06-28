import type { HabilidadResponse } from './User';

export interface OfertaLaboralResponse {
  id: number;
  empresaUserId: number;
  companyName: string;
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
}

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

export interface OfertaLaboralUpdateRequest {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
  modalidad?: string;
  salarioMin?: number;
  salarioMax?: number;
  scoreMinimoRequerido?: number;
  estado?: string;
  habilidadIds?: number[];
}
