import { type Request, type Response, type NextFunction } from 'express'
import { deployGreen, getBlueGreenStatus, rollback, switchTraffic } from '../services/blueGreenService'

export const getBlueGreen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await getBlueGreenStatus(req.params.deploymentId)
    return res.json(status)
  } catch (error) {
    return next(error)
  }
}

export const deployGreenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deploymentId, version, image } = req.body
    const result = await deployGreen(deploymentId, version, image)
    if (!result) {
      return res.status(404).json({ error: 'Deployment not found' })
    }
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

export const switchTrafficHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await switchTraffic(req.body.releaseId)
    if (!result) {
      return res.status(404).json({ error: 'Green release not found' })
    }
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}

export const rollbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await rollback(req.body.releaseId)
    if (!result) {
      return res.status(404).json({ error: 'Rollback candidate not found' })
    }
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}
