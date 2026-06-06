import prisma from '../lib/prisma'

export const getNodesByCluster = async (clusterId: string) => {
  return prisma.node.findMany({
    where: { clusterId },
    include: {
      pods: true,
    },
  })
}

export const getNodeById = async (id: string) => {
  return prisma.node.findUnique({
    where: { id },
    include: {
      pods: true,
    },
  })
}

export const createNode = async (data: {
  clusterId: string
  name: string
  status: string
}) => {
  return prisma.node.create({
    data: {
      clusterId: data.clusterId,
      name: data.name,
      status: data.status,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
    },
  })
}

export const deleteNode = async (id: string) => {
  const node = await prisma.node.findUnique({ where: { id } })
  if (!node) {
    return null
  }

  await prisma.node.delete({ where: { id } })
  return true
}
