import axios from 'axios';

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';

async function query(promql: string): Promise<any[]> {
  const res = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
    params: { query: promql },
  });
  return res.data.data.result;
}

async function queryRange(promql: string, hours = 24): Promise<any[]> {
  const end = Math.floor(Date.now() / 1000);
  const start = end - hours * 3600;
  const res = await axios.get(`${PROMETHEUS_URL}/api/v1/query_range`, {
    params: {
      query: promql,
      start,
      end,
      step: '5m',
    },
  });
  return res.data.data.result;
}

export const prometheusClient = {
  // Node CPU usage %
  nodeCpuUsage: () =>
    query(`round(100 - (avg by(node) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100), 0.01)`),

  // Node memory usage %
  nodeMemoryUsage: () =>
    query(`round((1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100, 0.01)`),

  // Running pods per node
  podCountByNode: () =>
    query(`count by(node) (kube_pod_info{namespace="kubevision-apps"})`),

  // Total running pods in kubevision-apps
  runningPods: () =>
    query(`count(kube_pod_status_phase{namespace="kubevision-apps", phase="Running"})`),

  // Failed pods
  failedPods: () =>
    query(`count(kube_pod_status_phase{namespace="kubevision-apps", phase="Failed"}) or vector(0)`),

  // CPU usage history for charts (last N hours)
  cpuHistory: (hours = 24) =>
    queryRange(
      `round(100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100), 0.01)`,
      hours
    ),

  // Memory usage history for charts
  memoryHistory: (hours = 24) =>
    queryRange(
      `round((1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100, 0.01)`,
      hours
    ),

  // Pod count history
  podCountHistory: (hours = 24) =>
    queryRange(
      `count(kube_pod_info{namespace="kubevision-apps"})`,
      hours
    ),
};