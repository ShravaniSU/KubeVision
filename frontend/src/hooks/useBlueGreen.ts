import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blueGreenApi } from '../api/bluegreen';

export function useBlueGreenStatus(deploymentId: string) {
  return useQuery({
    queryKey: ['bluegreen', 'status', deploymentId],
    queryFn: () => blueGreenApi.getStatus(deploymentId),
    enabled: !!deploymentId,
    refetchInterval: 5000,
  });
}

export function useDeployGreen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { deploymentId: string; version: string; image: string }) =>
      blueGreenApi.deploy(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bluegreen', 'status', variables.deploymentId] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}

export function useSwitchTraffic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { releaseId: string; deploymentId: string }) =>
      blueGreenApi.switch({ releaseId: data.releaseId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bluegreen', 'status', variables.deploymentId] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}

export function useRollback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { releaseId: string; deploymentId: string }) =>
      blueGreenApi.rollback({ releaseId: data.releaseId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bluegreen', 'status', variables.deploymentId] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}
