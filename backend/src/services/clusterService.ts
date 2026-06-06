import prisma from '../lib/prisma'

export const getAllClusters = async () => {
  return prisma.cluster.findMany({
    include: {
      _count: {
        select: { nodes: true, deployments: true },
      },
      deployments: {
        include: { pods: true },
      },
    },
  })
}

export const getClusterById = async (id: string) => {
  return prisma.cluster.findUnique({
    where: { id },
    include: {
      nodes: true,
      deployments: {
        include: { pods: true },
      },
      metricSnapshots: true,
    },
  })
}

export const createCluster = async (data: { name: string; environment: string; region: string }) => {
  return prisma.cluster.create({ data: { ...data, status: 'healthy' } })
}
