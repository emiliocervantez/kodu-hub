<script setup lang="ts">
import { computed } from 'vue'
import { fetchSiri } from '../lib/siri'
import { formatDeparture, reachableMinutes } from '../lib/departures'
import { updatedAgo } from '../lib/now'
import { usePolling } from '../lib/usePolling'
import type { Watch } from '../lib/settings'

const props = defineProps<{ watch: Watch; now: Date }>()

const ICONS = { bus: '🚌', trol: '🚎', tram: '🚋' }

const { data, updatedAt, stale } = usePolling(
  () => fetchSiri(props.watch.siriId),
  30_000,
  () => props.watch.siriId,
)

const times = computed(() => {
  if (!data.value || updatedAt.value === undefined) return undefined
  const elapsedSec = (props.now.getTime() - updatedAt.value) / 1000
  return reachableMinutes(data.value.departures, props.watch.route, props.watch.walkMin, elapsedSec).map(
    (m) => formatDeparture(m, props.now),
  )
})
</script>

<template>
  <div class="watch" :class="{ stale }">
    <div class="route">
      <span class="icon">{{ ICONS[watch.kind] }}</span>{{ watch.route }}
    </div>
    <div class="where">
      <div class="headsign">→ {{ watch.headsign }}</div>
      <div class="stop">{{ watch.stopName }} · {{ watch.walkMin }} мин пешком</div>
    </div>
    <div class="times">
      <template v-if="times === undefined">…</template>
      <template v-else-if="times.length === 0"><span class="none">нет рейсов</span></template>
      <span v-for="(t, i) in times" v-else :key="i" :class="{ first: i === 0 }">{{ t }}</span>
    </div>
    <div v-if="stale" class="age">{{ updatedAgo(updatedAt, now) }}</div>
  </div>
</template>

<style scoped>
.watch {
  display: grid;
  grid-template-columns: 6.5em 1fr auto;
  align-items: center;
  gap: 0 0.8em;
  padding: 0.5em 0;
  border-bottom: 1px solid var(--line);
}
.route {
  font-size: 2.2em;
  font-weight: 700;
  white-space: nowrap;
}
.icon {
  font-size: 0.7em;
  margin-right: 0.2em;
}
.headsign {
  font-size: 1.3em;
}
.stop {
  color: var(--muted);
}
.times {
  display: flex;
  gap: 0.7em;
  font-size: 1.6em;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}
.times .first {
  color: var(--fg);
  font-weight: 700;
}
.none {
  font-size: 0.7em;
}
.age {
  grid-column: 1 / -1;
  color: var(--warn);
}
.stale .route,
.stale .where,
.stale .times {
  opacity: 0.4;
}
</style>
