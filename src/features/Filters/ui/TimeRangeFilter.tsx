import {TimeRangeControl, type TimeRangeControlProps} from '@/shared/ui'
import type {FiltersModel} from '../model'
import {useUnit} from 'effector-solid'

export type TimeRangeFilterProps<Sort extends string> = TimeRangeControlProps & {
  model: FiltersModel<Sort>
}

export const TimeRangeFilter = <Sort extends string>({model, ...p}: TimeRangeFilterProps<Sort>) => {
  const {$timeRange, timeRangeChanged} = useUnit(model.TimeRange)

  return <TimeRangeControl value={$timeRange} onChange={timeRangeChanged} {...p} />
}
