import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../api/metrics';

export function useMetricsLatest(clusterId: string) {
  return useQuery({
    queryKey: ['metrics', 'latest', clusterId],
    queryFn: () => metricsApi.getLatest(clusterId),
    enabled: !!clusterId,
    refetchInterval: 30000,
  });
}

export function useMetricsHistory(clusterId: string, hours = 24) {
  return useQuery({
    queryKey: ['metrics', 'history', clusterId, hours],
    queryFn: () => metricsApi.getHistory(clusterId, hours),
    enabled: !!clusterId,
    refetchInterval: 30000,
  });
}
