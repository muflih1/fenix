import { Router } from 'express'
import AuthRouter from './auth.route.js'

const router = Router()

router.use('/auth', AuthRouter)

export default router