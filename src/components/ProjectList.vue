<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Project } from '../types/project'
import { projectsApi } from '../api/projectsApi'
import ProjectForm from './ProjectForm.vue'

const projects = ref<Project[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingProject = ref<Project | null>(null)

onMounted(loadProjects)

async function loadProjects() {
  loading.value = true
  try {
    projects.value = await projectsApi.getAll()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingProject.value = null
  showForm.value = true
}

function openEdit(project: Project) {
  editingProject.value = project
  showForm.value = true
}

async function handleSubmit(data: { nazwa: string; opis: string }) {
  try {
    if (editingProject.value) {
      const updated = await projectsApi.update(editingProject.value.id, data)
      if (updated) {
        const i = projects.value.findIndex((p) => p.id === updated.id)
        if (i !== -1) projects.value[i] = updated
      }
    } else {
      const created = await projectsApi.create(data)
      projects.value.push(created)
    }
  } catch (e) {
    console.error('Błąd zapisu:', e)
  }
}

async function remove(project: Project) {
  if (!confirm(`Czy na pewno usunąć projekt „${project.nazwa}"?`)) return
  const ok = await projectsApi.delete(project.id)
  if (ok) {
    projects.value = projects.value.filter((p) => p.id !== project.id)
  }
}
</script>

<template>
  <div class="container py-3" style="max-width: 800px;">
    <header class="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4">
      <div>
        <h1 class="h2 fw-bold mb-1">Katalog Projektów</h1>
        <p class="text-muted mb-0">Zarządzanie zadaniami i archiwum.</p>
      </div>
      <button class="btn btn-primary shadow-sm hover-scale" @click="openCreate">
        + Nowy projekt
      </button>
    </header>

    <div v-if="loading" class="d-flex justify-content-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-5 text-muted border rounded bg-body-tertiary">
      <p class="lead mb-0">Brak utworzonych projektów.</p>
      <small>Kliknij <strong>"Nowy projekt"</strong> aby rozpocząć rejestrację.</small>
    </div>

    <div v-else class="row g-3">
      <div class="col-12" v-for="p in projects" :key="p.id">
        <div class="card h-100 shadow-sm hover-scale border-0">
          <div class="card-body d-flex flex-column flex-sm-row justify-content-between align-items-start gap-4">
            <div class="text-break">
              <h4 class="card-title h5 fw-semibold mb-2 text-primary">{{ p.nazwa }}</h4>
              <p v-if="p.opis" class="card-text text-muted small mb-0">{{ p.opis }}</p>
            </div>
            
            <div class="btn-group shadow-sm shrink-0">
              <button class="btn btn-outline-secondary" title="Edytuj projekt" @click="openEdit(p)">
                ✎ Edytuj
              </button>
              <button class="btn btn-outline-danger" title="Wymaż projekt z systemu" @click="remove(p)">
                ✕ Usuń
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProjectForm
      v-model="showForm"
      :project="editingProject"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.shrink-0 {
  flex-shrink: 0;
}
</style>
