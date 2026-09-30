// Builds src/data/siriIds.json: Tallinn stop code (e.g. "18305-1") → SIRI stop id.
// Peatus stop ids don't always equal SIRI ids, and stops.txt has no CORS, so we bundle the map.
import { writeFileSync } from 'node:fs'

const res = await fetch('https://transport.tallinn.ee/data/stops.txt')
if (!res.ok) throw new Error(`stops.txt: HTTP ${res.status}`)
const lines = (await res.text()).replace(/^﻿/, '').split(/\r?\n/).slice(1)

const map = {}
for (const line of lines) {
  const [code, siriId] = line.split(';')
  if (code && siriId) map[code] = siriId
}

writeFileSync(new URL('../src/data/siriIds.json', import.meta.url), JSON.stringify(map) + '\n')
console.log(`siriIds.json: ${Object.keys(map).length} stops`)
