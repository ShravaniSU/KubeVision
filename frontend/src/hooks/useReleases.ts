import { useQuery } from '@tanstack/react-query';
import { releasesApi } from '../api/releases';

export function useReleases(params?: { limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['releases', params],
    queryFn: () => releasesApi.getAll(params),
    refetchInterval: 10000,
  });
}

export function useDeploymentReleases(deploymentId: string) {
  return useQuery({
    queryKey: ['releases', 'deployment', deploymentId],
    queryFn: () => releasesApi.getByDeploymentId(deploymentId),
    enabled: !!deploymentId,
    refetchInterval: 10000,
  });
}
