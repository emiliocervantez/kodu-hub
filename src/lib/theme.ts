import { displayTimeZone, type Theme } from './settings'

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Wall-clock minutes since midnight in the display zone. */
function displayMinutes(now: Date): number {
  const [h, m] = now
    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: displayTimeZone() })
    .split(':')
    .map(Number)
  return h * 60 + m
}

/** Light from `lightFrom` until `darkFrom` (display zone, may span midnight), dark otherwise. */
export function scheduledTheme(now: Date, lightFrom: string, darkFrom: string): Theme {
  const t = displayMinutes(now)
  const light = minutesOfDay(lightFrom)
  const dark = minutesOfDay(darkFrom)
  const isLight = light <= dark ? t >= light && t < dark : t >= light || t < dark
  return isLight ? 'light' : 'dark'
}
