import type {TimeRange} from '@/shared/ui'
import type {TimeIndex, Granularity} from '../types'
import {dateLib} from '@/shared/lib/date'

export const GRAN_DAY = 'day' as const
export const GRAN_MONTH = 'month' as const
export const DEFAULT_DAYS = 92

export const chooseGranularity = (fromDay: string, toDay: string): Granularity =>
  dateLib.diffDays(dateLib.parseYMD(fromDay), dateLib.parseYMD(toDay)) <= DEFAULT_DAYS
    ? GRAN_DAY
    : GRAN_MONTH

export const getRange = (
  range: TimeRange,
  ix: TimeIndex,
): {fromDay: string | null; toDay: string | null} => {
  const min = ix.minDay,
    max = ix.maxDay
  if (!min || !max) return {fromDay: null, toDay: null}

  if (range.kind === 'range') {
    const fromDay = dateLib.clampDay(range.from.slice(0, 10), min, max)
    const toDay = dateLib.clampDay(range.to.slice(0, 10), min, max)
    return {fromDay, toDay}
  }

  const end = dateLib.parseYMD(max)
  const startMap = {
    All: () => dateLib.parseYMD(min),
    '1M': () => dateLib.addMonths(end, -1),
    '3M': () => dateLib.addMonths(end, -3),
    '6M': () => dateLib.addMonths(end, -6),
    '1Y': () => dateLib.addYears(end, -1),
  } as const
  const start = (startMap[range.value] ?? startMap['All'])()

  return {
    fromDay: dateLib.clampDay(dateLib.fmtYMD(start), min, max),
    toDay: dateLib.clampDay(dateLib.fmtYMD(end), min, max),
  }
}

export const buildKeys = (granularity: Granularity, fromDay: string, toDay: string): string[] =>
  granularity === 'day'
    ? dateLib.buildDayKeys(fromDay, toDay)
    : dateLib.buildMonthKeys(dateLib.ym(fromDay), dateLib.ym(toDay))
