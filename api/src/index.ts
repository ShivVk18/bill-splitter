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

// Create a bill and split it equally among home members
app.post('/api/homes/:homeId/bills', async (c) => {
  const homeId = Number(c.req.param('homeId'))

  if (!Number.isSafeInteger(homeId) || homeId <= 0) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const body = await c.req.json<{
    title?: unknown
    totalCents?: unknown
  }>()

  const { title, totalCents } = body

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    typeof totalCents !== 'number' ||
    !Number.isSafeInteger(totalCents) ||
    totalCents <= 0
  ) {
    return c.json({ error: 'Invalid bill details' }, 422)
  }

  const { results: members } = await c.env.DB.prepare(
    'SELECT id FROM members WHERE home_id = ? ORDER BY id ASC',
  )
    .bind(homeId)
    .all<{ id: number }>()

  if (members.length === 0) {
    return c.json({ error: 'Home has no members' }, 422)
  }

  const baseShare = Math.floor(totalCents / members.length)
  const remainder = totalCents % members.length

  const billResult = await c.env.DB.prepare(
    'INSERT INTO bills (home_id, title, total_cents) VALUES (?, ?, ?)',
  )
    .bind(homeId, title.trim(), totalCents)
    .run()

  const billId = billResult.meta.last_row_id

  const statements = members.map((member, index) =>
    c.env.DB.prepare('INSERT INTO shares (bill_id, member_id, amount_cents) VALUES (?, ?, ?)').bind(
      billId,
      member.id,
      baseShare + (index < remainder ? 1 : 0),
    ),
  )

  await c.env.DB.batch(statements)

  const { results: shares } = await c.env.DB.prepare(
    'SELECT id, member_id, amount_cents, paid_at FROM shares WHERE bill_id = ? ORDER BY id ASC',
  )
    .bind(billId)
    .all<{
      id: number
      member_id: number
      amount_cents: number
      paid_at: string | null
    }>()

  return c.json(
    {
      id: String(billId),
      homeId: String(homeId),
      title: title.trim(),
      totalCents,
      shares: shares.map((share) => ({
        id: String(share.id),
        memberId: String(share.member_id),
        amountCents: share.amount_cents,
        paidAt: share.paid_at,
      })),
    },
    201,
  )
})

// Pay a share
app.post('/api/bills/:billId/shares/:shareId/pay', async (c) => {
  const billId = Number(c.req.param('billId'))
  const shareId = Number(c.req.param('shareId'))
  const idempotencyKey = c.req.header('Idempotency-Key')

  if (!idempotencyKey?.trim()) {
    return c.json({ error: 'Idempotency-Key header is required' }, 400)
  }

  if (
    !Number.isSafeInteger(billId) ||
    billId <= 0 ||
    !Number.isSafeInteger(shareId) ||
    shareId <= 0
  ) {
    return c.json({ error: 'Bill or share not found' }, 404)
  }

  const bill = await c.env.DB.prepare('SELECT id FROM bills WHERE id = ?').bind(billId).first()

  if (!bill) {
    return c.json({ error: 'Bill not found' }, 404)
  }

  const getShare = () =>
    c.env.DB.prepare(
      `SELECT id, member_id, amount_cents, paid_at, idempotency_key
         FROM shares
         WHERE id = ? AND bill_id = ?`,
    )
      .bind(shareId, billId)
      .first<{
        id: number
        member_id: number
        amount_cents: number
        paid_at: string | null
        idempotency_key: string | null
      }>()

  let share = await getShare()

  if (!share) {
    return c.json({ error: 'Share not found' }, 404)
  }

  if (share.paid_at) {
    if (share.idempotency_key === idempotencyKey) {
      return c.json({
        id: String(share.id),
        memberId: String(share.member_id),
        amountCents: share.amount_cents,
        paidAt: share.paid_at,
      })
    }

    return c.json({ error: 'Share has already been paid' }, 409)
  }

  const paidAt = new Date().toISOString()

  // Only one concurrent request can change an unpaid share.
  await c.env.DB.prepare(
    `UPDATE shares
       SET paid_at = ?, idempotency_key = ?
       WHERE id = ? AND bill_id = ? AND paid_at IS NULL`,
  )
    .bind(paidAt, idempotencyKey, shareId, billId)
    .run()

  // Read the final state, including if another request won the race.
  share = await getShare()

  if (!share) {
    return c.json({ error: 'Share not found' }, 404)
  }

  if (share.idempotency_key !== idempotencyKey) {
    return c.json({ error: 'Share has already been paid' }, 409)
  }

  return c.json({
    id: String(share.id),
    memberId: String(share.member_id),
    amountCents: share.amount_cents,
    paidAt: share.paid_at,
  })
})

// Get outstanding balances for a home
app.get('/api/homes/:homeId/balances', async (c) => {
  const homeId = Number(c.req.param('homeId'))

  if (!Number.isSafeInteger(homeId) || homeId <= 0) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const { results } = await c.env.DB.prepare(
    `SELECT
         m.id AS member_id,
         m.name AS name,
         COALESCE(SUM(
           CASE
             WHEN b.id IS NOT NULL THEN s.amount_cents
             ELSE 0
           END
         ), 0) AS outstanding_cents
       FROM members m
       LEFT JOIN shares s
         ON s.member_id = m.id AND s.paid_at IS NULL
       LEFT JOIN bills b
         ON b.id = s.bill_id AND b.home_id = m.home_id
       WHERE m.home_id = ?
       GROUP BY m.id, m.name
       ORDER BY m.id ASC`,
  )
    .bind(homeId)
    .all<{
      member_id: number
      name: string
      outstanding_cents: number
    }>()

  return c.json({
    balances: results.map((row) => ({
      memberId: String(row.member_id),
      name: row.name,
      outstandingCents: row.outstanding_cents,
    })),
  })
})
export default app
