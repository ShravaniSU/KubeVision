import api from './client';
import { Log } from '../types';

export const logsApi = {
  getByPod: (
    podId: string,
    params?: { level?: string; limit?: number; cursor?: string }
  ): Promise<Log[]> =>
    api.get(`/pods/${podId}/logs`, { params }).then((r) => r.data),
  getByDeployment: (deploymentId: string): Promise<Log[]> =>
    api.get(`/deployments/${deploymentId}/logs`).then((r) => r.data),
};
