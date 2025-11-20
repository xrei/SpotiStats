import {createStore, createEvent, combine} from 'effector'
import {historyModel, getEntityId, type EntityType, type Entity} from '@/features/Magic'
import type {PeakActivity} from './types'
import {buildWeekWindows, buildMonthWindows} from './lib/windows'
import {detectOutlierPeaks} from './lib/strategies'

export const createPeakActivityModel = (entityType: EntityType) => {
  const entityChanged = createEvent<Entity | null>('entity changed')
  const $currentEntity = createStore<Entity | null>(null, {
    name: `${entityType} peak entity`,
  })

  $currentEntity.on(entityChanged, (_, entity) => entity)

  const $peakActivity = combine(
    $currentEntity,
    historyModel.$timeIndex,
    (entity, timeIndex): PeakActivity | null => {
      if (!entity || !timeIndex) {
        return null
      }

      const entityId = getEntityId(entity, entityType)
      if (!entityId) {
        return null
      }

      const weekWindows = buildWeekWindows(timeIndex, entityId, entityType)
      const monthWindows = buildMonthWindows(timeIndex, entityId, entityType)
      const allWindows = new Map([...weekWindows, ...monthWindows])

      if (allWindows.size === 0) {
        return null
      }

      const peaks = detectOutlierPeaks(allWindows, 1.5)

      const timeline = Array.from(weekWindows.entries())
        .filter(([_, data]) => data.plays >= 10)
        .map(([date, data]) => ({date, plays: data.plays}))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        primary: peaks[0] ?? null,
        secondary: peaks.slice(1),
        timeline,
      }
    },
  )

  return {
    entityChanged,
    $peakActivity,
  }
}

export type PeakActivityModel = ReturnType<typeof createPeakActivityModel>
