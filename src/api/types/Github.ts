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
