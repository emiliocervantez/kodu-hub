import { onUnmounted, ref } from 'vue'

/** Current time, updated every second. */
export function useNow() {
  const now = ref(new Date())
  const timer = setInterval(() => (now.value = new Date()), 1000)
  onUnmounted(() => clearInterval(timer))
  return now
}

/** "обновлено N мин назад" */
export function updatedAgo(updatedAt: number | undefined, now: Date): string {
  if (updatedAt === undefined) return 'нет данных'
  return `обновлено ${Math.floor((now.getTime() - updatedAt) / 60_000)} мин назад`
}
