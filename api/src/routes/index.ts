import { Hono } from 'hono'
import type { AppEnv } from '../types'
import billsRoutes from './bills.routes'
import healthRoutes from './health.routes'
import homesRoutes from './homes.routes'

const routes = new Hono<AppEnv>()

routes.route('/health', healthRoutes)
routes.route('/homes', homesRoutes)
routes.route('/bills', billsRoutes)

export default routes
