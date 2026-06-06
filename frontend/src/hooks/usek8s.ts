import { useQuery } from '@tanstack/react-query';
import { k8sApi } from '../api/k8s';

export function useK8sCluster() {
  return useQuery({
    queryKey: ['k8s', 'cluster'],
    queryFn:  k8sApi.getCluster,
    refetchInterval: 30_000,
  });
}

export function useK8sNodes() {
  return useQuery({
    queryKey: ['k8s', 'nodes'],
    queryFn:  k8sApi.getNodes,
    refetchInterval: 30_000,
  });
}

export function useK8sDeployments() {
  return useQuery({
    queryKey: ['k8s', 'deployments'],
    queryFn:  k8sApi.getDeployments,
    refetchInterval: 30_000,
  });
}

export function useK8sPods(deployment?: string) {
  return useQuery({
    queryKey: ['k8s', 'pods', deployment],
    queryFn:  () => k8sApi.getPods(deployment),
    refetchInterval: 15_000,
  });
}

export function useK8sPodLogs(podName: string) {
  return useQuery({
    queryKey: ['k8s', 'logs', podName],
    queryFn:  () => k8sApi.getPodLogs(podName, 100),
    refetchInterval: 5_000,
    enabled:  !!podName,
  });
}

export function useK8sMetrics() {
  return useQuery({
    queryKey: ['k8s', 'metrics'],
    queryFn:  k8sApi.getMetrics,
    refetchInterval: 30_000,
  });
}

export function useK8sMetricsHistory(hours = 24) {
  return useQuery({
    queryKey: ['k8s', 'metrics', 'history', hours],
    queryFn:  () => k8sApi.getMetricsHistory(hours),
    refetchInterval: 30_000,
  });
}