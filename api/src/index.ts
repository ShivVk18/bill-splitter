import { Hono } from 'hono'
import routes from './routes'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

app.route('/api', routes)

export default app
