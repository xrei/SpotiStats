import type {PeakWindow} from '../types'
import {calculateMean, calculateStdDev} from './statistics'
import {createPeakWindow, type WindowData} from './windows'

export function detectOutlierPeaks(
  windows: Map<string, WindowData>,
  threshold = 1.5,
): PeakWindow[] {
  if (windows.size === 0) return []

  if (windows.size === 1) {
    const [key, data] = Array.from(windows)[0]
    return [createPeakWindow(key, data.plays, Infinity, guessKind(key), data.ms)]
  }

  const values = Array.from(windows.values()).map((d) => d.plays)
  const mean = calculateMean(values)
  const stdDev = calculateStdDev(values, mean)

  if (stdDev === 0) {
    const sorted = Array.from(windows.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    const [key, data] = sorted[0]
    return [createPeakWindow(key, data.plays, 1.0, guessKind(key), data.ms)]
  }

  const cutoff = mean + threshold * stdDev
  const peaks: PeakWindow[] = []

  for (const [key, data] of windows) {
    if (data.plays > cutoff) {
      const significance = (data.plays - mean) / stdDev
      peaks.push(createPeakWindow(key, data.plays, significance, guessKind(key), data.ms))
    }
  }

  return peaks.sort((a, b) => b.plays - a.plays)
}

function guessKind(key: string): 'week' | 'month' {
  return key.length === 10 ? 'week' : 'month'
}
