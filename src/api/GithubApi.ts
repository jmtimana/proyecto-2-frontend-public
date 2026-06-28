import api from './configs/axiosConfig';
import type {
  GithubConnectRequest,
  GithubProfileResponse,
} from './types/Github';

export const GithubApi = {

  connect: (payload: GithubConnectRequest) =>
    api.post<GithubProfileResponse>('/github/connect', payload).then((r) => r.data),

  profile: () =>
    api.get<GithubProfileResponse>('/github/profile').then((r) => r.data),
};
