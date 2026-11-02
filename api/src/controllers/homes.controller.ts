import type { Context } from 'hono'
import type { AppEnv } from '../types'

// Create a home
export async function createHome(c: Context<AppEnv>) {
  const { name } = await c.req.json<{ name: string }>()

  if (typeof name !== 'string' || !name.trim()) {
    return c.json({ error: 'Home name is required' }, 400)
  }

  const result = await c.env.DB.prepare('INSERT INTO homes (name) VALUES (?)')
    .bind(name.trim())
    .run()

  return c.json(
    {
      id: String(result.meta.last_row_id),
      name: name.trim(),
    },
    201,
  )
}
