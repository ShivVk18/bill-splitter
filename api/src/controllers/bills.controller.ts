import type { Context } from 'hono'
import { homeExists } from '../lib/homes'
import { parseId } from '../lib/params'
import type { AppEnv } from '../types'

// Create a bill and split it equally among home members
export async function createBill(c: Context<AppEnv>) {
  const homeId = parseId(c.req.param('homeId'))

  if (homeId === null || !(await homeExists(c.env.DB, homeId))) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const { title, totalCents } = await c.req.json<{
    title?: unknown
    totalCents?: unknown
  }>()

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
}
