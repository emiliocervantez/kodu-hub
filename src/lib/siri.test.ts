import { describe, expect, it } from 'vitest'
import { parseSiri, sameRoute } from './siri'

// Row shape is inferred (only the header was observed so far); see ADR 0001.
const SAMPLE = `Transport,RouteNum,ExpectedTimeInSeconds,ScheduleTimeInSeconds,36000,version20201024
stop,1234
bus,5,36300,36240,Metsakooli tee,0,Z
tram,1,36900,36900,Kopli,0,Z`

describe('parseSiri', () => {
  it('parses departures relative to the feed clock', () => {
    const { departures } = parseSiri(SAMPLE)
    expect(departures).toEqual([
      { transport: 'bus', route: '5', inSec: 300, destination: 'Metsakooli tee' },
      { transport: 'tram', route: '1', inSec: 900, destination: 'Kopli' },
    ])
  })

  it('handles a header-only (night) response', () => {
    const { departures } = parseSiri('Transport,RouteNum,ExpectedTimeInSeconds,ScheduleTimeInSeconds,3100,version20201024')
    expect(departures).toEqual([])
  })

  it('wraps departures past midnight', () => {
    const { departures } = parseSiri(`H,R,E,S,86100,v\nbus,5,120,120,X`)
    expect(departures[0].inSec).toBe(420)
  })

  it('rejects an unexpected header', () => {
    expect(() => parseSiri('<html>error</html>')).toThrow()
  })
})

describe('sameRoute', () => {
  it('matches trams named T1 in Peatus', () => {
    expect(sameRoute('1', 'T1')).toBe(true)
    expect(sameRoute('T1', 'T1')).toBe(true)
    expect(sameRoute('1', '10')).toBe(false)
  })
})
