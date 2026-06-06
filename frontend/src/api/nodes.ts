import api from './client';
import { Node } from '../types';

export const nodesApi = {
  getByClusterId: (clusterId: string): Promise<Node[]> =>
    api.get(`/clusters/${clusterId}/nodes`).then((r) => r.data),
  getById: (id: string): Promise<Node> =>
    api.get(`/nodes/${id}`).then((r) => r.data),
};
