import prisma from '../lib/prisma'

export const deployGreen = async (deploymentId: string, version: string, image: string) => {
  const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId }, include: { releases: true } })
  if (!deployment) return null

  const newRelease = await prisma.release.create({
    data: {
      deploymentId,
      version,
      color: 'green',
      status: 'testing',
      notes: 'Green deployment started',
      deployedAt: new Date(),
    },
  })

  await prisma.deployment.update({ where: { id: deploymentId }, data: { version, image, status: 'running' } })

  return { deployment, greenRelease: newRelease }
}

export const switchTraffic = async (releaseId: string) => {
  const greenRelease = await prisma.release.findUnique({ where: { id: releaseId } })
  if (!greenRelease || greenRelease.color !== 'green') return null

  const blueRelease = await prisma.release.findFirst({
    where: { deploymentId: greenRelease.deploymentId, color: 'blue', status: { not: 'rolled-back' } },
    orderBy: { deployedAt: 'desc' },
  })

  const updatedGreen = await prisma.release.update({ where: { id: greenRelease.id }, data: { status: 'active' } })
  let updatedBlue = null

  if (blueRelease) {
    updatedBlue = await prisma.release.update({ where: { id: blueRelease.id }, data: { status: 'rolled-back-available' } })
  }

  return { green: updatedGreen, blue: updatedBlue }
}

export const rollback = async (releaseId: string) => {
  const release = await prisma.release.findUnique({ where: { id: releaseId } })
  if (!release) return null

  const deploymentId = release.deploymentId
  const greenRelease = await prisma.release.findFirst({
    where: { deploymentId, color: 'green' },
    orderBy: { deployedAt: 'desc' },
  })
  const blueRelease = await prisma.release.findFirst({
    where: { deploymentId, color: 'blue' },
    orderBy: { deployedAt: 'desc' },
  })

  if (!greenRelease || !blueRelease) return null

  const updatedBlue = await prisma.release.update({ where: { id: blueRelease.id }, data: { status: 'active' } })
  const updatedGreen = await prisma.release.update({ where: { id: greenRelease.id }, data: { status: 'rolled-back' } })

  return { blue: updatedBlue, green: updatedGreen }
}

export const getBlueGreenStatus = async (deploymentId: string) => {
  const releases = await prisma.release.findMany({
    where: { deploymentId, color: { in: ['blue', 'green'] } },
    orderBy: { deployedAt: 'desc' },
  })
  return releases
}
