export interface Cluster {
  id: string;
  name: string;
  environment: 'production' | 'staging' | 'development';
  region: string;
  status: string;
  nodeCount: number;
  podCount: number;
  deploymentCount: number;
}

export interface ClusterDetail extends Cluster {
  nodes: Node[];
  deployments: Deployment[];
  metricsHistory?: MetricSnapshot[];
}

export interface Node {
  id: string;
  clusterId: string;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  status: string;
  podCount: number;
  pods?: Pod[];
}

export interface Deployment {
  id: string;
  clusterId: string;
  name: string;
  image: string;
  version: string;
  replicas: number;
  status: string;
  environment: string;
  createdAt: string;
  cluster?: Cluster;
  releases?: Release[];
  pods?: Pod[];
}

export interface Pod {
  id: string;
  deploymentId: string;
  nodeId: string;
  name: string;
  status: string;
  createdAt: string;
  nodeName?: string;
  node?: Node;
  deployment?: Deployment;
}

export interface Log {
  id: string;
  podId: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  createdAt: string;
}

export interface Release {
  id: string;
  deploymentId: string;
  version: string;
  color: 'blue' | 'green';
  status: string;
  trafficPct: number;
  deployedAt: string;
  deploymentName?: string;
  deployment?: Deployment;
}

export interface MetricSnapshot {
  id: string;
  clusterId: string;
  cpuUsage: number;
  memoryUsage: number;
  podCount: number;
  failedPods: number;
  recordedAt: string;
}

export interface CreateClusterDto {
  name: string;
  environment: 'production' | 'staging' | 'development';
  region: string;
}

export interface CreateDeploymentDto {
  name: string;
  image: string;
  version: string;
  replicas: number;
  environment: string;
  clusterId: string;
}
