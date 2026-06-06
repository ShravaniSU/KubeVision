import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deploymentsApi } from '../api/deployments';
import { CreateDeploymentDto } from '../types';

export function useDeployments(clusterId: string) {
  return useQuery({
    queryKey: ['deployments', 'cluster', clusterId],
    queryFn: () => deploymentsApi.getByClusterId(clusterId),
    enabled: !!clusterId,
    refetchInterval: 5000, // list updates every 5s
  });
}

export function useDeployment(id: string) {
  return useQuery({
    queryKey: ['deployments', id],
    queryFn: () => deploymentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeploymentDto) => deploymentsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', 'cluster', variables.clusterId] });
    },
  });
}

export function useScaleDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, replicas }: { id: string; replicas: number }) =>
      deploymentsApi.scale(id, replicas),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['deployments', 'cluster', data.clusterId] });
    },
  });
}

export function useRestartDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deploymentsApi.restart(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['deployments', 'cluster', data.clusterId] });
    },
  });
}
