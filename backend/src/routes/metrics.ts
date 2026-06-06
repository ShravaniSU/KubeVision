import { Router } from 'express'
import { getClusterMetrics, getClusterMetricsHistory } from '../controllers/metricsController'

const router = Router()

router.get('/cluster/:id', getClusterMetrics)
router.get('/cluster/:id/history', getClusterMetricsHistory)

export default router
