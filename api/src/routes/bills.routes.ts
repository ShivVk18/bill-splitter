import { Hono } from 'hono'
import { payShare } from '../controllers/payments.controller'
import type { AppEnv } from '../types'

const billsRoutes = new Hono<AppEnv>()

billsRoutes.post('/:billId/shares/:shareId/pay', payShare)

export default billsRoutes
