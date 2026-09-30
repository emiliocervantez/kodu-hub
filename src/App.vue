<script setup lang="ts">
import { defineAsyncComponent, ref, watchEffect } from 'vue'
import ClockPanel from './components/ClockPanel.vue'
import WeatherPanel from './components/WeatherPanel.vue'
import WatchRow from './components/WatchRow.vue'
import { useNow } from './lib/now'
import { settings } from './lib/settings'
import { scheduledTheme } from './lib/theme'
import type { TimetableTarget } from './lib/timetable'

// Loaded on first open: keeps PrimeVue's components out of the always-on dashboard bundle.
const SettingsPanel = defineAsyncComponent(() => import('./components/SettingsPanel.vue'))
const TimetablePanel = defineAsyncComponent(() => import('./components/TimetablePanel.vue'))
const SearchPanel = defineAsyncComponent(() => import('./components/SearchPanel.vue'))
const ForecastPanel = defineAsyncComponent(() => import('./components/ForecastPanel.vue'))

const now = useNow()
const showSettings = ref(false)
const showSearch = ref(false)
const showForecast = ref(false)
const timetableFor = ref<TimetableTarget>()

function showTimetable(target: TimetableTarget) {
  showSearch.value = false
  timetableFor.value = target
}

watchEffect(
  () =>
    (document.documentElement.dataset.theme = settings.autoTheme
      ? scheduledTheme(now.value, settings.lightFrom, settings.darkFrom)
      : settings.theme),
)
</script>

<template>
  <main>
    <ClockPanel :now="now" />
    <section class="right">
      <WatchRow v-for="w in settings.watches" :key="w.id" :watch="w" :now="now" @click="timetableFor = w" />
      <p v-if="settings.watches.length === 0" class="empty">Добавьте маршрут в настройках ⚙</p>
    </section>
    <WeatherPanel class="bottom" :now="now" @click="showForecast = true" />
    <div class="corner">
      <button aria-label="Расписание" @click="showSearch = true">
        <svg viewBox="0 0 24 24" width="0.85em" height="0.85em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <circle cx="10.5" cy="10.5" r="7" />
          <path d="M16 16l6 6" />
        </svg>
      </button>
      <button aria-label="Настройки" @click="showSettings = true">⚙</button>
    </div>
    <SettingsPanel v-if="showSettings" @close="showSettings = false" />
    <SearchPanel v-if="showSearch" @close="showSearch = false" @show="showTimetable" />
    <TimetablePanel v-if="timetableFor" :watch="timetableFor" @close="timetableFor = undefined" />
    <ForecastPanel v-if="showForecast" @close="showForecast = false" />
  </main>
</template>

<style scoped>
main {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
  gap: 3vh 3vw;
  height: 100vh;
  padding: 3vh 3vw;
  box-sizing: border-box;
}
.bottom {
  grid-column: 1 / -1;
  cursor: pointer;
}
.right {
  display: flex;
  flex-direction: column;
  /* keep clear of the fixed search and settings icons in the top-right corner */
  padding-right: 5em;
}
.empty {
  font-size: 1.5em;
  color: var(--muted);
}
.corner {
  position: fixed;
  right: 1vw;
  top: 1vh;
  display: flex;
  align-items: center;
  gap: 0.2em;
}
.corner button {
  display: flex;
  font-size: 1.6em;
  padding: 0.1em 0.2em;
  background: none;
  border: none;
  color: var(--muted);
  opacity: 0.4;
  cursor: pointer;
}
</style>
