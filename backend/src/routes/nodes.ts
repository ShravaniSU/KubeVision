import { Router } from 'express'
import { z } from 'zod'
import { createNodeHandler, deleteNodeHandler, getNode, listNodes } from '../controllers/nodeController'
import { validate } from '../middleware/validate'

const router = Router()

const nodeSchema = z.object({
  clusterId: z.string().uuid(),
  name: z.string().min(1),
  status: z.enum(['ready', 'not_ready', 'unknown']),
  nodeType: z.string().min(1),
})

router.get('/', listNodes)
router.get('/:id', getNode)
router.post('/', validate(nodeSchema), createNodeHandler)
router.delete('/:id', deleteNodeHandler)

export default router
