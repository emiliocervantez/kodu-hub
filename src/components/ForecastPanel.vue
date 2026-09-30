<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { dayLabel, describeWeather, fetchDailyForecast, type DayForecast } from '../lib/weather'
import { settings } from '../lib/settings'

const emit = defineEmits<{ close: [] }>()

const days = ref<DayForecast[]>()
const error = ref('')

onMounted(async () => {
  try {
    days.value = await fetchDailyForecast(settings.lat, settings.lon)
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
    header="Прогноз на 7 дней"
    :draggable="false"
    :style="{ width: 'min(75rem, 95vw)' }"
    @update:visible="emit('close')"
  >
    <Message v-if="error" severity="error">{{ error }}</Message>
    <p v-else-if="!days" class="muted">Загрузка…</p>
    <div v-else class="days">
      <div v-for="(d, i) in days" :key="d.date" class="day">
        <div class="name">{{ dayLabel(d.date, i)[0] }}</div>
        <div class="muted">{{ dayLabel(d.date, i)[1] }}</div>
        <div class="icon">{{ describeWeather(d.code)[1] }}</div>
        <div class="label">{{ describeWeather(d.code)[0] }}</div>
        <div class="temps">
          <span class="max">{{ Math.round(d.max) }}°</span>
          <span class="muted">{{ Math.round(d.min) }}°</span>
        </div>
        <div>💧 {{ d.probability }}%</div>
        <div class="muted">{{ d.mm }} мм</div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}
.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.75rem 0.25rem;
  border-radius: 8px;
  text-align: center;
}
.day:first-child {
  background: var(--p-content-hover-background);
}
.name {
  font-weight: 700;
}
.icon {
  font-size: 2.5rem;
  line-height: 1.2;
}
.label {
  min-height: 2.6em;
  font-size: 0.9rem;
}
.temps {
  display: flex;
  gap: 0.5rem;
  font-size: 1.3rem;
}
.max {
  font-weight: 700;
}
.muted {
  color: var(--p-text-muted-color);
}
</style>
