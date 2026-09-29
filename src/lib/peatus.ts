// Peatus.ee OpenTripPlanner GraphQL — used by settings to build a Watch and for full timetables.
import siriIds from '../data/siriIds.json'

const URL = 'https://api.peatus.ee/routing/v1/routers/estonia/index/graphql'
const TALLINN_AGENCY = 'estonia:tallinn_10312960'

export type VehicleKind = 'bus' | 'trol' | 'tram'

export interface Route {
  id: string
  name: string
  kind: VehicleKind
}

export interface Direction {
  headsign: string
  stops: { id: string; name: string; siriId: string | undefined }[]
}

async function query<T>(q: string): Promise<T> {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: q }),
  })
  if (!res.ok) throw new Error(`Peatus: HTTP ${res.status}`)
  const j = await res.json()
  if (j.errors) throw new Error(`Peatus: ${j.errors[0].message}`)
  return j.data
}

// Peatus reports trolleybuses as mode BUS; the id ("tallinna-lin_trol_83") tells them apart.
function kindOf(id: string): VehicleKind {
  if (id.includes('_tram_')) return 'tram'
  if (id.includes('_trol_')) return 'trol'
  return 'bus'
}

export async function fetchRoutes(): Promise<Route[]> {
  const data = await query<{ agency: { routes: { gtfsId: string; shortName: string }[] } }>(
    `{ agency(id:"${TALLINN_AGENCY}"){ routes{ gtfsId shortName } } }`,
  )
  return data.agency.routes
    .map((r) => ({ id: r.gtfsId, name: r.shortName, kind: kindOf(r.gtfsId) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'et', { numeric: true }))
}

export async function fetchDirections(routeId: string): Promise<Direction[]> {
  const data = await query<{
    route: { patterns: { headsign: string; stops: { gtfsId: string; name: string; code: string }[] }[] }
  }>(`{ route(id:"${routeId}"){ patterns{ headsign stops{ gtfsId name code } } } }`)
  // A route has several patterns per direction (short turns etc.); keep the first per headsign.
  const byHeadsign = new Map<string, Direction>()
  for (const p of data.route.patterns) {
    if (byHeadsign.has(p.headsign)) continue
    byHeadsign.set(p.headsign, {
      headsign: p.headsign,
      stops: p.stops.map((s) => ({
        id: s.gtfsId,
        name: s.name,
        siriId: (siriIds as Record<string, string>)[s.code],
      })),
    })
  }
  return [...byHeadsign.values()]
}

/** Scheduled departures (seconds since the service day's midnight, ascending) of a route at a stop on `date` (YYYYMMDD). */
export async function fetchStopTimes(stopId: string, routeName: string, date: string): Promise<number[]> {
  const data = await query<{
    stop: {
      stoptimesForServiceDate: {
        pattern: { route: { shortName: string } }
        stoptimes: { scheduledDeparture: number; pickupType: string }[]
      }[]
    }
  }>(
    `{ stop(id:"${stopId}"){ stoptimesForServiceDate(date:"${date}"){ pattern{ route{ shortName } } stoptimes{ scheduledDeparture pickupType } } } }`,
  )
  return data.stop.stoptimesForServiceDate
    .filter((g) => g.pattern.route.shortName === routeName)
    .flatMap((g) => g.stoptimes.filter((s) => s.pickupType !== 'NONE').map((s) => s.scheduledDeparture))
    .sort((a, b) => a - b)
}

/** Peatus stop id for Watches saved before it was stored: found via route → direction → stop name. */
export async function findStopId(route: string, kind: VehicleKind, headsign: string, stopName: string) {
  const r = (await fetchRoutes()).find((x) => x.name === route && x.kind === kind)
  if (!r) return undefined
  const d = (await fetchDirections(r.id)).find((x) => x.headsign === headsign)
  return d?.stops.find((s) => s.name === stopName)?.id
}
