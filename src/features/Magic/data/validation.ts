import type {StreamingEntry} from './entry'

export type ValidationResult = {
  valid: StreamingEntry[]
  invalid: number
}

export function validateEntry(entry: unknown): entry is StreamingEntry {
  if (!entry || typeof entry !== 'object') return false
  const e = entry as Record<string, unknown>

  // Basic sanity check - just verify it has the core fields
  return typeof e.ts === 'string' && typeof e.ms_played === 'number' && e.ms_played >= 0
}

export function validateBatch(entries: unknown[]): ValidationResult {
  const valid: StreamingEntry[] = []
  let invalid = 0

  for (const entry of entries) {
    if (validateEntry(entry)) {
      valid.push(entry)
    } else {
      invalid++
    }
  }

  return {valid, invalid}
}

export function isValidJSON(content: string): boolean {
  try {
    JSON.parse(content)
    return true
  } catch {
    return false
  }
}
