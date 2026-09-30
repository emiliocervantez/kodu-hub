import { describe, expect, it } from 'vitest'
import { formatDeparture, reachableMinutes } from './departures'
import type { SiriDeparture } from './siri'

const dep = (route: string, inMin: number): SiriDeparture => ({
  transport: 'bus',
  route,
  inSec: inMin * 60,
  destination: '',
})

describe('reachableMinutes', () => {
  const deps = [dep('5', 12), dep('5', 3), dep('8', 4), dep('5', 20), dep('5', 30), dep('5', 45)]

  it('keeps only the route, at least walk time away, next 3', () => {
    expect(reachableMinutes(deps, '5', 5, 0)).toEqual([12, 20, 30])
  })

  it('counts down with elapsed time since the fetch', () => {
    expect(reachableMinutes(deps, '5', 5, 120)).toEqual([10, 18, 28])
  })

  it('returns nothing when no departure is reachable', () => {
    expect(reachableMinutes(deps, '8', 5, 0)).toEqual([])
  })
})

describe('formatDeparture', () => {
  const now = new Date('2026-09-30T06:00:00Z') // 09:00 in Tallinn

  it('shows minutes up to an hour', () => {
    expect(formatDeparture(4.9, now)).toBe('4 мин')
    expect(formatDeparture(60, now)).toBe('60 мин')
  })

  it('shows Tallinn clock time beyond an hour', () => {
    expect(formatDeparture(75, now)).toBe('10:15')
  })
})
