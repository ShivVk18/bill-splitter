// Parses a route id. Returns null when it is not a positive integer.
export function parseId(value: string | undefined): number | null {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}
