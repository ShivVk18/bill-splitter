import type { Context } from 'hono'
import type { AppEnv } from '../types'

export function getHealth(c: Context<AppEnv>) {
  return c.json({ status: 'ok' })
}
