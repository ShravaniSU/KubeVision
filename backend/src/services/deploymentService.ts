import prisma from '../lib/prisma'

export const getDeploymentsByCluster = async (clusterId: string) => {
  return prisma.deployment.findMany({
    where: { clusterId },
    include: {
      pods: true,
    },
  })
}

export const getDeploymentById = async (id: string) => {
  return prisma.deployment.findUnique({
    where: { id },
    include: {
      pods: true,
      releases: {
        orderBy: { deployedAt: 'desc' },
        take: 1,
      },
    },
  })
}

export const createDeployment = async (data: {
  clusterId: string
  name: string
  image: string
  version: string
  replicas: number
}) => {
  const deployment = await prisma.deployment.create({
    data: {
      name: data.name,
      clusterId: data.clusterId,
      image: data.image,
      version: data.version,
      replicas: data.replicas,
      availableReplicas: data.replicas,
      status: 'running',
    },
  })

  const pods = []
  for (let i = 1; i <= data.replicas; i += 1) {
    pods.push(
      prisma.pod.create({
        data: {
          name: `${data.name}-pod-${i}`,
          deploymentId: deployment.id,
          nodeId: '',
          status: 'Running',
          startedAt: new Date(),
        },
      })
    )
  }

  try {
    await Promise.all(pods)
  } catch {
    // ignore pod creation if nodes are not assigned yet
  }

  return deployment
}

export const scaleDeployment = async (id: string, replicas: number) => {
  const deployment = await prisma.deployment.findUnique({
    where: { id },
    include: { pods: true },
  })
  if (!deployment) {
    return null
  }

  const currentCount = deployment.pods.length
  const change = replicas - currentCount

  if (change > 0) {
    const newPods = []
    for (let i = currentCount + 1; i <= replicas; i += 1) {
      newPods.push(
        prisma.pod.create({
          data: {
            name: `${deployment.name}-pod-${i}`,
            deploymentId: deployment.id,
            nodeId: deployment.pods[0]?.nodeId ?? '',
            status: 'Pending',
            startedAt: new Date(),
          },
        })
      )
    }
    await Promise.all(newPods)
  }

  if (change < 0) {
    const podsToRemove = deployment.pods.slice(replicas)
    await Promise.all(podsToRemove.map((pod: any) => prisma.pod.delete({ where: { id: pod.id } })))
  }

  return prisma.deployment.update({
    where: { id },
    data: {
      replicas,
      availableReplicas: Math.min(replicas, deployment.availableReplicas),
      status: 'running',
    },
  })
}

export const restartDeployment = async (id: string) => {
  await prisma.deployment.update({ where: { id }, data: { status: 'restarting' } })

  setTimeout(async () => {
    await prisma.deployment.update({ where: { id }, data: { status: 'running' } })
  }, 2000)

  return prisma.deployment.findUnique({ where: { id } })
}

export const deleteDeployment = async (id: string) => {
  const deployment = await prisma.deployment.findUnique({ where: { id } })
  if (!deployment) {
    return null
  }

  await prisma.pod.deleteMany({ where: { deploymentId: id } })
  await prisma.deployment.delete({ where: { id } })
  return true
}
