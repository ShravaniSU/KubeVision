import prisma from '../lib/prisma'

export const getLogsByPod = async (podId: string, options: { level?: string; limit?: number; cursor?: string }) => {
  const where: any = { podId }
  if (options.level) {
    where.level = options.level
  }

  const logs = await prisma.log.findMany({
    where,
    orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
    take: options.limit ?? 50,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  })

  const nextCursor = logs.length === (options.limit ?? 50) ? logs[logs.length - 1].id : null
  const total = await prisma.log.count({ where })

  return { logs, nextCursor, total }
}

export const getLogsByDeployment = async (deploymentId: string, options: { level?: string; limit?: number }) => {
  const where: any = { pod: { deploymentId } }
  if (options.level) {
    where.level = options.level
  }

  const logs = await prisma.log.findMany({
    where,
    orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
    take: options.limit ?? 100,
  })

  const total = await prisma.log.count({ where })
  return { logs, total }
}
