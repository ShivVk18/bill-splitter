import { Hono } from 'hono'
import { getHealth } from '../controllers/health.controller'
import type { AppEnv } from '../types'

const healthRoutes = new Hono<AppEnv>()

healthRoutes.get('/', getHealth)

export default healthRoutes
