<script setup lang="ts">
import { ref } from 'vue'
import Popover from 'primevue/popover'

/** Dialog title with an ⓘ button explaining what the rain amounts (mm) mean. */
defineProps<{ title: string; caption: string; rows: [string, string][]; note: string }>()

const info = ref<InstanceType<typeof Popover>>()
</script>

<template>
  <div class="header">
    <span class="title">{{ title }}</span>
    <button class="info" aria-label="Что значат мм" @click="info?.toggle($event)">ⓘ</button>
  </div>
  <Popover ref="info">
    <div class="legend">
      <p>{{ caption }}</p>
      <table>
        <tbody>
          <tr v-for="[mm, meaning] in rows" :key="mm">
            <td>{{ mm }}</td>
            <td>{{ meaning }}</td>
          </tr>
        </tbody>
      </table>
      <p class="muted">{{ note }}</p>
    </div>
  </Popover>
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
.muted {
  color: var(--p-text-muted-color);
}
</style>
