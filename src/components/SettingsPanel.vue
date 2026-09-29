<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fetchDirections, fetchRoutes, type Direction, type Route } from '../lib/peatus'
import { MAX_WATCHES, settings } from '../lib/settings'

const emit = defineEmits<{ close: [] }>()

const routes = ref<Route[]>([])
const directions = ref<Direction[]>([])
const error = ref('')

const route = ref<Route>()
const direction = ref<Direction>()
const stopIndex = ref<number>()
const walkMin = ref(5)

const stop = computed(() =>
  direction.value && stopIndex.value !== undefined ? direction.value.stops[stopIndex.value] : undefined,
)
const canAdd = computed(() => !!(route.value && direction.value && stop.value?.siriId))

async function guard(fn: () => Promise<unknown>) {
  error.value = ''
  try {
    await fn()
  } catch (e) {
    error.value = `Ошибка загрузки: ${(e as Error).message}`
  }
}

onMounted(() => guard(async () => (routes.value = await fetchRoutes())))

watch(route, (r) => {
  direction.value = undefined
  directions.value = []
  if (r) guard(async () => (directions.value = await fetchDirections(r.id)))
})
watch(direction, () => (stopIndex.value = undefined))

function add() {
  if (!route.value || !direction.value || !stop.value?.siriId) return
  settings.watches.push({
    id: crypto.randomUUID(),
    route: route.value.name,
    kind: route.value.kind,
    headsign: direction.value.headsign,
    stopName: stop.value.name,
    siriId: stop.value.siriId,
    walkMin: walkMin.value,
  })
  route.value = undefined
}

function remove(id: string) {
  settings.watches = settings.watches.filter((w) => w.id !== id)
}

const KIND = { bus: 'автобус', trol: 'троллейбус', tram: 'трамвай' }
</script>

<template>
  <div class="overlay">
    <div class="panel">
      <header>
        <h2>Настройки</h2>
        <button class="close" @click="emit('close')">Готово</button>
      </header>

      <h3>Маршруты ({{ settings.watches.length }}/{{ MAX_WATCHES }})</h3>
      <ul class="watches">
        <li v-for="w in settings.watches" :key="w.id">
          <span><b>{{ w.route }}</b> → {{ w.headsign }} · {{ w.stopName }}</span>
          <label>пешком <input v-model.number="w.walkMin" type="number" min="0" max="60" /> мин</label>
          <button @click="remove(w.id)">Удалить</button>
        </li>
        <li v-if="settings.watches.length === 0" class="muted">Нет маршрутов</li>
      </ul>

      <template v-if="settings.watches.length < MAX_WATCHES">
        <h3>Добавить</h3>
        <div class="form">
          <label>
            Маршрут
            <select v-model="route">
              <option :value="undefined" disabled>—</option>
              <option v-for="r in routes" :key="r.id" :value="r">{{ r.name }} ({{ KIND[r.kind] }})</option>
            </select>
          </label>
          <label>
            Направление
            <select v-model="direction" :disabled="!directions.length">
              <option :value="undefined" disabled>—</option>
              <option v-for="d in directions" :key="d.headsign" :value="d">→ {{ d.headsign }}</option>
            </select>
          </label>
          <label>
            Остановка
            <select v-model="stopIndex" :disabled="!direction">
              <option :value="undefined" disabled>—</option>
              <option v-for="(s, i) in direction?.stops" :key="i" :value="i" :disabled="!s.siriId">
                {{ s.name }}{{ s.siriId ? '' : ' (нет данных)' }}
              </option>
            </select>
          </label>
          <label>
            Пешком, мин
            <input v-model.number="walkMin" type="number" min="0" max="60" />
          </label>
          <button :disabled="!canAdd" @click="add">Добавить</button>
        </div>
      </template>

      <h3>Погода: координаты</h3>
      <div class="form">
        <label>Широта <input v-model.number="settings.lat" type="number" step="0.001" /></label>
        <label>Долгота <input v-model.number="settings.lon" type="number" step="0.001" /></label>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 2em 1em;
}
.panel {
  background: var(--panel);
  border-radius: 12px;
  padding: 1.2em 1.6em;
  width: min(900px, 100%);
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h2,
h3 {
  margin: 0.6em 0 0.4em;
}
.watches {
  list-style: none;
  padding: 0;
  margin: 0;
}
.watches li {
  display: flex;
  gap: 1em;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.4em 0;
  border-bottom: 1px solid var(--line);
}
.watches li span {
  flex: 1;
}
.form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8em;
  align-items: flex-end;
}
.form label {
  display: flex;
  flex-direction: column;
  gap: 0.2em;
  color: var(--muted);
}
select,
input,
button {
  font: inherit;
  padding: 0.4em 0.6em;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--fg);
}
input[type='number'] {
  width: 6em;
}
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.4;
}
.muted {
  color: var(--muted);
}
.error {
  color: var(--warn);
}
</style>
