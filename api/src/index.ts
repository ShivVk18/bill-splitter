import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => {
  return c.json({ status: 'ok' })
})


// Create a home
app.post('/api/homes', async (c) => {
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
})

// Add a member to a home
app.post('/api/homes/:homeId/members', async (c) => {
  const homeId = Number(c.req.param('homeId'))

  if (!Number.isSafeInteger(homeId) || homeId <= 0) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()

  if (!home) {
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
})

export default app
