import { reactive, watch } from 'vue'
import type { VehicleKind } from './peatus'

export const MAX_WATCHES = 4

export interface Watch {
  id: string
  route: string
  kind: VehicleKind
  headsign: string
  stopName: string
  siriId: string
  walkMin: number
}

export interface Settings {
  watches: Watch[]
  lat: number
  lon: number
}

const KEY = 'kodu-hub:settings'
const DEFAULTS: Settings = { watches: [], lat: 59.437, lon: 24.7536 }

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
