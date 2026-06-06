import api from './client';
import { Pod } from '../types';

export const podsApi = {
  getByDeploymentId: (deploymentId: string): Promise<Pod[]> =>
    api.get(`/deployments/${deploymentId}/pods`).then((r) => r.data),
  getById: (id: string): Promise<Pod> =>
    api.get(`/pods/${id}`).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/pods/${id}`).then((r) => r.data),
  restart: (id: string): Promise<Pod> =>
    api.post(`/pods/${id}/restart`).then((r) => r.data),
};
