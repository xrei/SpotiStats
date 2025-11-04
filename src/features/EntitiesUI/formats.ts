import {dateLib} from '@/shared/lib'

const durationPad = (value: number) => String(value).padStart(2, '0')

export const formatEntityDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const secondsInDay = 86_400
  const secondsInHour = 3_600

  const days = Math.floor(totalSeconds / secondsInDay)
  const hours = Math.floor((totalSeconds % secondsInDay) / secondsInHour)
  const minutes = Math.floor((totalSeconds % secondsInHour) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    return `${days}d ${durationPad(hours)}:${durationPad(minutes)}:${durationPad(seconds)}`
  }

  if (hours > 0) {
    return `${hours}:${durationPad(minutes)}:${durationPad(seconds)}`
  }

  return `${durationPad(minutes)}:${durationPad(seconds)}`
}

export const formatEntityLastPlayed = (isoString: string | null): string => {
  const formatted = dateLib.formatDate(isoString, 'short')
  if (!formatted) return 'No recent plays'
  return `Last played ${formatted}`
}
