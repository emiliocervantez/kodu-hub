<script setup lang="ts">
import { ref } from 'vue'
import ClockPanel from './components/ClockPanel.vue'
import WeatherPanel from './components/WeatherPanel.vue'
import WatchRow from './components/WatchRow.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { useNow } from './lib/now'
import { settings } from './lib/settings'

const now = useNow()
const showSettings = ref(false)
</script>

<template>
  <main>
    <section class="left">
      <ClockPanel :now="now" />
      <WeatherPanel :now="now" />
    </section>
    <section class="right">
      <WatchRow v-for="w in settings.watches" :key="w.id" :watch="w" :now="now" />
      <p v-if="settings.watches.length === 0" class="empty">Добавьте маршрут в настройках ⚙</p>
    </section>
    <button class="gear" aria-label="Настройки" @click="showSettings = true">⚙</button>
    <SettingsPanel v-if="showSettings" @close="showSettings = false" />
  </main>
</template>

<style scoped>
main {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 3vw;
  height: 100vh;
  padding: 3vh 3vw;
  box-sizing: border-box;
}
.left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.right {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.empty {
  font-size: 1.5em;
  color: var(--muted);
}
.gear {
  position: fixed;
  right: 1vw;
  bottom: 1vh;
  font-size: 1.6em;
  background: none;
  border: none;
  color: var(--muted);
  opacity: 0.4;
  cursor: pointer;
}
</style>
