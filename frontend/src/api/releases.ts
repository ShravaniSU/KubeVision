import api from './client';
import { Release } from '../types';

interface ReleasesResponse {
  releases: Release[];
  total: number;
  page: number;
  limit: number;
}

export const releasesApi = {
  getAll: (params?: { limit?: number; status?: string }): Promise<Release[]> =>
    api.get<ReleasesResponse>('/releases', { params }).then((r) => r.data.releases),
  getByDeploymentId: (deploymentId: string): Promise<Release[]> =>
    api.get(`/deployments/${deploymentId}/releases`).then((r) => r.data),
};
