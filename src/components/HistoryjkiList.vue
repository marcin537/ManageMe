<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Historyjka, StanHistoryjki } from '../types/historyjka'
import { historyjkiApi } from '../api/historyjkiApi'
import { currentUserService } from '../services/currentUserService'
import HistoryjkaForm from './HistoryjkaForm.vue'
import ZadanieKanban from './ZadanieKanban.vue'

const props = defineProps<{
  projectId: string
}>()

const historyjki = ref<Historyjka[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingHistoryjka = ref<Historyjka | null>(null)
const filterStan = ref<StanHistoryjki | 'all'>('all')

const activeHistoryjkaKanban = ref<string | null>(null)

const STANY: { value: StanHistoryjki | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'todo', label: 'Do zrobienia' },
  { value: 'doing', label: 'W trakcie' },
  { value: 'done', label: 'Zamknięte' },
]

const filteredHistoryjki = computed(() => {
  const list = historyjki.value
  if (filterStan.value === 'all') return list
  return list.filter((h) => h.stan === filterStan.value)
})

const todo = computed(() => historyjki.value.filter((h) => h.stan === 'todo'))
const doing = computed(() => historyjki.value.filter((h) => h.stan === 'doing'))
const done = computed(() => historyjki.value.filter((h) => h.stan === 'done'))

watch(
  () => props.projectId,
  () => loadHistoryjki(),
  { immediate: true }
)

onMounted(loadHistoryjki)

async function loadHistoryjki() {
  if (!props.projectId) {
    historyjki.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    historyjki.value = await historyjkiApi.getByProject(props.projectId)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingHistoryjka.value = null
  showForm.value = true
}

function openEdit(h: Historyjka) {
  editingHistoryjka.value = h
  showForm.value = true
}

async function handleSubmit(data: {
  nazwa: string
  opis: string
  priorytet: Historyjka['priorytet']
  stan: StanHistoryjki
}) {
  try {
    if (editingHistoryjka.value) {
      const updated = await historyjkiApi.update(editingHistoryjka.value.id, data)
      if (updated) {
        const i = historyjki.value.findIndex((h) => h.id === updated.id)
        if (i !== -1) historyjki.value[i] = updated
      }
    } else {
      const created = await historyjkiApi.create({
        ...data,
        projekt: props.projectId,
        właściciel: currentUserService.user.id,
      })
      historyjki.value.push(created)
    }
  } catch (e) {
    console.error('Błąd zapisu:', e)
  }
}

async function remove(h: Historyjka) {
  if (!confirm(`Usunąć historyjkę „${h.nazwa}"?`)) return
  const ok = await historyjkiApi.delete(h.id)
  if (ok) {
    historyjki.value = historyjki.value.filter((x) => x.id !== h.id)
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function bPriorityClass(p: string) {
  const map: Record<string, string> = {
    niski: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25',
    średni: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25',
    wysoki: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25',
  }
  return map[p] ?? 'bg-secondary bg-opacity-10 text-secondary'
}
function priorytetLabel(p: string) {
  const map: Record<string, string> = { niski: 'Niski', średni: 'Średni', wysoki: 'Wysoki' }
  return map[p] ?? p
}

function toggleKanban(id: string) {
  if (activeHistoryjkaKanban.value === id) activeHistoryjkaKanban.value = null
  else activeHistoryjkaKanban.value = id
}

function onHistoryjkaUpdated(updated: Historyjka) {
  const i = historyjki.value.findIndex(h => h.id === updated.id)
  if (i !== -1) historyjki.value[i] = updated
}
</script>

<template>
  <div class="container py-2" style="max-width: 1000px;">
    <header class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-bottom pb-3 gap-3">
      <h2 class="m-0 fw-bold fs-4">Rejestr Historyjek</h2>
      <div class="d-flex align-items-center gap-2">
        <select v-model="filterStan" class="form-select form-select-sm" style="width: auto;">
          <option v-for="s in STANY" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
        <button class="btn btn-primary btn-sm px-3 shadow-sm" @click="openCreate">
          + Dodaj
        </button>
      </div>
    </header>

    <div v-if="loading" class="d-flex justify-content-center p-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="!projectId" class="text-center py-5 text-muted bg-body-tertiary rounded border">
      <p class="mb-0">Wybierz projekt w nagłówku, aby zarządzać historyjkami.</p>
    </div>

    <div v-else-if="filteredHistoryjki.length === 0" class="text-center py-5 text-muted bg-body-tertiary rounded border">
      <p class="mb-0">Brak historyjek w tym widoku.</p>
      <small>Zmień filtr lub utwórz nową historyjkę.</small>
    </div>

    <div v-else class="d-flex flex-column gap-4">
      <template v-if="filterStan === 'all'">
        <!-- Do zrobienia -->
        <section v-if="todo.length">
          <h3 class="fs-6 fw-bold text-uppercase text-secondary mb-3 d-flex align-items-center gap-2">
            <span class="bg-secondary rounded-circle d-inline-block" style="width: 8px; height: 8px;"></span>
            Do zrobienia
          </h3>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li v-for="h in todo" :key="h.id" class="card shadow-sm border-0">
              <div class="card-body p-3 p-md-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="badge" :class="bPriorityClass(h.priorytet)">{{ priorytetLabel(h.priorytet) }}</span>
                      <small class="text-muted">{{ formatDate(h.dataUtworzenia) }}</small>
                    </div>
                    <h4 class="card-title h5 fw-semibold">{{ h.nazwa }}</h4>
                    <p v-if="h.opis" class="card-text text-muted mb-0" style="white-space: pre-wrap;">{{ h.opis }}</p>
                  </div>
                  <div class="btn-group flex-shrink-0">
                    <button class="btn btn-outline-secondary btn-sm" title="Zadania (Kanban)" @click="toggleKanban(h.id)">
                      📋 Zadania
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" title="Edytuj" @click="openEdit(h)">✎</button>
                    <button class="btn btn-outline-danger btn-sm" title="Usuń" @click="remove(h)">✕</button>
                  </div>
                </div>
              </div>
              <div class="card-footer bg-body-tertiary border-top p-0 border-0" v-if="activeHistoryjkaKanban === h.id">
                <div class="p-3 p-md-4">
                  <ZadanieKanban :historyjka-id="h.id" @historyjka-updated="onHistoryjkaUpdated" />
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- W trakcie -->
        <section v-if="doing.length">
          <h3 class="fs-6 fw-bold text-uppercase text-primary mb-3 d-flex align-items-center gap-2 mt-4">
            <span class="bg-primary rounded-circle d-inline-block" style="width: 8px; height: 8px;"></span>
            W trakcie
          </h3>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li v-for="h in doing" :key="h.id" class="card shadow-sm border-0 border-start border-primary border-4">
              <div class="card-body p-3 p-md-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="badge" :class="bPriorityClass(h.priorytet)">{{ priorytetLabel(h.priorytet) }}</span>
                      <small class="text-muted">{{ formatDate(h.dataUtworzenia) }}</small>
                    </div>
                    <h4 class="card-title h5 fw-semibold">{{ h.nazwa }}</h4>
                    <p v-if="h.opis" class="card-text text-muted mb-0" style="white-space: pre-wrap;">{{ h.opis }}</p>
                  </div>
                  <div class="btn-group flex-shrink-0">
                    <button class="btn btn-outline-secondary btn-sm" title="Zadania (Kanban)" @click="toggleKanban(h.id)">📋 Zadania</button>
                    <button class="btn btn-outline-secondary btn-sm" title="Edytuj" @click="openEdit(h)">✎</button>
                    <button class="btn btn-outline-danger btn-sm" title="Usuń" @click="remove(h)">✕</button>
                  </div>
                </div>
              </div>
              <div class="card-footer bg-body-tertiary border-top p-0 border-0" v-if="activeHistoryjkaKanban === h.id">
                <div class="p-3 p-md-4">
                  <ZadanieKanban :historyjka-id="h.id" @historyjka-updated="onHistoryjkaUpdated" />
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- Zamknięte -->
        <section v-if="done.length">
          <h3 class="fs-6 fw-bold text-uppercase text-success mb-3 d-flex align-items-center gap-2 mt-4">
            <span class="bg-success rounded-circle d-inline-block" style="width: 8px; height: 8px;"></span>
            Zamknięte
          </h3>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li v-for="h in done" :key="h.id" class="card shadow-sm border-0 opacity-75">
              <div class="card-body p-3 p-md-4 text-muted">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="badge bg-secondary text-white">{{ priorytetLabel(h.priorytet) }}</span>
                      <small>{{ formatDate(h.dataUtworzenia) }}</small>
                    </div>
                    <h4 class="card-title h5 fw-semibold text-decoration-line-through">{{ h.nazwa }}</h4>
                    <p v-if="h.opis" class="card-text mb-0" style="white-space: pre-wrap;">{{ h.opis }}</p>
                  </div>
                  <div class="btn-group flex-shrink-0">
                    <button class="btn btn-outline-secondary btn-sm" title="Zadania (Kanban)" @click="toggleKanban(h.id)">📋 Zadania</button>
                    <button class="btn btn-outline-secondary btn-sm" title="Edytuj" @click="openEdit(h)">✎</button>
                    <button class="btn btn-outline-danger btn-sm" title="Usuń" @click="remove(h)">✕</button>
                  </div>
                </div>
              </div>
              <div class="card-footer bg-body-tertiary border-top p-0 border-0" v-if="activeHistoryjkaKanban === h.id">
                <div class="p-3 p-md-4 opacity-100">
                  <ZadanieKanban :historyjka-id="h.id" @historyjka-updated="onHistoryjkaUpdated" />
                </div>
              </div>
            </li>
          </ul>
        </section>
      </template>

      <!-- Widok filtrowany -->
      <section v-else>
        <ul class="list-unstyled d-flex flex-column gap-3">
          <li v-for="h in filteredHistoryjki" :key="h.id" class="card shadow-sm border-0">
            <div class="card-body p-3 p-md-4">
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="badge" :class="bPriorityClass(h.priorytet)">{{ priorytetLabel(h.priorytet) }}</span>
                    <small class="text-muted">{{ formatDate(h.dataUtworzenia) }}</small>
                  </div>
                  <h4 class="card-title h5 fw-semibold">{{ h.nazwa }}</h4>
                  <p v-if="h.opis" class="card-text text-muted mb-0" style="white-space: pre-wrap;">{{ h.opis }}</p>
                </div>
                <div class="btn-group flex-shrink-0">
                  <button class="btn btn-outline-secondary btn-sm" title="Zadania (Kanban)" @click="toggleKanban(h.id)">📋 Zadania</button>
                  <button class="btn btn-outline-secondary btn-sm" title="Edytuj" @click="openEdit(h)">✎</button>
                  <button class="btn btn-outline-danger btn-sm" title="Usuń" @click="remove(h)">✕</button>
                </div>
              </div>
            </div>
            <div class="card-footer bg-body-tertiary border-top p-0 border-0" v-if="activeHistoryjkaKanban === h.id">
              <div class="p-3 p-md-4">
                <ZadanieKanban :historyjka-id="h.id" @historyjka-updated="onHistoryjkaUpdated" />
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <HistoryjkaForm
      v-model="showForm"
      :historyjka="editingHistoryjka"
      @submit="handleSubmit"
    />
  </div>
</template>
