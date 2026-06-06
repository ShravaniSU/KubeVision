import api from './client';

export const k8sApi = {
  getCluster: () =>
    api.get('/k8s/cluster').then(r => r.data),

  getNodes: () =>
    api.get('/k8s/nodes').then(r => r.data),

  getDeployments: () =>
    api.get('/k8s/deployments').then(r => r.data),

  getPods: (deployment?: string) =>
    api.get('/k8s/pods', { params: { deployment } }).then(r => r.data),

  getPodLogs: (podName: string, lines = 100) =>
    api.get(`/k8s/pods/${podName}/logs`, { params: { lines } }).then(r => r.data),

  getMetrics: () =>
    api.get('/k8s/metrics').then(r => r.data),

  getMetricsHistory: (hours = 24) =>
    api.get('/k8s/metrics/history', { params: { hours } }).then(r => r.data),
};