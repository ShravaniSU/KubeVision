import { type Request, type Response, type NextFunction } from 'express'
import { createCluster, getAllClusters, getClusterById } from '../services/clusterService'

export const listClusters = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clusters = await getAllClusters()
    const payload = clusters.map((cluster) => ({
      ...cluster,
      totalPods: cluster.deployments.reduce((sum, deployment) => sum + deployment.pods.length, 0),
    }))
    return res.json(payload)
  } catch (error) {
    return next(error)
  }
}

export const getCluster = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cluster = await getClusterById(req.params.id)
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' })
    }
    return res.json(cluster)
  } catch (error) {
    return next(error)
  }
}

export const createClusterHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cluster = await createCluster(req.body)
    return res.status(201).json(cluster)
  } catch (error) {
    return next(error)
  }
}
