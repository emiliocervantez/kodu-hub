import { describe, expect, it } from 'vitest'
import { dayLabel, describeWeather } from './weather'

describe('dayLabel', () => {
  it('names today and tomorrow, then weekdays', () => {
    expect(dayLabel('2026-09-30', 0)[0]).toBe('Сегодня')
    expect(dayLabel('2026-10-01', 1)[0]).toBe('Завтра')
    expect(dayLabel('2026-10-03', 3)[0]).toBe('Суббота')
  })

  it('formats the date in Russian without shifting the day', () => {
    expect(dayLabel('2026-10-01', 1)[1]).toMatch(/^1 окт/)
  })
})

describe('describeWeather', () => {
  it('maps WMO codes to Russian labels', () => {
    expect(describeWeather(0)[0]).toBe('Ясно')
    expect(describeWeather(63)[0]).toBe('Дождь')
    expect(describeWeather(73)[0]).toBe('Снег')
    expect(describeWeather(95)[0]).toBe('Гроза')
  })

  it('falls back for unknown codes', () => {
    expect(describeWeather(42)[0]).toBe('—')
  })
})
