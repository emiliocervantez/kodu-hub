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
    <div v-if="data && condition" class="row">
      <div class="now">
        <div class="main">
          <span class="icon">{{ condition[1] }}</span>
          <span class="temp">{{ Math.round(data.temperature) }}°</span>
          <span class="feels" title="ощущается как">({{ Math.round(data.feelsLike) }}°)</span>
        </div>
        <div class="desc">{{ condition[0] }}</div>
      </div>
      <div class="hours">
        <div v-for="h in data.nextHours" :key="h.time" class="hour">
          <div class="h-time">{{ h.time }}</div>
          <div class="h-temp">{{ Math.round(h.temperature) }}°</div>
          <div>💧 {{ h.probability }}%</div>
          <div class="h-mm">{{ h.mm }} мм</div>
        </div>
      </div>
    </div>
    <div v-else class="desc">…</div>
    <div v-if="stale" class="age">{{ updatedAgo(updatedAt, now) }}</div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 3vw;
}
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
.feels {
  font-size: 2.2em;
  color: var(--muted);
  align-self: flex-end;
  margin-bottom: 0.45em;
}
.desc {
  font-size: 1.4em;
}
.hours {
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: 0.5em;
  font-size: 1.2em;
}
.hour {
  text-align: center;
}
.h-temp {
  font-size: 1.3em;
  font-weight: 700;
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
