import { Router } from 'express'
import { listWorkers, listUsers, getStats } from '../controllers/admin.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.use(authenticate, authorize('admin'))

router.get('/stats', getStats)
router.get('/workers', listWorkers)
router.get('/users', listUsers)

export default router
