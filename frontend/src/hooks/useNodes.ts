import { useQuery } from '@tanstack/react-query';
import { nodesApi } from '../api/nodes';

export function useNodes(clusterId: string) {
  return useQuery({
    queryKey: ['nodes', 'cluster', clusterId],
    queryFn: () => nodesApi.getByClusterId(clusterId),
    enabled: !!clusterId,
    refetchInterval: 10000,
  });
}

export function useNode(id: string) {
  return useQuery({
    queryKey: ['nodes', id],
    queryFn: () => nodesApi.getById(id),
    enabled: !!id,
  });
}
