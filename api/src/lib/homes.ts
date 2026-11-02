export async function homeExists(db: D1Database, homeId: number) {
  const home = await db.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()
  return home !== null
}
