export interface HabilidadResponse {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
}

export interface HabilidadCreateRequest {
  nombre: string;
  categoria?: string;
  descripcion?: string;
}

export interface EmpresaResponse {
  id: number;
  userId: number;
  ruc: string;
  businessName: string;
  sector: string | null;
  size: string | null;
  description: string | null;
  web: string | null;
  subscription: string;
  createdAt: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  type: string;
  skillMatchScore: number | null;
  githubScore: number | null;
  githubUsername: string | null;
  githubConnectedAt: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UserDetailResponse extends UserResponse {
  skills: HabilidadResponse[];
  companyProfile: EmpresaResponse | null;
}

export interface ScoreResponse {
  userId: number;
  skillMatchScore: number;
  githubScore: number;
  totalScore: number;
  level: string;
}

export interface UserUpdateRequest {
  nombre?: string;
  apellido?: string;
  githubUsername?: string;
}

export interface EmpresaUpdateRequest {
  razonSocial?: string;
  sector?: string;
  descripcion?: string;
  web?: string;
}
