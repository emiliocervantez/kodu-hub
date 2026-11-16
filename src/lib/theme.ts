import type { Theme } from './settings'

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Light from `lightFrom` until `darkFrom` (device time, may span midnight), dark otherwise. */
export function scheduledTheme(now: Date, lightFrom: string, darkFrom: string): Theme {
  const t = now.getHours() * 60 + now.getMinutes()
  const light = minutesOfDay(lightFrom)
  const dark = minutesOfDay(darkFrom)
  const isLight = light <= dark ? t >= light && t < dark : t >= light || t < dark
  return isLight ? 'light' : 'dark'
}
