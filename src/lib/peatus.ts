// Peatus.ee OpenTripPlanner GraphQL — used only by settings to build a Watch.
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
  stops: { name: string; siriId: string | undefined }[]
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
    route: { patterns: { headsign: string; stops: { name: string; code: string }[] }[] }
  }>(`{ route(id:"${routeId}"){ patterns{ headsign stops{ name code } } } }`)
  // A route has several patterns per direction (short turns etc.); keep the first per headsign.
  const byHeadsign = new Map<string, Direction>()
  for (const p of data.route.patterns) {
    if (byHeadsign.has(p.headsign)) continue
    byHeadsign.set(p.headsign, {
      headsign: p.headsign,
      stops: p.stops.map((s) => ({ name: s.name, siriId: (siriIds as Record<string, string>)[s.code] })),
    })
  }
  return [...byHeadsign.values()]
}
