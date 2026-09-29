// Open-Meteo, no key: https://open-meteo.com/en/docs

export interface Weather {
  temperature: number
  feelsLike: number
  code: number
  /** Temperature (°C), precipitation (mm) and probability (%) for each of the next 12 hours. */
  nextHours: { time: string; temperature: number; mm: number; probability: number }[]
}

export async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,weather_code' +
    // Hourly data starts at the current (already begun) hour; fetch 13 and drop it.
    '&hourly=temperature_2m,precipitation,precipitation_probability&forecast_hours=13&timezone=Europe%2FTallinn'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo: HTTP ${res.status}`)
  const j = await res.json()
  return {
    temperature: j.current.temperature_2m,
    feelsLike: j.current.apparent_temperature,
    code: j.current.weather_code,
    nextHours: j.hourly.time
      .map((time: string, i: number) => ({
        time: time.slice(11, 16),
        temperature: j.hourly.temperature_2m[i],
        mm: j.hourly.precipitation[i],
        probability: j.hourly.precipitation_probability[i],
      }))
      .slice(1),
  }
}

/** WMO weather code → [Russian label, icon]. */
export function describeWeather(code: number): [string, string] {
  if (code === 0) return ['Ясно', '☀️']
  if (code === 1) return ['Преимущественно ясно', '🌤️']
  if (code === 2) return ['Переменная облачность', '⛅']
  if (code === 3) return ['Пасмурно', '☁️']
  if (code === 45 || code === 48) return ['Туман', '🌫️']
  if (code >= 51 && code <= 57) return ['Морось', '🌦️']
  if (code >= 61 && code <= 67) return ['Дождь', '🌧️']
  if (code >= 71 && code <= 77) return ['Снег', '🌨️']
  if (code >= 80 && code <= 82) return ['Ливень', '🌧️']
  if (code === 85 || code === 86) return ['Снегопад', '🌨️']
  if (code >= 95) return ['Гроза', '⛈️']
  return ['—', '❔']
}
