import { Router } from 'express'
import { restartPodHandler, deletePodHandler, getPod, listPods } from '../controllers/podController'

const router = Router()

router.get('/deployments/:id/pods', listPods)
router.get('/pods/:id', getPod)
router.delete('/pods/:id', deletePodHandler)
router.post('/pods/:id/restart', restartPodHandler)

export default router
