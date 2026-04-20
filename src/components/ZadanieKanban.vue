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
  <div class="kanban-wrapper">
    <div class="kanban-header">
      <h4>Zadania Historyjki</h4>
      <button class="btn btn-primary" @click="openCreate">+ Nowe zadanie</button>
    </div>
    
    <div v-if="loading" class="state-msg">Ładowanie zadań...</div>
    <div v-else-if="zadania.length === 0" class="state-msg">Brak przypisanych zadań do tej historyjki.</div>
    <div v-else class="kanban-board">
      <div class="kanban-col">
        <h5>Do zrobienia ({{ todo.length }})</h5>
        <div class="cards">
          <div class="card" v-for="z in todo" :key="z.id" @click="openDetails(z)">
            <strong>{{ z.nazwa }}</strong>
            <span class="badge">{{ z.priorytet }}</span>
          </div>
        </div>
      </div>
      
      <div class="kanban-col">
        <h5>W trakcie ({{ doing.length }})</h5>
        <div class="cards">
          <div class="card" v-for="z in doing" :key="z.id" @click="openDetails(z)">
            <strong>{{ z.nazwa }}</strong>
            <span class="badge">{{ z.priorytet }}</span>
          </div>
        </div>
      </div>
      
      <div class="kanban-col">
        <h5>Zamknięte ({{ done.length }})</h5>
        <div class="cards">
          <div class="card" v-for="z in done" :key="z.id" @click="openDetails(z)">
            <strong>{{ z.nazwa }}</strong>
            <span class="badge">{{ z.priorytet }}</span>
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
.kanban-wrapper {
  margin-top: 24px;
  border-top: 1px solid var(--border);
  padding-top: 24px;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kanban-header h4 {
  margin: 0;
  font-size: 18px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.state-msg {
  padding: 24px;
  text-align: center;
  color: var(--text);
  background: var(--code-bg);
  border-radius: 8px;
}

.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.kanban-col {
  flex: 1;
  min-width: 250px;
  background: var(--code-bg);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--border);
}

.kanban-col h5 {
  margin: 0;
  font-size: 14px;
  color: var(--text-h);
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card:hover {
  background: var(--accent-bg);
}

.badge {
  align-self: flex-start;
  padding: 2px 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
}
</style>
