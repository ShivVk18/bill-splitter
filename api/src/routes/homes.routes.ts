import { Hono } from 'hono'
import { getBalances } from '../controllers/balances.controller'
import { createBill } from '../controllers/bills.controller'
import { createHome } from '../controllers/homes.controller'
import { addMember } from '../controllers/members.controller'
import type { AppEnv } from '../types'

const homesRoutes = new Hono<AppEnv>()

homesRoutes.post('/', createHome)
homesRoutes.post('/:homeId/members', addMember)
homesRoutes.post('/:homeId/bills', createBill)
homesRoutes.get('/:homeId/balances', getBalances)

export default homesRoutes
