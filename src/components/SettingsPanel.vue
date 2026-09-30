<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import ToggleSwitch from 'primevue/toggleswitch'
import RoutePicker, { type Picked } from './RoutePicker.vue'
import { MAX_WATCHES, settings } from '../lib/settings'

const emit = defineEmits<{ close: [] }>()

const error = ref('')
const picker = ref<InstanceType<typeof RoutePicker>>()
const picked = ref<Picked>()
const walkMin = ref(5)

const THEMES = [
  { label: 'Тёмная', value: 'dark' },
  { label: 'Светлая', value: 'light' },
]

const canAdd = computed(() => !!picked.value?.stop.siriId)

function add() {
  const p = picked.value
  if (!p?.stop.siriId) return
  settings.watches.push({
    id: crypto.randomUUID(),
    route: p.route.name,
    kind: p.route.kind,
    headsign: p.direction.headsign,
    stopName: p.stop.name,
    siriId: p.stop.siriId,
    stopId: p.stop.id,
    walkMin: walkMin.value,
  })
  picker.value?.reset()
}

// "Готово" also saves a fully filled-in but not yet added Watch.
function done() {
  if (canAdd.value && settings.watches.length < MAX_WATCHES) add()
  emit('close')
}

function remove(id: string) {
  settings.watches = settings.watches.filter((w) => w.id !== id)
}

// DatePicker works with Date; settings store "HH:MM".
function toDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}
function toHHMM(d: unknown): string | undefined {
  if (!(d instanceof Date)) return undefined
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function setTime(key: 'lightFrom' | 'darkFrom', d: unknown) {
  const hhmm = toHHMM(d)
  if (hhmm) settings[key] = hhmm
}
</script>

<template>
  <Dialog
    :visible="true"
    modal
    header="Настройки"
    :draggable="false"
    :style="{ width: 'min(60rem, 95vw)' }"
    @update:visible="emit('close')"
  >
    <section>
      <h3>Маршруты <span class="count">{{ settings.watches.length }}/{{ MAX_WATCHES }}</span></h3>
      <ul class="watches">
        <li v-for="w in settings.watches" :key="w.id">
          <span class="watch-name"><b>{{ w.route }}</b> → {{ w.headsign }} · {{ w.stopName }}</span>
          <InputNumber v-model="w.walkMin" :min="0" :max="60" suffix=" мин" show-buttons input-class="walk" />
          <Button label="Удалить" severity="danger" text @click="remove(w.id)" />
        </li>
        <li v-if="settings.watches.length === 0" class="muted">Нет маршрутов</li>
      </ul>
    </section>

    <section v-if="settings.watches.length < MAX_WATCHES">
      <h3>Добавить</h3>
      <div class="grid">
        <RoutePicker ref="picker" v-model="picked" @error="error = $event" />
        <label>
          Пешком
          <InputNumber v-model="walkMin" :min="0" :max="60" suffix=" мин" show-buttons input-class="walk" />
        </label>
      </div>
      <Button label="Добавить" :disabled="!canAdd" class="add" @click="add" />
    </section>

    <section>
      <h3>Тема</h3>
      <div class="row">
        <SelectButton
          v-model="settings.theme"
          :options="THEMES"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          :disabled="settings.autoTheme"
        />
        <label class="inline"><ToggleSwitch v-model="settings.autoTheme" /> Автоматически</label>
      </div>
      <div class="row">
        <label>
          Светлая с
          <DatePicker
            :model-value="toDate(settings.lightFrom)"
            time-only
            hour-format="24"
            :disabled="!settings.autoTheme"
            input-class="time"
            @update:model-value="setTime('lightFrom', $event)"
          />
        </label>
        <label>
          Тёмная с
          <DatePicker
            :model-value="toDate(settings.darkFrom)"
            time-only
            hour-format="24"
            :disabled="!settings.autoTheme"
            input-class="time"
            @update:model-value="setTime('darkFrom', $event)"
          />
        </label>
      </div>
    </section>

    <section>
      <h3>Погода: координаты</h3>
      <div class="row">
        <label>
          Широта
          <InputNumber v-model="settings.lat" :min-fraction-digits="3" :max-fraction-digits="4" locale="en-US" :use-grouping="false" />
        </label>
        <label>
          Долгота
          <InputNumber v-model="settings.lon" :min-fraction-digits="3" :max-fraction-digits="4" locale="en-US" :use-grouping="false" />
        </label>
      </div>
    </section>

    <Message v-if="error" severity="error" class="error">{{ error }}</Message>

    <template #footer>
      <Button label="Готово" @click="done" />
    </template>
  </Dialog>
</template>

<style scoped>
section + section {
  margin-top: 1.5rem;
}
h3 {
  margin: 0 0 0.6rem;
  font-size: 1.1rem;
}
.count {
  font-weight: 400;
  color: var(--p-text-muted-color);
}
.watches {
  list-style: none;
  padding: 0;
  margin: 0;
}
.watches li {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--p-content-border-color);
}
.watch-name {
  flex: 1;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
}
.row + .row {
  margin-top: 1rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--p-text-muted-color);
}
label.inline {
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
  color: var(--p-text-color);
}
.add {
  margin-top: 1rem;
}
.muted {
  color: var(--p-text-muted-color);
}
.error {
  margin-top: 1rem;
}
:deep(.walk) {
  width: 7.5rem;
}
:deep(.time) {
  width: 6rem;
}
</style>
