import prisma from '../lib/prisma'

export const getLatestMetrics = async (clusterId: string) => {
  return prisma.metricSnapshot.findFirst({
    where: { clusterId },
    orderBy: { capturedAt: 'desc' },
  })
}

export const getMetricsHistory = async (clusterId: string, hours: number) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  return prisma.metricSnapshot.findMany({
    where: { clusterId, capturedAt: { gte: since } },
    orderBy: { capturedAt: 'asc' },
  })
}
