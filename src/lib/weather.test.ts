import { describe, expect, it } from 'vitest'
import { describeWeather } from './weather'

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
