import { type Request, type Response, type NextFunction } from 'express'
import { deletePod, getPodById, getPodsByDeployment, restartPod } from '../services/podService'

export const listPods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pods = await getPodsByDeployment(req.params.id)
    return res.json(pods)
  } catch (error) {
    return next(error)
  }
}

export const getPod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pod = await getPodById(req.params.id)
    if (!pod) {
      return res.status(404).json({ error: 'Pod not found' })
    }
    return res.json(pod)
  } catch (error) {
    return next(error)
  }
}

export const deletePodHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deletePod(req.params.id)
    return res.status(202).json(result)
  } catch (error) {
    return next(error)
  }
}

export const restartPodHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pod = await restartPod(req.params.id)
    if (!pod) {
      return res.status(404).json({ error: 'Pod not found' })
    }
    return res.json(pod)
  } catch (error) {
    return next(error)
  }
}
