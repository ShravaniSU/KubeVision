import { getCluster, getNodes, getDeployments, getPods, getCurrentMetrics } from '../services/k8sService';

async function test() {
  const [cluster, nodes, deployments, pods, metrics] = await Promise.all([
    getCluster(),
    getNodes(),
    getDeployments(),
    getPods(),
    getCurrentMetrics(),
  ]);

  console.log('Cluster:', cluster);
  console.log('Nodes:', nodes);
  console.log('Deployments:', deployments.map(d => d.name + ' — ' + d.status));
  console.log('Pods:', pods.map(p => p.name + ' — ' + p.status));
  console.log('Metrics:', metrics);
}

test().catch(console.error);