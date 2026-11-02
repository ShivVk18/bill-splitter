import type { Context } from 'hono'
import { parseId } from '../lib/params'
import type { AppEnv } from '../types'

type ShareRow = {
  id: number
  member_id: number
  amount_cents: number
  paid_at: string | null
  idempotency_key: string | null
}

function toShareResponse(share: ShareRow) {
  return {
    id: String(share.id),
    memberId: String(share.member_id),
    amountCents: share.amount_cents,
    paidAt: share.paid_at,
  }
}

// Pay a share
export async function payShare(c: Context<AppEnv>) {
  const billId = parseId(c.req.param('billId'))
  const shareId = parseId(c.req.param('shareId'))
  const idempotencyKey = c.req.header('Idempotency-Key')

  if (!idempotencyKey?.trim()) {
    return c.json({ error: 'Idempotency-Key header is required' }, 400)
  }

  if (billId === null || shareId === null) {
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
      .first<ShareRow>()

  let share = await getShare()

  if (!share) {
    return c.json({ error: 'Share not found' }, 404)
  }

  if (share.paid_at) {
    if (share.idempotency_key === idempotencyKey) {
      return c.json(toShareResponse(share))
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

  return c.json(toShareResponse(share))
}
