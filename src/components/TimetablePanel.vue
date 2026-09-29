<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { fetchStopTimes, findStopId } from '../lib/peatus'
import { groupByHour, serviceDates, type HourRow, type TimetableTarget } from '../lib/timetable'

const props = defineProps<{ watch: TimetableTarget }>()
const emit = defineEmits<{ close: [] }>()

const columns = ref<{ title: string; rows: HourRow[] }[]>()
const error = ref('')

onMounted(async () => {
  try {
    const w = props.watch
    // Remember the looked-up id on the Watch (it lives in the persisted settings).
    w.stopId ??= await findStopId(w.route, w.kind, w.headsign, w.stopName)
    if (!w.stopId) throw new Error('остановка не найдена')

    const dates = serviceDates(new Date())
    const [workday, saturday, sunday] = await Promise.all(
      [dates.workday, dates.saturday, dates.sunday].map((d) => fetchStopTimes(w.stopId!, w.route, d)),
    )
    const same = saturday.length === sunday.length && saturday.every((s, i) => s === sunday[i])
    columns.value = [
      { title: 'Будни', rows: groupByHour(workday) },
      ...(same
        ? [{ title: 'Выходные', rows: groupByHour(saturday) }]
        : [
            { title: 'Суббота', rows: groupByHour(saturday) },
            { title: 'Воскресенье', rows: groupByHour(sunday) },
          ]),
    ]
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
    :style="{ width: 'min(70rem, 95vw)' }"
    @update:visible="emit('close')"
  >
    <template #header>
      <div class="title">
        <b>{{ watch.route }}</b> → {{ watch.headsign }}
        <span class="stop">{{ watch.stopName }}</span>
      </div>
    </template>

    <Message v-if="error" severity="error">{{ error }}</Message>
    <p v-else-if="!columns" class="muted">Загрузка…</p>
    <div v-else class="columns">
      <section v-for="c in columns" :key="c.title">
        <h3>{{ c.title }}</h3>
        <p v-if="c.rows.length === 0" class="muted">Нет рейсов</p>
        <table v-else>
          <tr v-for="r in c.rows" :key="r.hour">
            <th>{{ r.hour }}</th>
            <td>
              <span v-for="(m, i) in r.minutes" :key="i">{{ m }}</span>
            </td>
          </tr>
        </table>
      </section>
    </div>
  </Dialog>
</template>

<style scoped>
.title {
  font-size: 1.3rem;
}
.stop {
  margin-left: 0.6rem;
  color: var(--p-text-muted-color);
  font-size: 1rem;
}
.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 2rem;
}
h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-variant-numeric: tabular-nums;
}
tr + tr {
  border-top: 1px solid var(--p-content-border-color);
}
th {
  width: 2.5rem;
  padding: 0.25rem 0.75rem 0.25rem 0;
  text-align: right;
  vertical-align: top;
}
td {
  padding: 0.25rem 0;
}
td span {
  display: inline-block;
  min-width: 2.2rem;
}
.muted {
  color: var(--p-text-muted-color);
}
</style>
