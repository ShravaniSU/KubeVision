import { type Request, type Response, type NextFunction } from 'express'
import { createDeployment, deleteDeployment, getDeploymentById, getDeploymentsByCluster, restartDeployment, scaleDeployment } from '../services/deploymentService'

export const listDeployments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployments = await getDeploymentsByCluster(req.params.id)
    return res.json(deployments)
  } catch (error) {
    return next(error)
  }
}

export const getDeployment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployment = await getDeploymentById(req.params.id)
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' })
    }
    return res.json(deployment)
  } catch (error) {
    return next(error)
  }
}

export const createDeploymentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployment = await createDeployment(req.body)
    return res.status(201).json(deployment)
  } catch (error) {
    return next(error)
  }
}

export const deleteDeploymentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteDeployment(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Deployment not found' })
    }
    return res.status(202).json({ success: true })
  } catch (error) {
    return next(error)
  }
}

export const scaleDeploymentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployment = await scaleDeployment(req.params.id, req.body.replicas)
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' })
    }
    return res.json(deployment)
  } catch (error) {
    return next(error)
  }
}

export const restartDeploymentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployment = await restartDeployment(req.params.id)
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' })
    }
    return res.json(deployment)
  } catch (error) {
    return next(error)
  }
}
