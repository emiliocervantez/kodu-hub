import { describe, expect, it } from 'vitest'
import { easter, holidayOn, holidays } from './holidays'

describe('easter', () => {
  it('matches known Easter Sundays', () => {
    expect(easter(2024)).toEqual([3, 31])
    expect(easter(2025)).toEqual([4, 20])
    expect(easter(2026)).toEqual([4, 5])
    expect(easter(2027)).toEqual([3, 28])
  })
})

describe('holidays', () => {
  it('has the 12 Estonian public holidays', () => {
    expect(holidays(2026).size).toBe(12)
  })

  it('places the Easter-based holidays', () => {
    expect(holidayOn(2026, 4, 3)).toBe('Страстная пятница')
    expect(holidayOn(2026, 4, 5)).toBe('Пасха')
    expect(holidayOn(2026, 5, 24)).toBe('Троица')
    // Good Friday falling in March
    expect(holidayOn(2027, 3, 26)).toBe('Страстная пятница')
  })

  it('places the fixed-date holidays', () => {
    expect(holidayOn(2026, 2, 24)).toBe('День независимости')
    expect(holidayOn(2026, 6, 23)).toBe('День победы')
    expect(holidayOn(2026, 8, 20)).toBe('День восстановления независимости')
    expect(holidayOn(2026, 12, 26)).toBe('Второй день Рождества')
    expect(holidayOn(2026, 10, 4)).toBeUndefined()
  })
})
