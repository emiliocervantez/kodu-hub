import { onUnmounted, ref, shallowRef, watch, type WatchSource } from 'vue'

export const STALE_AFTER_FAILURES = 2

/**
 * Calls `load` now and every `intervalMs`. Keeps the last good data; `stale` turns on
 * after STALE_AFTER_FAILURES consecutive failures. Reloads immediately when `deps` change.
 */
export function usePolling<T>(load: () => Promise<T>, intervalMs: number, deps?: WatchSource) {
  const data = shallowRef<T>()
  const updatedAt = ref<number>()
  const failures = ref(0)
  const stale = ref(false)

  async function tick() {
    try {
      data.value = await load()
      updatedAt.value = Date.now()
      failures.value = 0
    } catch (e) {
      failures.value++
      console.warn(e)
    }
    stale.value = failures.value >= STALE_AFTER_FAILURES
  }

  tick()
  const timer = setInterval(tick, intervalMs)
  onUnmounted(() => clearInterval(timer))
  if (deps) watch(deps, () => { data.value = undefined; tick() })

  return { data, updatedAt, stale }
}
