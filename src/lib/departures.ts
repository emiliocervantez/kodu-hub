import { sameRoute, type SiriDeparture } from './siri'

export const SHOWN_DEPARTURES = 3

/** Minutes until each Reachable Departure of a route, soonest first. */
export function reachableMinutes(
  departures: SiriDeparture[],
  route: string,
  walkMin: number,
  elapsedSec: number,
): number[] {
  return departures
    .filter((d) => sameRoute(d.route, route))
    .map((d) => (d.inSec - elapsedSec) / 60)
    .filter((min) => min >= walkMin)
    .sort((a, b) => a - b)
    .slice(0, SHOWN_DEPARTURES)
}

/** "N мин", or clock time (HH:MM, Tallinn) when more than an hour away. */
export function formatDeparture(minutes: number, now: Date): string {
  if (minutes > 60) {
    return new Date(now.getTime() + minutes * 60_000).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Tallinn',
    })
  }
  return `${Math.floor(minutes)} мин`
}
