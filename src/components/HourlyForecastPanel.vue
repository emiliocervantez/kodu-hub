<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Popover from 'primevue/popover'
import { describeWeather, fetchWeather, type Weather } from '../lib/weather'
import { settings } from '../lib/settings'

const emit = defineEmits<{ close: [] }>()

const hours = ref<Weather['nextHours']>()
const error = ref('')
const info = ref<InstanceType<typeof Popover>>()

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
      <div class="header">
        <span class="title">Прогноз на 12 часов</span>
        <button class="info" aria-label="Что значат мм" @click="info?.toggle($event)">ⓘ</button>
      </div>
    </template>
    <Popover ref="info">
      <div class="legend">
        <p>Количество осадков за час, мм:</p>
        <table>
          <tbody>
            <tr><td>&lt;0.1</td><td>следы, почти незаметно</td></tr>
            <tr><td>0.1–0.5</td><td>слабый дождь, морось</td></tr>
            <tr><td>0.5–4</td><td>умеренный дождь, нужен зонт</td></tr>
            <tr><td>4–8</td><td>сильный дождь, лужи</td></tr>
            <tr><td>&gt;8</td><td>ливень</td></tr>
          </tbody>
        </table>
        <p class="muted">💧 % — вероятность хоть какого-то дождя (≥0.1 мм) за этот час.</p>
      </div>
    </Popover>
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
.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.title {
  font-size: 1.25rem;
  font-weight: 600;
}
.info {
  font-size: 1.4rem;
  background: none;
  border: none;
  color: var(--p-text-muted-color);
  cursor: pointer;
}
.legend p {
  margin: 0 0 0.5rem;
}
.legend td {
  padding: 0.15rem 0.75rem 0.15rem 0;
}
.legend td:first-child {
  font-weight: 700;
  white-space: nowrap;
}
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
