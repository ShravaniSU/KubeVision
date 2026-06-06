import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2))
const sample = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const pastDate = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60 * 1000)

const clusters = [
  { name: 'Production Cluster', environment: 'production', region: 'us-east-1', status: 'healthy' },
  { name: 'Staging Cluster', environment: 'staging', region: 'us-west-2', status: 'healthy' },
  { name: 'Development Cluster', environment: 'development', region: 'eu-west-1', status: 'degraded' },
]

const nodeStatusOptions = ['healthy', 'healthy', 'healthy', 'warning', 'degraded']
const deploymentNames = ['inventory-service', 'auth-service', 'payment-service', 'notification-service']
const podStatuses = ['Running', 'Running', 'Running', 'Pending', 'CrashLoopBackOff']
const logMessages = [
  'Service started successfully',
  'Database connection established',
  'Health check passed',
  'High memory usage detected',
  'Request processed successfully',
  'Connection timeout warning',
  'Cache refreshed',
  'Deployment rollout completed',
  'Pod restarted automatically',
  'Configuration loaded',
]
const logLevels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR']
const releaseStatuses = ['succeeded', 'succeeded', 'rolled-back', 'succeeded', 'active']
const releaseColors = ['blue', 'green']

async function main() {
  for (const clusterConfig of clusters) {
    const cluster = await prisma.cluster.create({ data: clusterConfig })

    const nodes = [] as Array<{ id: string; name: string }>
    for (let i = 1; i <= 5; i += 1) {
      const node = await prisma.node.create({
        data: {
          name: `node-${clusterConfig.environment}-${String(i).padStart(2, '0')}`,
          clusterId: cluster.id,
          cpuUsage: randomFloat(20, 90),
          memoryUsage: randomFloat(30, 85),
          diskUsage: randomFloat(10, 70),
          status: nodeStatusOptions[randomInt(0, nodeStatusOptions.length - 1)],
        },
      })
      nodes.push({ id: node.id, name: node.name })
    }

    const deployments = [] as Array<{ id: string; name: string }>
    for (let i = 0; i < deploymentNames.length; i += 1) {
      const deployment = await prisma.deployment.create({
        data: {
          name: deploymentNames[i],
          clusterId: cluster.id,
          image: `docker.io/kubevision/${deploymentNames[i]}`,
          version: `v1.${i}.0`,
          replicas: randomInt(2, 5),
          availableReplicas: randomInt(1, 5),
          status: i === 3 && clusterConfig.environment === 'development' ? 'pending' : 'running',
        },
      })
      deployments.push({ id: deployment.id, name: deployment.name })
    }

    for (const deployment of deployments) {
      const assignedNodeIds = nodes.map((node) => node.id).sort(() => Math.random() - 0.5).slice(0, 3)
      for (let podIndex = 1; podIndex <= 3; podIndex += 1) {
        const pod = await prisma.pod.create({
          data: {
            name: `${clusterConfig.environment}-${deployment.name}-pod-${podIndex}`,
            deploymentId: deployment.id,
            nodeId: assignedNodeIds[(podIndex - 1) % assignedNodeIds.length],
            status: sample(podStatuses),
            startedAt: pastDate(randomInt(10, 360)),
          },
        })

        for (let logIndex = 0; logIndex < 40; logIndex += 1) {
          await prisma.log.create({
            data: {
              podId: pod.id,
              level: logLevels[randomInt(0, logLevels.length - 1)],
              message: sample(logMessages),
              timestamp: pastDate(randomInt(0, 48 * 60)),
            },
          })
        }
      }

      for (let releaseIndex = 0; releaseIndex < 5; releaseIndex += 1) {
        await prisma.release.create({
          data: {
            deploymentId: deployment.id,
            version: `v1.${releaseIndex}.${releaseIndex === 4 ? 0 : 0}`,
            color: releaseColors[releaseIndex % releaseColors.length],
            status: releaseStatuses[releaseIndex],
            notes: releaseIndex === 2 ? 'Rollback due to instability' : 'Release completed successfully',
            deployedAt: pastDate((30 - releaseIndex * 6) * 24 * 60),
          },
        })
      }
    }

    for (let snapshotIndex = 0; snapshotIndex < 48; snapshotIndex += 1) {
      await prisma.metricSnapshot.create({
        data: {
          clusterId: cluster.id,
          cpuUsage: randomFloat(40, 85),
          memoryUsage: randomFloat(40, 85),
          podCount: randomInt(50, 70),
          failedPods: randomInt(0, 3),
          capturedAt: pastDate((47 - snapshotIndex) * 30),
        },
      })
    }
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
