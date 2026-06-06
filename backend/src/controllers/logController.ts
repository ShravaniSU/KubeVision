import { type Request, type Response, type NextFunction } from 'express'
import { getLogsByDeployment, getLogsByPod } from '../services/logService'

export const listPodLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level, limit, cursor } = req.query
    const data = await getLogsByPod(req.params.id, {
      level: typeof level === 'string' ? level : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
      cursor: typeof cursor === 'string' ? cursor : undefined,
    })
    return res.json(data)
  } catch (error) {
    return next(error)
  }
}

export const listDeploymentLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level, limit } = req.query
    const data = await getLogsByDeployment(req.params.id, {
      level: typeof level === 'string' ? level : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
    })
    return res.json(data)
  } catch (error) {
    return next(error)
  }
}
