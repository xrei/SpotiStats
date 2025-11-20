import type {TimeRange} from '@/shared/ui/TimeRangeControl'
import type {TimeIndex, CountAgg, Granularity, MergedAgg} from '../types'
import {buildKeys, chooseGranularity, getRange} from '../lib/range'

const groupSource = (
  src: Map<string, Map<string, CountAgg>>,
  orderedKeys: string[],
): Map<string, MergedAgg> => {
  const out = new Map<string, MergedAgg>()
  for (const key of orderedKeys) {
    const bucket = src.get(key)
    if (!bucket) continue

    for (const [id, agg] of bucket) {
      const current = out.get(id)
      if (current) {
        current.ms += agg.ms
        current.plays += agg.plays
        current.lastKey = key
      } else {
        out.set(id, {ms: agg.ms, plays: agg.plays, firstKey: key, lastKey: key})
      }
    }
  }
  return out
}

export type OrderBy = {by?: unknown; order: 'asc' | 'desc'}

export type SelectContext<Data> = {
  from: TimeIndex
  join: Data
  where: {search: string; timeRange: TimeRange; sort: OrderBy}
}

export type SelectSchema<Data, Row> = {
  from: (ix: TimeIndex, granularity: Granularity) => Map<string, Map<string, CountAgg>>
  project: (
    id: string,
    data: Data,
    agg: MergedAgg,
    granularity: Granularity,
  ) => Row | null
  whereText?: (row: Row) => string
  order?: (rows: Row[], order: OrderBy) => void
}

export const createSelect = <Data, Row>(schema: SelectSchema<Data, Row>) => {
  const select = (ctx: SelectContext<Data>): Row[] => {
    const {join: base, from: timeIndex, where: filters} = ctx
    if (!timeIndex) return []

    const {fromDay, toDay} = getRange(filters.timeRange, timeIndex)
    if (!fromDay || !toDay || fromDay > toDay) return []

    const gran = chooseGranularity(fromDay, toDay)
    const keys = buildKeys(gran, fromDay, toDay)
    const src = schema.from(timeIndex, gran)
    const merged = groupSource(src, keys)

    const q = filters.search.trim().toLowerCase()
    const rows: Row[] = []

    for (const [id, agg] of merged) {
      const row = schema.project(id, base, agg, gran)
      if (!row) continue

      if (q) {
        const text = (schema.whereText?.(row) ?? id).toLowerCase()
        if (!text.includes(q)) continue
      }

      rows.push(row)
    }

    schema.order?.(rows, filters.sort)

    return rows
  }

  return {select}
}
