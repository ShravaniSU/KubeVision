import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { podsApi } from '../api/pods';

export function usePods(deploymentId: string) {
  return useQuery({
    queryKey: ['pods', 'deployment', deploymentId],
    queryFn: () => podsApi.getByDeploymentId(deploymentId),
    enabled: !!deploymentId,
    refetchInterval: 5000,
  });
}

export function usePod(id: string) {
  return useQuery({
    queryKey: ['pods', id],
    queryFn: () => podsApi.getById(id),
    enabled: !!id,
  });
}

export function useDeletePod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => podsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pods'] });
    },
  });
}

export function useRestartPod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => podsApi.restart(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pods'] });
      queryClient.invalidateQueries({ queryKey: ['pods', data.id] });
    },
  });
}
