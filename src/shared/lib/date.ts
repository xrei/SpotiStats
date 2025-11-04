const parseYMD = (s: string): Date => {
  const y = +s.slice(0, 4),
    m = +s.slice(5, 7) - 1,
    d = +s.slice(8, 10)
  return new Date(Date.UTC(y, m, d))
}

const fmtYMD = (d: Date): string => {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d.getTime())
  x.setUTCDate(x.getUTCDate() + n)
  return x
}

const addMonths = (d: Date, n: number): Date => {
  const x = new Date(d.getTime())
  const m = x.getUTCMonth() + n
  x.setUTCMonth(m)
  if (x.getUTCMonth() !== ((m % 12) + 12) % 12) x.setUTCDate(0)
  return x
}

const addYears = (d: Date, n: number): Date => {
  const x = new Date(d.getTime())
  x.setUTCFullYear(x.getUTCFullYear() + n)
  return x
}

const diffDays = (a: Date, b: Date): number => Math.floor((b.getTime() - a.getTime()) / 86_400_000)

const ym = (day: string) => day.slice(0, 7)

const buildDayKeys = (fromDay: string, toDay: string): string[] => {
  const out: string[] = []
  let d = parseYMD(fromDay)
  const end = parseYMD(toDay)
  while (d <= end) {
    out.push(fmtYMD(d))
    d = addDays(d, 1)
  }
  return out
}

const buildMonthKeys = (fromYM: string, toYM: string): string[] => {
  const out: string[] = []
  let y = +fromYM.slice(0, 4),
    m = +fromYM.slice(5, 7)
  const ey = +toYM.slice(0, 4),
    em = +toYM.slice(5, 7)
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return out
}

const clampDay = (d: string, min: string, max: string) => (d < min ? min : d > max ? max : d)

const msToHMS = (ms: number) => {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`
}

const msToH = (ms: number) => {
  const h = ms / (1000 * 60 * 60)
  return h.toFixed(1)
}

const startOfWeek = (dayKey: string, weekStartsOn = 1): string => {
  const date = parseYMD(dayKey)
  const currentDow = date.getUTCDay()
  const offset = (currentDow - weekStartsOn + 7) % 7
  date.setUTCDate(date.getUTCDate() - offset)
  return fmtYMD(date)
}

const endOfWeek = (dayKey: string, weekStartsOn = 1): string => {
  const startKey = startOfWeek(dayKey, weekStartsOn)
  const date = parseYMD(startKey)
  date.setUTCDate(date.getUTCDate() + 6)
  return fmtYMD(date)
}

const parseMonthKey = (key: string): Date | null => {
  if (!/^\d{4}-\d{2}$/.test(key)) return null
  const year = Number(key.slice(0, 4))
  const month = Number(key.slice(5, 7)) - 1
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null
  const date = new Date(Date.UTC(year, month, 1))
  if (Number.isNaN(date.getTime())) return null
  return date
}

type DateStyle = NonNullable<Intl.DateTimeFormatOptions['dateStyle']>

const formatDate = (isoString: string | null, dateStyle: DateStyle = 'short'): string | null => {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null

  const formatter = new Intl.DateTimeFormat(undefined, {dateStyle})
  return formatter.format(date)
}

const formatMonthKey = (
  key: string,
  options: Intl.DateTimeFormatOptions = {month: 'long', year: 'numeric'},
): string => {
  const date = parseMonthKey(key)
  if (!date) return key
  const formatter = new Intl.DateTimeFormat(undefined, options)
  return formatter.format(date)
}

type WeekRangeFormatOptions = {
  start?: Intl.DateTimeFormatOptions
  end?: Intl.DateTimeFormatOptions
  sameYearStart?: Intl.DateTimeFormatOptions
}

const DEFAULT_WEEK_START: Intl.DateTimeFormatOptions = {month: 'short', day: 'numeric'}
const DEFAULT_WEEK_START_WITH_YEAR: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}
const DEFAULT_WEEK_END: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

const formatWeekRange = (
  startKey: string,
  endKey: string,
  options: WeekRangeFormatOptions = {},
): string => {
  const startDate = parseYMD(startKey)
  const endDate = parseYMD(endKey)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${startKey} – ${endKey}`
  }

  const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear()
  const startOptions = sameYear
    ? options.sameYearStart ?? options.start ?? DEFAULT_WEEK_START
    : options.start ?? DEFAULT_WEEK_START_WITH_YEAR
  const endOptions = options.end ?? DEFAULT_WEEK_END

  const startFormatter = new Intl.DateTimeFormat(undefined, startOptions)
  const endFormatter = new Intl.DateTimeFormat(undefined, endOptions)

  return `${startFormatter.format(startDate)} – ${endFormatter.format(endDate)}`
}

export const dateLib = {
  parseYMD,
  fmtYMD,
  addDays,
  addMonths,
  addYears,
  diffDays,
  ym,
  buildDayKeys,
  buildMonthKeys,
  clampDay,
  msToH,
  msToHMS,
  formatDate,
  formatMonthKey,
  formatWeekRange,
  startOfWeek,
  endOfWeek,
}
