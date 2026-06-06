import { coreApi, appsApi, metricsApi, TARGET_NAMESPACE } from '../lib/k8s';
import { prometheusClient } from '../lib/prometheusClient';

// ─── CLUSTER ────────────────────────────────────────────────────────────────

export async function getCluster() {
  const [nodes, pods, deployments, cpu, memory] = await Promise.all([
    coreApi.listNode(),
    coreApi.listNamespacedPod({ namespace: TARGET_NAMESPACE }),
    appsApi.listNamespacedDeployment({ namespace: TARGET_NAMESPACE }),
    prometheusClient.nodeCpuUsage(),
    prometheusClient.nodeMemoryUsage(),
  ]);

  const cpuValue    = parseFloat(cpu[0]?.value[1] ?? '0');
  const memoryValue = parseFloat(memory[0]?.value[1] ?? '0');

  return {
    id:              'kubevision-control-plane',
    name:            'KubeVision Cluster',
    environment:     'production',
    region:          'local',
    status:          nodes.items.every(n =>
                       n.status?.conditions?.find(c => c.type === 'Ready')?.status === 'True'
                     ) ? 'healthy' : 'degraded',
    nodeCount:       nodes.items.length,
    podCount:        pods.items.length,
    deploymentCount: deployments.items.length,
    cpuUsage:        cpuValue,
    memoryUsage:     memoryValue,
  };
}

// ─── NODES ──────────────────────────────────────────────────────────────────

export async function getNodes() {
  const [nodes, podList, cpuMetrics, memMetrics] = await Promise.all([
    coreApi.listNode(),
    coreApi.listNamespacedPod({ namespace: TARGET_NAMESPACE }),
    prometheusClient.nodeCpuUsage(),
    prometheusClient.nodeMemoryUsage(),
  ]);

  const cpuValue = parseFloat(cpuMetrics[0]?.value[1] ?? '0');
  const memValue = parseFloat(memMetrics[0]?.value[1] ?? '0');

  return nodes.items.map(node => {
    const name     = node.metadata?.name ?? 'unknown';
    const ready    = node.status?.conditions?.find(c => c.type === 'Ready')?.status === 'True';
    const podCount = podList.items.filter(p => p.spec?.nodeName === name).length;

    return {
      id:          node.metadata?.uid ?? name,
      name,
      status:      ready ? 'healthy' : 'warning',
      cpuUsage:    cpuValue,
      memoryUsage: memValue,
      diskUsage:   0,
      podCount,
      roles:       Object.keys(node.metadata?.labels ?? {})
                     .filter(l => l.startsWith('node-role.kubernetes.io/'))
                     .map(l => l.replace('node-role.kubernetes.io/', '')),
    };
  });
}

// ─── DEPLOYMENTS ────────────────────────────────────────────────────────────

export async function getDeployments() {
  const deployments = await appsApi.listNamespacedDeployment({
    namespace: TARGET_NAMESPACE,
  });

  return deployments.items.map(d => {
    const desired   = d.spec?.replicas ?? 0;
    const ready     = d.status?.readyReplicas ?? 0;
    const available = d.status?.availableReplicas ?? 0;

    let status = 'running';
    if (ready === 0)          status = 'failed';
    else if (ready < desired) status = 'pending';

    return {
      id:          d.metadata?.uid ?? '',
      name:        d.metadata?.name ?? '',
      namespace:   d.metadata?.namespace ?? '',
      image:       d.spec?.template.spec?.containers[0]?.image ?? '',
      version:     d.metadata?.labels?.version ?? 'latest',
      replicas:    desired,
      readyReplicas: ready,
      availableReplicas: available,
      status,
      environment: 'production',
      createdAt:   d.metadata?.creationTimestamp ?? new Date(),
    };
  });
}

// ─── PODS ────────────────────────────────────────────────────────────────────

export async function getPods(deploymentName?: string) {
  const pods = await coreApi.listNamespacedPod({ namespace: TARGET_NAMESPACE });

  let items = pods.items;
  if (deploymentName) {
    items = items.filter(p =>
      p.metadata?.labels?.['app'] === deploymentName ||
      p.metadata?.name?.startsWith(deploymentName)
    );
  }

  return items.map(p => ({
    id:           p.metadata?.uid ?? '',
    name:         p.metadata?.name ?? '',
    status:       p.status?.phase ?? 'Unknown',
    nodeName:     p.spec?.nodeName ?? '',
    podIP:        p.status?.podIP ?? '',
    image:        p.spec?.containers[0]?.image ?? '',
    restartCount: p.status?.containerStatuses?.[0]?.restartCount ?? 0,
    createdAt:    p.metadata?.creationTimestamp ?? new Date(),
    labels:       p.metadata?.labels ?? {},
  }));
}

// ─── LOGS ───────────────────────────────────────────────────────────────────

export async function getPodLogs(podName: string, lines = 100) {
  const logs = await coreApi.readNamespacedPodLog({
    name:      podName,
    namespace: TARGET_NAMESPACE,
    tailLines: lines,
  });

  return (logs ?? '')
    .split('\n')
    .filter(Boolean)
    .map((line, i) => {
      const level =
        line.includes('ERROR') ? 'ERROR' :
        line.includes('WARN')  ? 'WARN'  :
        line.includes('DEBUG') ? 'DEBUG' : 'INFO';

      return {
        id:        `${podName}-${i}`,
        message:   line,
        level,
        createdAt: new Date().toISOString(),
      };
    });
}

// ─── METRICS ────────────────────────────────────────────────────────────────

export async function getMetricsHistory(hours = 24) {
  const [cpu, memory, podCount] = await Promise.all([
    prometheusClient.cpuHistory(hours),
    prometheusClient.memoryHistory(hours),
    prometheusClient.podCountHistory(hours),
  ]);

  // Align all series by timestamp
  const cpuPoints    = cpu[0]?.values    ?? [];
  const memPoints    = memory[0]?.values ?? [];
  const podPoints    = podCount[0]?.values ?? [];

  return cpuPoints.map(([ts, cpuVal]: [number, string], i: number) => ({
    recordedAt:  new Date(ts * 1000).toISOString(),
    cpuUsage:    parseFloat(cpuVal),
    memoryUsage: parseFloat(memPoints[i]?.[1] ?? '0'),
    podCount:    parseInt(podPoints[i]?.[1]   ?? '0'),
    failedPods:  0,
  }));
}

export async function getCurrentMetrics() {
  const [cpu, memory, running, failed] = await Promise.all([
    prometheusClient.nodeCpuUsage(),
    prometheusClient.nodeMemoryUsage(),
    prometheusClient.runningPods(),
    prometheusClient.failedPods(),
  ]);

  return {
    cpuUsage:    parseFloat(cpu[0]?.value[1]     ?? '0'),
    memoryUsage: parseFloat(memory[0]?.value[1]  ?? '0'),
    podCount:    parseInt(running[0]?.value[1]   ?? '0'),
    failedPods:  parseInt(failed[0]?.value[1]    ?? '0'),
    recordedAt:  new Date().toISOString(),
  };
}