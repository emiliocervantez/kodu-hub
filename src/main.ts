import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import './style.css'

createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      // Follow the app's own theme switch (App.vue sets data-theme on <html>).
      options: { darkModeSelector: '[data-theme="dark"]' },
    },
    locale: {
      emptyMessage: 'Нет вариантов',
      emptyFilterMessage: 'Ничего не найдено',
      searchMessage: '{0} найдено',
      emptySearchMessage: 'Ничего не найдено',
      selectionMessage: '{0} выбрано',
      emptySelectionMessage: 'Ничего не выбрано',
      am: 'AM',
      pm: 'PM',
    },
  })
  .mount('#app')
