import type {TimeIndex, EntityType} from '@/features/Magic'
import type {PeakWindow} from '../types'
import {dateLib} from '@/shared/lib'

export type WindowData = {plays: number; ms: number}

export function buildWeekWindows(
  timeIndex: TimeIndex,
  entityId: string,
  entityType: EntityType,
): Map<string, WindowData> {
  const sourceKey = `${entityType}sByDay` as const
  const source = timeIndex[sourceKey]
  const weeks = new Map<string, WindowData>()

  for (const [day, bucket] of source) {
    const agg = bucket.get(entityId)
    if (!agg) continue

    const weekKey = dateLib.startOfWeek(day, 1)
    const existing = weeks.get(weekKey) ?? {plays: 0, ms: 0}
    weeks.set(weekKey, {
      plays: existing.plays + agg.plays,
      ms: existing.ms + agg.ms,
    })
  }

  return weeks
}

export function buildMonthWindows(
  timeIndex: TimeIndex,
  entityId: string,
  entityType: EntityType,
): Map<string, WindowData> {
  const sourceKey = `${entityType}sByMonth` as const
  const source = timeIndex[sourceKey]
  const months = new Map<string, WindowData>()

  for (const [month, bucket] of source) {
    const agg = bucket.get(entityId)
    if (agg) {
      months.set(month, {plays: agg.plays, ms: agg.ms})
    }
  }

  return months
}

export function createPeakWindow(
  key: string,
  plays: number,
  significance: number,
  kind: 'week' | 'month',
  ms?: number,
): PeakWindow {
  if (kind === 'week') {
    const startDate = dateLib.parseYMD(key)
    const endDate = dateLib.addDays(startDate, 6)
    const endYmd = dateLib.fmtYMD(endDate)
    const label = dateLib.formatWeekRange(key, endYmd)

    return {
      kind,
      start: key,
      end: endYmd,
      plays,
      hours: ms ? ms / (1000 * 60 * 60) : 0,
      significance,
      label,
    }
  } else {
    const startYmd = `${key}-01`
    const startDate = dateLib.parseYMD(startYmd)

    const nextMonth = dateLib.addMonths(startDate, 1)
    const lastDayOfMonth = dateLib.addDays(nextMonth, -1)
    const endYmd = dateLib.fmtYMD(lastDayOfMonth)

    const label = dateLib.formatMonthKey(key)

    return {
      kind,
      start: startYmd,
      end: endYmd,
      plays,
      hours: ms ? ms / (1000 * 60 * 60) : 0,
      significance,
      label,
    }
  }
}
