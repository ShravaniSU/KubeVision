import prisma from '../lib/prisma'

export const getAllReleases = async (options: { status?: string; deploymentId?: string; limit?: number; page?: number }) => {
  const where: any = {}
  if (options.status) where.status = options.status
  if (options.deploymentId) where.deploymentId = options.deploymentId

  const limit = options.limit ?? 20
  const page = Math.max(options.page ?? 1, 1)
  const skip = (page - 1) * limit

  const [releases, total] = await Promise.all([
    prisma.release.findMany({
      where,
      orderBy: { deployedAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.release.count({ where }),
  ])

  return { releases, total, page, limit }
}

export const getReleasesByDeployment = async (deploymentId: string) => {
  return prisma.release.findMany({
    where: { deploymentId },
    orderBy: { deployedAt: 'desc' },
  })
}
