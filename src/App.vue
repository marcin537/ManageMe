<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ProjectList from './components/ProjectList.vue'
import HistoryjkiList from './components/HistoryjkiList.vue'
import { useActiveProject } from './composables/useActiveProject'

const { activeProjectId, initActiveProject } = useActiveProject()
const showProjectsManager = ref(false)

initActiveProject()

const showEmptyState = computed(
  () => !showProjectsManager.value && !activeProjectId.value
)
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader @manage-projects="showProjectsManager = true" />
    
    <main class="flex-grow-1 py-4 container-fluid px-4 px-lg-5">
      <div v-if="showProjectsManager">
        <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
          <h2 class="mb-0 fs-3">Moje Projekty</h2>
          <button class="btn btn-outline-secondary btn-sm" @click="showProjectsManager = false">
            ← Powrót do tablic
          </button>
        </div>
        <ProjectList />
      </div>
      
      <div v-else-if="showEmptyState" class="d-flex justify-content-center mt-5">
        <div class="card shadow-sm text-center p-5" style="max-width: 500px;">
          <h3 class="card-title fw-bold">Witaj w TaskFlow</h3>
          <p class="card-text text-muted mb-4">
            Wybierz istniejący projekt z paska na górze lub przejdź do panelu zarządzania projektami, aby utworzyć nowy.
          </p>
          <button class="btn btn-primary btn-lg w-100 hover-scale" @click="showProjectsManager = true">
            Skonfiguruj projekty
          </button>
        </div>
      </div>
      
      <div v-else>
        <HistoryjkiList v-if="activeProjectId" :project-id="activeProjectId" />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Dodatkowe czyszczenie po starym app vue znajduje się w style.css */
</style>
