import api from './client';
import { Cluster, ClusterDetail, CreateClusterDto } from '../types';

export const clustersApi = {
  getAll: (): Promise<Cluster[]> => api.get('/clusters').then((r) => r.data),
  getById: (id: string): Promise<ClusterDetail> => api.get(`/clusters/${id}`).then((r) => r.data),
  create: (data: CreateClusterDto): Promise<Cluster> => api.post('/clusters', data).then((r) => r.data),
};
