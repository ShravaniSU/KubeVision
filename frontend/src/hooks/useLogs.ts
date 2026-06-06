import { useQuery } from '@tanstack/react-query';
import { logsApi } from '../api/logs';

export function useLogs(podId: string, level?: string, limit?: number, cursor?: string) {
  return useQuery({
    queryKey: ['logs', 'pod', podId, { level, limit, cursor }],
    queryFn: () => logsApi.getByPod(podId, { level, limit, cursor }),
    enabled: !!podId,
    refetchInterval: 5000,
  });
}

export function useDeploymentLogs(deploymentId: string) {
  return useQuery({
    queryKey: ['logs', 'deployment', deploymentId],
    queryFn: () => logsApi.getByDeployment(deploymentId),
    enabled: !!deploymentId,
    refetchInterval: 5000,
  });
}
