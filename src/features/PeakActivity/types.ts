import type {PeakActivityModel} from './model'

export type PeakWindow = {
  kind: 'week' | 'month'
  start: string
  end: string
  plays: number
  hours: number
  significance: number
  label: string
}

export type PeakActivity = {
  primary: PeakWindow | null
  secondary: PeakWindow[]
  timeline: Array<{date: string; plays: number}>
}

export type PeakActivityWidgetProps = {
  model: PeakActivityModel
  className?: string
}
