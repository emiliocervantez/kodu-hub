import { reactive, watch } from 'vue'
import type { VehicleKind } from './peatus'

export const MAX_WATCHES = 6

export interface Watch {
  id: string
  route: string
  kind: VehicleKind
  headsign: string
  stopName: string
  siriId: string
  /** Peatus stop id, for the full timetable. Missing on Watches saved before it was added. */
  stopId?: string
  walkMin: number
}

export type Theme = 'dark' | 'light'

export interface Settings {
  watches: Watch[]
  lat: number
  lon: number
  theme: Theme
  /** When on, the theme follows the lightFrom/darkFrom schedule (HH:MM, Tallinn time) instead of `theme`. */
  autoTheme: boolean
  lightFrom: string
  darkFrom: string
}

const KEY = 'kodu-hub:settings'
const DEFAULTS: Settings = {
  watches: [],
  lat: 59.437,
  lon: 24.7536,
  theme: 'dark',
  autoTheme: false,
  lightFrom: '07:00',
  darkFrom: '21:00',
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    // ignore corrupt or unavailable storage
  }
  return structuredClone(DEFAULTS)
}

export const settings = reactive<Settings>(load())

watch(
  settings,
  (s) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      // storage unavailable: settings last for this session only
    }
  },
  { deep: true },
)
