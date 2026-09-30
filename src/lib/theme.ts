import type { Theme } from './settings'

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Tallinn wall-clock minutes since midnight. */
function tallinnMinutes(now: Date): number {
  const [h, m] = now
    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Tallinn' })
    .split(':')
    .map(Number)
  return h * 60 + m
}

/** Light from `lightFrom` until `darkFrom` (Tallinn time, may span midnight), dark otherwise. */
export function scheduledTheme(now: Date, lightFrom: string, darkFrom: string): Theme {
  const t = tallinnMinutes(now)
  const light = minutesOfDay(lightFrom)
  const dark = minutesOfDay(darkFrom)
  const isLight = light <= dark ? t >= light && t < dark : t >= light || t < dark
  return isLight ? 'light' : 'dark'
}
