<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ now: Date }>()
const tz = 'Europe/Tallinn'

const time = computed(() =>
  props.now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: tz }),
)
const date = computed(() =>
  props.now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }),
)
</script>

<template>
  <div class="clock">
    <div class="time">{{ time }}</div>
    <div class="date">{{ date }}</div>
  </div>
</template>

<style scoped>
.time {
  font-size: 7em;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.date {
  font-size: 1.6em;
  color: var(--muted);
}
.date::first-letter {
  text-transform: uppercase;
}
</style>
