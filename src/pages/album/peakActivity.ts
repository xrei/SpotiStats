import type {EnrichedAlbum, TimeIndex} from '@/features/Magic'
import {dateLib} from '@/shared/lib'

export type PeakActivity = {
  month: {key: string; plays: number} | null
  week: {start: string; end: string; plays: number} | null
}

const emptyPeak: PeakActivity = {month: null, week: null}

export const computePeakActivity = (
  album: EnrichedAlbum | null,
  ix: TimeIndex,
): PeakActivity => {
  if (!album) return emptyPeak

  const albumId = album.id

  let peakMonth: PeakActivity['month'] = null
  for (const [monthKey, bucket] of ix.albumsByMonth.entries()) {
    const agg = bucket.get(albumId)
    if (!agg) continue
    if (
      !peakMonth ||
      agg.plays > peakMonth.plays ||
      (agg.plays === peakMonth.plays && monthKey > peakMonth.key)
    ) {
      peakMonth = {key: monthKey, plays: agg.plays}
    }
  }

  const weeklyTotals = new Map<string, number>()
  for (const [dayKey, bucket] of ix.albumsByDay.entries()) {
    const agg = bucket.get(albumId)
    if (!agg) continue
    const startKey = dateLib.startOfWeek(dayKey)
    weeklyTotals.set(startKey, (weeklyTotals.get(startKey) ?? 0) + agg.plays)
  }

  let peakWeek: PeakActivity['week'] = null
  for (const [startKey, plays] of weeklyTotals.entries()) {
    if (
      !peakWeek ||
      plays > peakWeek.plays ||
      (plays === peakWeek.plays && startKey > peakWeek.start)
    ) {
      peakWeek = {start: startKey, end: dateLib.endOfWeek(startKey), plays}
    }
  }

  return {
    month: peakMonth,
    week: peakWeek,
  }
}
