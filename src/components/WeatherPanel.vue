<script setup lang="ts">
import { computed } from 'vue'
import { describeWeather, fetchWeather } from '../lib/weather'
import { updatedAgo } from '../lib/now'
import { usePolling } from '../lib/usePolling'
import { settings } from '../lib/settings'

defineProps<{ now: Date }>()

const { data, updatedAt, stale } = usePolling(
  () => fetchWeather(settings.lat, settings.lon),
  15 * 60_000,
  () => [settings.lat, settings.lon],
)

const condition = computed(() => (data.value ? describeWeather(data.value.code) : undefined))
</script>

<template>
  <div class="weather" :class="{ stale }">
    <template v-if="data && condition">
      <div class="main">
        <span class="icon">{{ condition[1] }}</span>
        <span class="temp">{{ Math.round(data.temperature) }}°</span>
      </div>
      <div class="desc">{{ condition[0] }}, ощущается как {{ Math.round(data.feelsLike) }}°</div>
      <div class="hours">
        <div v-for="h in data.nextHours" :key="h.time" class="hour">
          <div class="h-time">{{ h.time }}</div>
          <div>💧 {{ h.probability }}%</div>
          <div class="h-mm">{{ h.mm }} мм</div>
        </div>
      </div>
    </template>
    <div v-else class="desc">…</div>
    <div v-if="stale" class="age">{{ updatedAgo(updatedAt, now) }}</div>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.icon {
  font-size: 3.5em;
}
.temp {
  font-size: 4.5em;
  font-weight: 700;
}
.desc {
  font-size: 1.4em;
}
.hours {
  display: flex;
  gap: 1.5em;
  margin-top: 0.8em;
  font-size: 1.2em;
}
.h-time,
.h-mm {
  color: var(--muted);
}
.age {
  color: var(--warn);
  margin-top: 0.5em;
}
.stale > :not(.age) {
  opacity: 0.4;
}
</style>
