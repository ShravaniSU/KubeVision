import { Router } from 'express'
import { listDeploymentLogs, listPodLogs } from '../controllers/logController'

const router = Router()

router.get('/deployments/:id/logs', listDeploymentLogs)
router.get('/pods/:id/logs', listPodLogs)

export default router
