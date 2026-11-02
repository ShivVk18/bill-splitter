import type { Context } from 'hono'
import { homeExists } from '../lib/homes'
import { parseId } from '../lib/params'
import type { AppEnv } from '../types'

// Add a member to a home
export async function addMember(c: Context<AppEnv>) {
  const homeId = parseId(c.req.param('homeId'))

  if (homeId === null || !(await homeExists(c.env.DB, homeId))) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const { name } = await c.req.json<{ name: string }>()

  if (typeof name !== 'string' || !name.trim()) {
    return c.json({ error: 'Member name is required' }, 400)
  }

  const result = await c.env.DB.prepare('INSERT INTO members (home_id, name) VALUES (?, ?)')
    .bind(homeId, name.trim())
    .run()

  return c.json(
    {
      id: String(result.meta.last_row_id),
      homeId: String(homeId),
      name: name.trim(),
    },
    201,
  )
}
