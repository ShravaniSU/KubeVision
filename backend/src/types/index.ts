import { type Cluster, type Deployment, type Node, type Pod, type Release, type MetricSnapshot } from '@prisma/client'

export type ClusterWithStats = Cluster & {
  nodes: Node[]
  deployments: Array<Deployment & { pods: Pod[] }>
  metricSnapshots: MetricSnapshot[]
}

export type NodeWithPods = Node & {
  pods: Pod[]
}

export type DeploymentWithPods = Deployment & {
  pods: Pod[]
  releases: Release[]
}

export type PodWithLogs = Pod & {
  deployment: Deployment
  node: Node
  logs: Array<{ id: string; level: string; message: string; timestamp: Date }>
}

export type ReleaseWithDeployment = Release & {
  deployment: Deployment
}
