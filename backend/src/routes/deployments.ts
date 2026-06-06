import { Router } from 'express'
import { z } from 'zod'
import {
  createDeploymentHandler,
  deleteDeploymentHandler,
  getDeployment,
  listDeployments,
  restartDeploymentHandler,
  scaleDeploymentHandler,
} from '../controllers/deploymentController'
import { validate } from '../middleware/validate'

const router = Router()

const deploymentSchema = z.object({
  clusterId: z.string().uuid(),
  name: z.string().min(1),
  image: z.string().min(1),
  version: z.string().min(1),
  replicas: z.number().int().min(1),
})

const scaleSchema = z.object({
  replicas: z.number().int().min(1),
})

router.get('/', listDeployments)
router.get('/:id', getDeployment)
router.post('/', validate(deploymentSchema), createDeploymentHandler)
router.patch('/:id/scale', validate(scaleSchema), scaleDeploymentHandler)
router.post('/:id/restart', restartDeploymentHandler)
router.delete('/:id', deleteDeploymentHandler)

export default router
