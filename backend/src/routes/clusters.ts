import { Router } from 'express'
import { z } from 'zod'
import { createClusterHandler, getCluster, listClusters } from '../controllers/clusterController'
import { listNodes } from '../controllers/nodeController'
import { listDeployments } from '../controllers/deploymentController'
import { validate } from '../middleware/validate'

const router = Router()

const clusterSchema = z.object({
  name: z.string().min(1),
  environment: z.enum(['production', 'staging', 'development']),
  region: z.string().min(1),
})

router.get('/', listClusters)
router.get('/:id', getCluster)
router.get('/:id/nodes', listNodes)
router.get('/:id/deployments', listDeployments)
router.post('/', validate(clusterSchema), createClusterHandler)

export default router
