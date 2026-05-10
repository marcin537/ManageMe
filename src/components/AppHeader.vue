<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { currentUserService } from '../services/currentUserService'
import { useActiveProject } from '../composables/useActiveProject'
import { projectsApi } from '../api/projectsApi'
import type { Project } from '../types/project'
import { useTheme } from '../composables/useTheme'
import { useNotifications } from '../composables/useNotifications'

const { activeProjectId, setActiveProject, initActiveProject } = useActiveProject()
const { theme, toggleTheme } = useTheme()
const { unreadCount } = useNotifications()

const emit = defineEmits<{
  (e: 'manage-projects'): void
  (e: 'show-notifications'): void
}>()
const projects = ref<Project[]>([])
const showProjectsDropdown = ref(false)

onMounted(async () => {
  await initActiveProject()
  projects.value = await projectsApi.getAll()
})

const activeProject = computed(() => {
  if (!activeProjectId.value) return null
  return projects.value.find((p) => p.id === activeProjectId.value) ?? null
})

const userFullName = currentUserService.fullName

async function toggleDropdown() {
  if (!showProjectsDropdown.value) {
    projects.value = await projectsApi.getAll()
  }
  showProjectsDropdown.value = !showProjectsDropdown.value
}

function selectProject(id: string | null) {
  setActiveProject(id)
  showProjectsDropdown.value = false
}

const selectorRef = ref<HTMLElement | null>(null)
let closeHandler: ((e: MouseEvent) => void) | null = null
watch(showProjectsDropdown, async (open) => {
  if (closeHandler) {
    document.removeEventListener('click', closeHandler)
    closeHandler = null
  }
  if (!open) return
  await nextTick()
  closeHandler = (e: MouseEvent) => {
    if (selectorRef.value && !selectorRef.value.contains(e.target as Node)) {
      showProjectsDropdown.value = false
    }
  }
  setTimeout(() => document.addEventListener('click', closeHandler!), 0)
})
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom shadow-sm">
    <div class="container-fluid px-4 py-1">
      <a class="navbar-brand fw-bold text-primary" href="#">TaskFlow</a>

      <div class="d-flex w-100 justify-content-center position-absolute start-0 pointer-events-none" style="pointer-events: none;">
        <div ref="selectorRef" class="position-relative" style="pointer-events: auto;">
          <button
            class="btn btn-outline-secondary dropdown-toggle"
            type="button"
            @click="toggleDropdown"
            style="min-width: 250px;"
          >
            {{ activeProject?.nazwa ?? 'Wybierz aktywny projekt' }}
          </button>
          
          <ul v-if="showProjectsDropdown" class="dropdown-menu show position-absolute w-100 mt-1 shadow">
            <li>
              <button
                v-if="activeProject"
                class="dropdown-item text-muted"
                @click="selectProject(null)"
              >
                — Brak projektu —
              </button>
            </li>
            <li v-for="p in projects" :key="p.id">
              <button
                class="dropdown-item"
                :class="{ active: p.id === activeProjectId }"
                @click="selectProject(p.id)"
              >
                {{ p.nazwa }}
              </button>
            </li>
            <li v-if="projects.length === 0">
              <span class="dropdown-item-text text-muted">Brak projektów</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="ms-auto d-flex align-items-center gap-3" style="z-index: 10;">
        <button class="btn btn-link text-decoration-none-hover text-body" @click="emit('manage-projects')">
          Zarządzaj Projektami
        </button>
        
        <button class="btn btn-outline-secondary position-relative d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px;" @click="emit('show-notifications')" title="Powiadomienia">
          <span>🔔</span>
          <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
            <span class="visually-hidden">nieprzeczytanych powiadomień</span>
          </span>
        </button>
        
        <span class="navbar-text fw-medium text-body-emphasis ms-2">
          {{ userFullName }}
        </span>
        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px;" @click="toggleTheme" title="Zmień motyw">
          <span v-if="theme === 'light'">🌙</span>
          <span v-else>☀️</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dropdown-menu.show {
  display: block;
}
</style>
