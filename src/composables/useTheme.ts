import { ref, onMounted, watch } from 'vue'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>('light')

  function initTheme() {
    const saved = localStorage.getItem('taskflow_theme') as Theme | null
    if (saved && (saved === 'light' || saved === 'dark')) {
      theme.value = saved
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(theme, (newTheme) => {
    localStorage.setItem('taskflow_theme', newTheme)
    document.documentElement.setAttribute('data-bs-theme', newTheme)
  })

  onMounted(() => {
    initTheme()
    document.documentElement.setAttribute('data-bs-theme', theme.value)
  })

  return {
    theme,
    toggleTheme,
  }
}
