import api from './client';
import { MetricSnapshot } from '../types';

export const metricsApi = {
  getLatest: (clusterId: string): Promise<MetricSnapshot> =>
    api.get(`/metrics/cluster/${clusterId}`).then((r) => r.data),
  getHistory: (clusterId: string, hours = 24): Promise<MetricSnapshot[]> =>
    api.get(`/metrics/cluster/${clusterId}/history`, { params: { hours } }).then((r) => r.data),
};
