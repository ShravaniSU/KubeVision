import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clustersApi } from '../api/clusters';
import { CreateClusterDto } from '../types';

export function useClusters() {
  return useQuery({
    queryKey: ['clusters'],
    queryFn: clustersApi.getAll,
    staleTime: 30000,
  });
}

export function useCluster(id: string) {
  return useQuery({
    queryKey: ['clusters', id],
    queryFn: () => clustersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCluster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClusterDto) => clustersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
}
