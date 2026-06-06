import cron from 'node-cron'
import prisma from '../lib/prisma'

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const drift = (value: number) => clamp(value + (Math.random() * 10 - 5))

const refreshMetrics = async () => {
  const clusters = await prisma.cluster.findMany({
    include: {
      nodes: true,
      deployments: {
        include: {
          pods: true,
        },
      },
    },
  })

  const nodeUpdates = clusters.flatMap((cluster) =>
    cluster.nodes.map((node) =>
      prisma.node.update({
        where: { id: node.id },
        data: {
          cpuUsage: drift(node.cpuUsage),
          memoryUsage: drift(node.memoryUsage),
          diskUsage: drift(node.diskUsage),
        },
      })
    )
  )

  await Promise.all(nodeUpdates)

  await Promise.all(
    clusters.map(async (cluster) => {
      const allPods = cluster.deployments.flatMap((deployment) => deployment.pods)
      const cpuUsage = cluster.nodes.reduce((sum: number, node: any) => sum + node.cpuUsage, 0) / Math.max(cluster.nodes.length, 1)
      const memoryUsage = cluster.nodes.reduce((sum: number, node: any) => sum + node.memoryUsage, 0) / Math.max(cluster.nodes.length, 1)
      const podCount = allPods.length
      const failedPods = allPods.filter((pod: any) => pod.status !== 'Running').length

      return prisma.metricSnapshot.create({
        data: {
          clusterId: cluster.id,
          cpuUsage,
          memoryUsage,
          podCount,
          failedPods,
          capturedAt: new Date(),
        },
      })
    })
  )

  console.log('[Metrics] Snapshot recorded at', new Date().toISOString())
}

const job = cron.schedule('*/30 * * * * *', async () => {
  try {
    await refreshMetrics()
  } catch (error) {
    console.error('[Metrics] Snapshot failed', error)
  }
})

export const startMetricsSimulator = () => {
  job.start()
}
