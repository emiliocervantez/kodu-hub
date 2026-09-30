// Tallinn SIRI stop departures: https://transport.tallinn.ee/siri-stop-departures.php?stopid=<id>
// Header: Transport,RouteNum,ExpectedTimeInSeconds,ScheduleTimeInSeconds,<nowSecondsSinceMidnight>,version...
// Rows:   <transport>,<route>,<expectedSec>,<scheduledSec>,<destination>,...  (times = seconds since local midnight)
// Other lines (e.g. "stop,1234") are ignored.

export interface SiriDeparture {
  transport: string
  route: string
  /** Seconds from the feed's "now" until expected departure. */
  inSec: number
  destination: string
}

export interface SiriResult {
  departures: SiriDeparture[]
}

const DAY = 86400

export function parseSiri(text: string): SiriResult {
  const lines = text.trim().split(/\r?\n/)
  const nowSec = Number(lines[0]?.split(',')[4])
  if (!Number.isFinite(nowSec)) throw new Error('SIRI: unexpected header')

  const departures: SiriDeparture[] = []
  for (const line of lines.slice(1)) {
    const [transport, route, expected, , destination = ''] = line.split(',')
    const expectedSec = Number(expected)
    if (!route || !Number.isFinite(expectedSec) || expected === '') continue
    let inSec = expectedSec - nowSec
    if (inSec < -DAY / 2) inSec += DAY // departure after midnight
    departures.push({ transport: transport.toLowerCase(), route, inSec, destination })
  }
  return { departures }
}

/** Peatus names trams "T1"; SIRI may use "1". */
export function sameRoute(siriRoute: string, routeName: string): boolean {
  return siriRoute === routeName || `T${siriRoute}` === routeName
}

export async function fetchSiri(siriId: string): Promise<SiriResult> {
  const res = await fetch(`https://transport.tallinn.ee/siri-stop-departures.php?stopid=${siriId}`)
  if (!res.ok) throw new Error(`SIRI: HTTP ${res.status}`)
  return parseSiri(await res.text())
}
