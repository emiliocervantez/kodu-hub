<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import RoutePicker, { type Picked } from './RoutePicker.vue'
import type { TimetableTarget } from '../lib/timetable'

const emit = defineEmits<{ close: []; show: [target: TimetableTarget] }>()

const picked = ref<Picked>()
const error = ref('')

function submit() {
  const p = picked.value
  if (!p) return
  emit('show', {
    route: p.route.name,
    kind: p.route.kind,
    headsign: p.direction.headsign,
    stopName: p.stop.name,
    stopId: p.stop.id,
  })
}
</script>

<template>
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    header="Расписание"
    :draggable="false"
    :style="{ width: 'min(50rem, 95vw)' }"
    @update:visible="emit('close')"
  >
    <form class="grid" @submit.prevent="submit">
      <RoutePicker v-model="picked" allow-no-live @error="error = $event" />
    </form>
    <Message v-if="error" severity="error" class="error">{{ error }}</Message>
    <template #footer>
      <Button label="Показать" :disabled="!picked" @click="submit" />
    </template>
  </Dialog>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}
.error {
  margin-top: 1rem;
}
</style>
