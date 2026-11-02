import type { Context } from 'hono'
import { homeExists } from '../lib/homes'
import { parseId } from '../lib/params'
import type { AppEnv } from '../types'

// Get outstanding balances for a home
export async function getBalances(c: Context<AppEnv>) {
  const homeId = parseId(c.req.param('homeId'))

  if (homeId === null || !(await homeExists(c.env.DB, homeId))) {
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
}
