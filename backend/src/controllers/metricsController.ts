import { type Request, type Response, type NextFunction } from 'express'
import { getLatestMetrics, getMetricsHistory } from '../services/metricsService'

export const getClusterMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await getLatestMetrics(req.params.id)
    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' })
    }
    return res.json(metrics)
  } catch (error) {
    return next(error)
  }
}

export const getClusterMetricsHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hours = typeof req.query.hours === 'string' ? Number(req.query.hours) : 24
    const history = await getMetricsHistory(req.params.id, hours)
    return res.json(history)
  } catch (error) {
    return next(error)
  }
}
