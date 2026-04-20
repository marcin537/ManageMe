<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Zadanie } from '../types/zadanie'
import { zadaniaApi } from '../api/zadaniaApi'
import { historyjkiApi } from '../api/historyjkiApi'
import ZadanieForm from './ZadanieForm.vue'
import ZadanieDetails from './ZadanieDetails.vue'
import type { Historyjka } from '../types/historyjka'

const props = defineProps<{
  historyjkaId: string
}>()

const emit = defineEmits<{
  (e: 'historyjka-updated', historyjka: Historyjka): void
}>()

const zadania = ref<Zadanie[]>([])
const loading = ref(true)

const showForm = ref(false)
const showDetails = ref(false)
const editingZadanie = ref<Zadanie | null>(null)
const selectedZadanie = ref<Zadanie | null>(null)

const todo = computed(() => zadania.value.filter((z) => z.stan === 'todo'))
const doing = computed(() => zadania.value.filter((z) => z.stan === 'doing'))
const done = computed(() => zadania.value.filter((z) => z.stan === 'done'))

watch(
  () => props.historyjkaId,
  () => load(),
  { immediate: true }
)

async function load() {
  if (!props.historyjkaId) return
  loading.value = true
  zadania.value = await zadaniaApi.getByHistoryjka(props.historyjkaId)
  loading.value = false
}

function openCreate() {
  editingZadanie.value = null
  showForm.value = true
}

function openDetails(z: Zadanie) {
  selectedZadanie.value = z
  showDetails.value = true
}

async function handleFormSubmit(data: any) {
  if (editingZadanie.value) {
    const u = await zadaniaApi.update(editingZadanie.value.id, data)
    if (u) {
      const idx = zadania.value.findIndex((x) => x.id === u.id)
      if (idx !== -1) zadania.value[idx] = u
      if (selectedZadanie.value?.id === u.id) selectedZadanie.value = u
    }
  } else {
    const created = await zadaniaApi.create({
      ...data,
      historyjkaId: props.historyjkaId,
    })
    zadania.value.push(created)
    await syncHistoryjkaStatus()
  }
}

async function assignUser(userId: string) {
  if (!selectedZadanie.value) return
  const u = await zadaniaApi.update(selectedZadanie.value.id, {
    stan: 'doing',
    przypisanyUzytkownikId: userId,
    dataStartu: new Date().toISOString(),
  })
  if (u) {
    const idx = zadania.value.findIndex((z) => z.id === u.id)
    if (idx !== -1) zadania.value[idx] = u
    selectedZadanie.value = u
    await syncHistoryjkaStatus()
  }
}

async function markDone() {
  if (!selectedZadanie.value) return
  const u = await zadaniaApi.update(selectedZadanie.value.id, {
    stan: 'done',
    dataZakonczenia: new Date().toISOString(),
  })
  if (u) {
    const idx = zadania.value.findIndex((z) => z.id === u.id)
    if (idx !== -1) zadania.value[idx] = u
    selectedZadanie.value = u
    await syncHistoryjkaStatus()
  }
}

async function syncHistoryjkaStatus() {
  const h = await historyjkiApi.getById(props.historyjkaId)
  if (!h) return

  const allTasks = await zadaniaApi.getByHistoryjka(props.historyjkaId)
  if (allTasks.length === 0) return

  const allDone = allTasks.every((z) => z.stan === 'done')
  const isAnyDoingOrDone = allTasks.some((z) => z.stan === 'doing' || z.stan === 'done')

  if (allDone && h.stan !== 'done') {
    const updated = await historyjkiApi.update(h.id, { stan: 'done' })
    if (updated) emit('historyjka-updated', updated)
  } else if (!allDone && isAnyDoingOrDone && h.stan === 'todo') {
    const updated = await historyjkiApi.update(h.id, { stan: 'doing' })
    if (updated) emit('historyjka-updated', updated)
  }
}
</script>

<template>
  <div class="mt-2 py-3 border-top">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="h5 mb-0 fw-bold d-flex align-items-center gap-2">
        <span class="text-primary fs-4">📋</span> Panel Zadań
      </h4>
      <button class="btn btn-outline-primary btn-sm shadow-sm" @click="openCreate">
        + Nowe zadanie
      </button>
    </div>
    
    <div v-if="loading" class="text-center p-4">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span class="ms-2 text-muted">Ładowanie tablicy...</span>
    </div>
    
    <div v-else-if="zadania.length === 0" class="text-center p-5 bg-body bg-opacity-50 rounded border border-dashed">
      <p class="text-muted mb-0">Brak zadań w tej historyjce.</p>
    </div>
    
    <div v-else class="kanban-container">
      <div class="row flex-nowrap pb-3" style="min-width: 800px;">
        <!-- Kolumna TODO -->
        <div class="col-4 kanban-col">
          <div class="bg-body-secondary p-3 rounded-3 h-100 border">
            <h5 class="fs-6 fw-bold text-muted mb-3 d-flex justify-content-between align-items-center pb-2 border-bottom">
              Do zrobienia
              <span class="badge bg-secondary rounded-pill">{{ todo.length }}</span>
            </h5>
            <div class="d-flex flex-column gap-2">
              <div 
                class="card border-0 shadow-sm hover-scale cursor-pointer" 
                v-for="z in todo" 
                :key="z.id" 
                @click="openDetails(z)"
                role="button"
              >
                <div class="card-body p-3">
                  <h6 class="card-title fw-bold mb-2">{{ z.nazwa }}</h6>
                  <span class="badge" :class="[z.priorytet === 'wysoki' ? 'text-bg-danger' : z.priorytet === 'średni' ? 'text-bg-warning' : 'text-bg-success']">
                    {{ z.priorytet }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Kolumna DOING -->
        <div class="col-4 kanban-col">
          <div class="bg-body-secondary p-3 rounded-3 h-100 border">
            <h5 class="fs-6 fw-bold text-primary mb-3 d-flex justify-content-between align-items-center pb-2 border-bottom border-primary border-opacity-25">
              W trakcie
              <span class="badge bg-primary rounded-pill">{{ doing.length }}</span>
            </h5>
            <div class="d-flex flex-column gap-2">
              <div 
                class="card border-0 border-start border-primary border-4 shadow-sm hover-scale cursor-pointer" 
                v-for="z in doing" 
                :key="z.id" 
                @click="openDetails(z)"
                role="button"
              >
                <div class="card-body p-3">
                  <h6 class="card-title fw-bold mb-2">{{ z.nazwa }}</h6>
                  <span class="badge" :class="[z.priorytet === 'wysoki' ? 'text-bg-danger' : z.priorytet === 'średni' ? 'text-bg-warning' : 'text-bg-success']">
                    {{ z.priorytet }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Kolumna DONE -->
        <div class="col-4 kanban-col">
          <div class="bg-body-secondary p-3 rounded-3 h-100 border">
            <h5 class="fs-6 fw-bold text-success mb-3 d-flex justify-content-between align-items-center pb-2 border-bottom border-success border-opacity-25">
              Zamknięte
              <span class="badge bg-success rounded-pill">{{ done.length }}</span>
            </h5>
            <div class="d-flex flex-column gap-2">
              <div 
                class="card border-0 custom-done shadow-sm hover-scale cursor-pointer" 
                v-for="z in done" 
                :key="z.id" 
                @click="openDetails(z)"
                role="button"
              >
                <div class="card-body p-3 text-muted">
                  <h6 class="card-title fw-bold mb-2 text-decoration-line-through">{{ z.nazwa }}</h6>
                  <span class="badge text-bg-secondary opacity-75">
                    {{ z.priorytet }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ZadanieForm
      v-model="showForm"
      :zadanie="editingZadanie"
      @submit="handleFormSubmit"
    />

    <ZadanieDetails
      v-model="showDetails"
      :zadanie="selectedZadanie"
      @assign="assignUser"
      @mark-done="markDone"
      @edit="() => { showDetails = false; editingZadanie = selectedZadanie; showForm = true }"
    />
  </div>
</template>

<style scoped>
.custom-done {
  opacity: 0.7;
}
.cursor-pointer {
  cursor: pointer;
}
.border-dashed {
  border-style: dashed !important;
}
</style>
