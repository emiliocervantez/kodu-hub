<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import RainInfoHeader from './RainInfoHeader.vue'
import { describeWeather, fetchWeather, type Weather } from '../lib/weather'
import { settings } from '../lib/settings'

const emit = defineEmits<{ close: [] }>()

const hours = ref<Weather['nextHours']>()
const error = ref('')

const rainScale: [string, string][] = [
  ['<0.1', 'следы, почти незаметно'],
  ['0.1–0.5', 'слабый дождь, морось'],
  ['0.5–4', 'умеренный дождь, нужен зонт'],
  ['4–8', 'сильный дождь, лужи'],
  ['>8', 'ливень'],
]

onMounted(async () => {
  try {
    hours.value = (await fetchWeather(settings.lat, settings.lon)).nextHours
  } catch (e) {
    error.value = `Ошибка загрузки: ${(e as Error).message}`
  }
})
</script>

<template>
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    :draggable="false"
    :style="{ width: 'min(90rem, 95vw)' }"
    @update:visible="emit('close')"
  >
    <template #header>
      <RainInfoHeader
        title="Прогноз на 12 часов"
        caption="Количество осадков за час, мм:"
        :rows="rainScale"
        note="💧 % — вероятность хоть какого-то дождя (≥0.1 мм) за этот час."
      />
    </template>
    <Message v-if="error" severity="error">{{ error }}</Message>
    <p v-else-if="!hours" class="muted">Загрузка…</p>
    <div v-else class="hours">
      <div v-for="h in hours" :key="h.time" class="hour">
        <div class="name">{{ h.time }}</div>
        <div class="icon" :title="describeWeather(h.code)[0]">{{ describeWeather(h.code)[1] }}</div>
        <div class="temp">{{ Math.round(h.temperature) }}°</div>
        <div>💧 {{ h.probability }}%</div>
        <div class="muted">{{ h.mm === 0 && h.probability > 0 ? '<0.1' : h.mm }} мм</div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.hours {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.5rem;
}
.hour {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.75rem 0.25rem;
  text-align: center;
}
.name {
  font-weight: 700;
}
.icon {
  font-size: 2rem;
  line-height: 1.2;
}
.temp {
  font-size: 1.3rem;
  font-weight: 700;
}
.muted {
  color: var(--p-text-muted-color);
}
</style>
