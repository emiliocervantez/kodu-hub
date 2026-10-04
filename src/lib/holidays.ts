// Estonian public holidays (riigipühad), per the Holidays and Days of National Importance Act.

/** Gregorian Easter Sunday (anonymous Gregorian algorithm) as [month 1–12, day]. */
export function easter(year: number): [number, number] {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return [month, day]
}

function key(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** "YYYY-MM-DD" → Russian holiday name, for one year. */
export function holidays(year: number): Map<string, string> {
  const [em, ed] = easter(year)
  const fromEaster = (days: number) => {
    const d = new Date(Date.UTC(year, em - 1, ed + days))
    return key(year, d.getUTCMonth() + 1, d.getUTCDate())
  }
  return new Map([
    [key(year, 1, 1), 'Новый год'],
    [key(year, 2, 24), 'День независимости'],
    [fromEaster(-2), 'Страстная пятница'],
    [fromEaster(0), 'Пасха'],
    [key(year, 5, 1), 'Праздник весны'],
    [fromEaster(49), 'Троица'],
    [key(year, 6, 23), 'День победы'],
    [key(year, 6, 24), 'Иванов день'],
    [key(year, 8, 20), 'День восстановления независимости'],
    [key(year, 12, 24), 'Сочельник'],
    [key(year, 12, 25), 'Рождество'],
    [key(year, 12, 26), 'Второй день Рождества'],
  ])
}

/** Holiday name for a date given as year, month 1–12, day — or undefined. */
export function holidayOn(year: number, month: number, day: number): string | undefined {
  return holidays(year).get(key(year, month, day))
}
