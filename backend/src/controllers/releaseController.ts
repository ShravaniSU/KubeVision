import { type Request, type Response, type NextFunction } from 'express'
import { getAllReleases, getReleasesByDeployment } from '../services/releaseService'

export const listReleases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, deploymentId, page, limit } = req.query
    const data = await getAllReleases({
      status: typeof status === 'string' ? status : undefined,
      deploymentId: typeof deploymentId === 'string' ? deploymentId : undefined,
      page: typeof page === 'string' ? Number(page) : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
    })
    return res.json(data)
  } catch (error) {
    return next(error)
  }
}

export const listDeploymentReleases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const releases = await getReleasesByDeployment(req.params.id)
    return res.json(releases)
  } catch (error) {
    return next(error)
  }
}
