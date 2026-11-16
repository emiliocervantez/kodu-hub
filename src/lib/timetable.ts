import type { Watch } from './settings'

/** What the timetable popup needs: a saved Watch, or a one-off search result. */
export type TimetableTarget = Pick<Watch, 'route' | 'kind' | 'headsign' | 'stopName' | 'stopId'>

const TZ = 'Europe/Tallinn'

/** Tallinn calendar date `daysAhead` days from `now` as "YYYYMMDD", plus its weekday (0 = Sunday). */
function tallinnDate(now: Date, daysAhead: number): { date: string; weekday: number } {
  // Noon avoids DST edges when stepping whole days.
  const [y, m, d] = now.toLocaleDateString('en-CA', { timeZone: TZ }).split('-').map(Number)
  const day = new Date(Date.UTC(y, m - 1, d + daysAhead, 12))
  const iso = day.toISOString().slice(0, 10)
  return { date: iso.replaceAll('-', ''), weekday: day.getUTCDay() }
}

function nextDate(now: Date, matches: (weekday: number) => boolean): string {
  for (let i = 0; ; i++) {
    const { date, weekday } = tallinnDate(now, i)
    if (matches(weekday)) return date
  }
}

/** Service dates to show: the nearest workday, Saturday and Sunday (today counts). */
export function serviceDates(now: Date) {
  return {
    workday: nextDate(now, (d) => d >= 1 && d <= 5),
    saturday: nextDate(now, (d) => d === 6),
    sunday: nextDate(now, (d) => d === 0),
  }
}

/** Seconds to add to Tallinn wall time of `serviceDate` ("YYYYMMDD") to get device wall time. */
export function deviceShiftSec(serviceDate: string): number {
  const noon = new Date(
    Date.UTC(+serviceDate.slice(0, 4), +serviceDate.slice(4, 6) - 1, +serviceDate.slice(6, 8), 12),
  )
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(noon)
    .find((p) => p.type === 'timeZoneName')!.value // "GMT+03:00"
  const [, sign, h, m] = name.match(/([+-])(\d\d):(\d\d)/)!
  const tallinnMin = (sign === '-' ? -1 : 1) * (+h * 60 + +m)
  return (-noon.getTimezoneOffset() - tallinnMin) * 60
}

export interface HourRow {
  hour: string
  minutes: string[]
}

/**
 * Groups ascending departure times (seconds since the service day's midnight; may exceed
 * 24 h for after-midnight trips) into hour rows, keeping service-day order.
 * `shiftSec` moves them from Tallinn to device time (see `deviceShiftSec`).
 */
export function groupByHour(seconds: number[], shiftSec = 0): HourRow[] {
  const rows: HourRow[] = []
  for (const t of seconds) {
    const s = t + shiftSec
    const hour = String(((Math.floor(s / 3600) % 24) + 24) % 24).padStart(2, '0')
    const minute = String(Math.floor((((s % 3600) + 3600) % 3600) / 60)).padStart(2, '0')
    const last = rows[rows.length - 1]
    if (last?.hour === hour) last.minutes.push(minute)
    else rows.push({ hour, minutes: [minute] })
  }
  return rows
}
