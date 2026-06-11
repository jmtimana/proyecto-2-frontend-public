// =========================================================
// Tipos de GitHub (coinciden con tus DTO del backend).
// Varios campos son opcionales porque el backend omite los vacíos.
// =========================================================

// Lo que enviamos al conectar -> POST /github/connect
export interface GithubConnectRequest {
  githubToken: string;
}

export interface GithubRepoResponse {
  name: string;
  description?: string | null;
  language?: string | null;
  stars: number;
  forks: number;
  url?: string | null;
}

// GET /github/profile
export interface GithubProfileResponse {
  githubUsername: string;
  avatarUrl: string;
  bio?: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  githubScore: number;
  repos: GithubRepoResponse[];
}
