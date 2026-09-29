<script setup lang="ts">
// Route → direction → stop selects. Renders three labelled fields (no wrapper) so the parent lays them out.
import { computed, onMounted, ref, watch } from 'vue'
import Select from 'primevue/select'
import { fetchDirections, fetchRoutes, type Direction, type Route } from '../lib/peatus'

export interface Picked {
  route: Route
  direction: Direction
  stop: Direction['stops'][number]
}

const props = defineProps<{
  /** Allow stops without live (SIRI) departures, e.g. when only the timetable is needed. */
  allowNoLive?: boolean
}>()
const emit = defineEmits<{ error: [message: string] }>()
const picked = defineModel<Picked>()

const KIND = { bus: 'автобус', trol: 'троллейбус', tram: 'трамвай' }

const routes = ref<Route[]>([])
const directions = ref<Direction[]>([])
const route = ref<Route>()
const direction = ref<Direction>()
const stopIndex = ref<number>()

const routeOptions = computed(() => routes.value.map((r) => ({ ...r, label: `${r.name} · ${KIND[r.kind]}` })))
const stopOptions = computed(() =>
  (direction.value?.stops ?? []).map((s, index) => {
    const disabled = !props.allowNoLive && !s.siriId
    return { index, label: disabled ? `${s.name} (нет данных)` : s.name, disabled }
  }),
)

async function guard(fn: () => Promise<unknown>) {
  try {
    await fn()
  } catch (e) {
    emit('error', `Ошибка загрузки: ${(e as Error).message}`)
  }
}

onMounted(() => guard(async () => (routes.value = await fetchRoutes())))

watch(route, (r) => {
  direction.value = undefined
  directions.value = []
  if (r) guard(async () => (directions.value = await fetchDirections(r.id)))
})
watch(direction, () => (stopIndex.value = undefined))
watch([route, direction, stopIndex], () => {
  const stop = stopIndex.value === undefined ? undefined : direction.value?.stops[stopIndex.value]
  picked.value = route.value && direction.value && stop ? { route: route.value, direction: direction.value, stop } : undefined
})

defineExpose({ reset: () => (route.value = undefined) })
</script>

<template>
  <label>
    Маршрут
    <Select v-model="route" :options="routeOptions" option-label="label" filter placeholder="Выберите" />
  </label>
  <label>
    Направление
    <Select v-model="direction" :options="directions" option-label="headsign" :disabled="!directions.length" placeholder="—" />
  </label>
  <label>
    Остановка
    <Select
      v-model="stopIndex"
      :options="stopOptions"
      option-label="label"
      option-value="index"
      option-disabled="disabled"
      :disabled="!direction"
      filter
      placeholder="—"
    />
  </label>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--p-text-muted-color);
}
</style>
