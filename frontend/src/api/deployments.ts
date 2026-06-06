import api from './client';
import { Deployment, CreateDeploymentDto } from '../types';

export const deploymentsApi = {
  getByClusterId: (clusterId: string): Promise<Deployment[]> =>
    api.get(`/clusters/${clusterId}/deployments`).then((r) => r.data),
  getById: (id: string): Promise<Deployment> =>
    api.get(`/deployments/${id}`).then((r) => r.data),
  create: (data: CreateDeploymentDto): Promise<Deployment> =>
    api.post('/deployments', data).then((r) => r.data),
  scale: (id: string, replicas: number): Promise<Deployment> =>
    api.patch(`/deployments/${id}/scale`, { replicas }).then((r) => r.data),
  restart: (id: string): Promise<Deployment> =>
    api.post(`/deployments/${id}/restart`).then((r) => r.data),
};
