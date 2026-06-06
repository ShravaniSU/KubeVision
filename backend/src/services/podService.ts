import prisma from '../lib/prisma'

export const getPodsByDeployment = async (deploymentId: string) => {
  return prisma.pod.findMany({
    where: { deploymentId },
    include: {
      node: true,
    },
  })
}

export const getPodById = async (id: string) => {
  return prisma.pod.findUnique({
    where: { id },
    include: {
      deployment: true,
      node: true,
    },
  })
}

export const deletePod = async (id: string) => {
  await prisma.pod.update({ where: { id }, data: { status: 'Terminating' } })
  setTimeout(async () => {
    await prisma.pod.delete({ where: { id } })
  }, 1000)
  return { id, status: 'Terminating' }
}

export const restartPod = async (id: string) => {
  await prisma.pod.update({ where: { id }, data: { status: 'Pending' } })
  setTimeout(async () => {
    await prisma.pod.update({ where: { id }, data: { status: 'Running', restartedAt: new Date() } })
  }, 2000)
  return prisma.pod.findUnique({ where: { id } })
}
