import { Router } from 'express'
import { z } from 'zod'
import { deployGreenHandler, getBlueGreen, rollbackHandler, switchTrafficHandler } from '../controllers/blueGreenController'
import { validate } from '../middleware/validate'

const router = Router()

const blueGreenSchema = z.object({
  deploymentId: z.string().uuid(),
  version: z.string().min(1),
  image: z.string().min(1),
})

const trafficSchema = z.object({
  releaseId: z.string().uuid(),
})

router.get('/:deploymentId/status', getBlueGreen)
router.post('/deploy', validate(blueGreenSchema), deployGreenHandler)
router.post('/switch', validate(trafficSchema), switchTrafficHandler)
router.post('/rollback', validate(trafficSchema), rollbackHandler)

export default router
