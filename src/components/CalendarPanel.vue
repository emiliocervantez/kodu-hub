<script setup lang="ts">
import { computed, ref } from 'vue'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import { holidayOn, holidays } from '../lib/holidays'

const emit = defineEmits<{ close: [] }>()

// Selecting a day has no meaning here; the model just keeps today highlighted.
const today = new Date()

// Month on screen (1–12), to list its holidays below the calendar.
const shown = ref({ year: today.getFullYear(), month: today.getMonth() + 1 })

const monthHolidays = computed(() =>
  [...holidays(shown.value.year)]
    .filter(([date]) => Number(date.slice(5, 7)) === shown.value.month)
    .map(([date, name]) => ({ day: Number(date.slice(8)), name })),
)
</script>

<template>
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    header="Календарь"
    :draggable="false"
    @update:visible="emit('close')"
  >
    <!-- PrimeVue reports month-change as 1–12 but year-change as 0–11. -->
    <DatePicker
      :model-value="today"
      inline
      class="calendar"
      @month-change="shown = { year: $event.year, month: $event.month }"
      @year-change="shown = { year: $event.year, month: $event.month + 1 }"
    >
      <template #date="{ date }">
        <span
          v-if="holidayOn(date.year, date.month + 1, date.day)"
          class="holiday"
          :title="holidayOn(date.year, date.month + 1, date.day)"
          >{{ date.day }}</span
        >
        <template v-else>{{ date.day }}</template>
      </template>
    </DatePicker>
    <ul v-if="monthHolidays.length" class="holidays">
      <li v-for="h in monthHolidays" :key="h.day">
        <span class="holiday-day">{{ h.day }}</span> {{ h.name }}
      </li>
    </ul>
  </Dialog>
</template>

<style scoped>
.calendar {
  font-size: 1.15rem;
}
.calendar :deep(.p-datepicker-select-month),
.calendar :deep(.p-datepicker-select-year) {
  font-size: 1.5rem;
  font-weight: 700;
}
.holiday,
.holiday-day {
  color: var(--p-red-500);
  font-weight: 700;
}
.holidays {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  max-width: 22rem;
}
.holidays li + li {
  margin-top: 0.3rem;
}
.holiday-day {
  display: inline-block;
  min-width: 1.8rem;
}
</style>
