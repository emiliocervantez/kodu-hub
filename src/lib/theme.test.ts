import { describe, expect, it } from 'vitest'
import { scheduledTheme } from './theme'

// Tallinn is UTC+3 on these dates (summer time).
const at = (hhmm: string) => new Date(`2026-09-30T${hhmm}:00+03:00`)

describe('scheduledTheme', () => {
  it('is light between lightFrom and darkFrom', () => {
    expect(scheduledTheme(at('06:59'), '07:00', '21:00')).toBe('dark')
    expect(scheduledTheme(at('07:00'), '07:00', '21:00')).toBe('light')
    expect(scheduledTheme(at('20:59'), '07:00', '21:00')).toBe('light')
    expect(scheduledTheme(at('21:00'), '07:00', '21:00')).toBe('dark')
  })

  it('handles a light period spanning midnight', () => {
    expect(scheduledTheme(at('23:00'), '22:00', '06:00')).toBe('light')
    expect(scheduledTheme(at('05:59'), '22:00', '06:00')).toBe('light')
    expect(scheduledTheme(at('12:00'), '22:00', '06:00')).toBe('dark')
  })

  it('uses Tallinn time regardless of the device zone', () => {
    // 04:30 UTC = 07:30 Tallinn
    expect(scheduledTheme(new Date('2026-09-30T04:30:00Z'), '07:00', '21:00')).toBe('light')
  })
})
