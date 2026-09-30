import { describe, expect, it } from 'vitest'
import { groupByHour, serviceDates } from './timetable'

describe('serviceDates', () => {
  it('uses today when it matches', () => {
    // Wednesday 30 Sep 2026, 10:00 Tallinn
    expect(serviceDates(new Date('2026-09-30T07:00:00Z'))).toEqual({
      workday: '20260930',
      saturday: '20261003',
      sunday: '20261004',
    })
  })

  it('moves the workday to Monday at the weekend', () => {
    // Saturday 3 Oct 2026
    expect(serviceDates(new Date('2026-10-03T07:00:00Z'))).toEqual({
      workday: '20261005',
      saturday: '20261003',
      sunday: '20261004',
    })
  })

  it('uses the Tallinn date, not UTC', () => {
    // 23:30 UTC Friday = 02:30 Saturday in Tallinn
    expect(serviceDates(new Date('2026-10-02T23:30:00Z')).saturday).toBe('20261003')
  })
})

describe('groupByHour', () => {
  it('groups minutes by hour in order', () => {
    const t = (h: number, m: number) => h * 3600 + m * 60
    expect(groupByHour([t(5, 0), t(5, 40), t(6, 0), t(6, 20)])).toEqual([
      { hour: '05', minutes: ['00', '40'] },
      { hour: '06', minutes: ['00', '20'] },
    ])
  })

  it('puts after-midnight trips last as hour 00', () => {
    const rows = groupByHour([23 * 3600 + 45 * 60, 24 * 3600 + 5 * 60])
    expect(rows).toEqual([
      { hour: '23', minutes: ['45'] },
      { hour: '00', minutes: ['05'] },
    ])
  })
})
