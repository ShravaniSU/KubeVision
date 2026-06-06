import { Router } from 'express'
import { listDeploymentReleases, listReleases } from '../controllers/releaseController'

const router = Router()

router.get('/releases', listReleases)
router.get('/deployments/:id/releases', listDeploymentReleases)

export default router
