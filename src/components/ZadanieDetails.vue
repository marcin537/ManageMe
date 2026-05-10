<script setup lang="ts">
import { computed } from 'vue'
import type { Zadanie } from '../types/zadanie'
import { currentUserService } from '../services/currentUserService'

const props = defineProps<{
  modelValue: boolean
  zadanie: Zadanie | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'assign', userId: string): void
  (e: 'mark-done'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const availableUsers = computed(() =>
  currentUserService.getAllUsers().filter((u) => u.rola === 'devops' || u.rola === 'developer')
)

const przypisanaOsoba = computed(() => {
  if (!props.zadanie?.przypisanyUzytkownikId) return 'Nieprzypisane'
  const u = currentUserService.getAllUsers().find((x) => x.id === props.zadanie!.przypisanyUzytkownikId)
  return u ? `${u.imię} ${u.nazwisko} (${u.rola})` : 'Nieznany użytkownik'
})

function close() {
  emit('update:modelValue', false)
}

function formatDate(iso?: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function assignUser(e: Event) {
  const target = e.target as HTMLSelectElement
  if (target.value) {
    emit('assign', target.value)
  }
}
</script>

<template>
  <dialog :open="modelValue && !!zadanie" class="custom-modal p-0 m-auto position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" @cancel.prevent="close">
    <div class="modal-backdrop fade show" @click="close" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: -1;"></div>
    
    <div v-if="zadanie" class="card border-0 shadow-lg w-100" style="max-width: 650px; z-index: 10; max-height: 90vh;">
      <div class="card-header bg-body d-flex justify-content-between align-items-center border-bottom py-3 px-4">
        <h4 class="mb-0 fw-bold fs-5 text-truncate pe-3">Szczegóły: {{ zadanie.nazwa }}</h4>
        <button type="button" class="btn-close" aria-label="Zakończ przeglądanie" @click="close"></button>
      </div>
      
      <div class="card-body overflow-auto p-4">
        <div class="mb-4">
          <h6 class="text-muted fw-bold text-uppercase mb-2" style="font-size: 0.75rem;">Opis</h6>
          <p class="mb-0 font-monospace text-body-secondary bg-body-tertiary p-3 rounded border" style="white-space: pre-wrap; font-size: 0.9rem;">
            {{ zadanie.opis || 'Brak opisu dla tego zadania.' }}
          </p>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-sm-6">
            <h6 class="text-muted fw-bold text-uppercase mb-1" style="font-size: 0.7s5rem;">Status</h6>
            <div class="p-2 border rounded bg-body-tertiary">
              <span class="badge w-100 py-2 fs-6 text-uppercase" 
                    :class="{'text-bg-secondary': zadanie.stan === 'todo', 'text-bg-primary': zadanie.stan === 'doing', 'text-bg-success': zadanie.stan === 'done'}">
                {{ zadanie.stan === 'todo' ? 'Zgłoszone' : (zadanie.stan === 'doing' ? 'W trakcie' : 'Zamknięte') }}
              </span>
            </div>
          </div>
          <div class="col-sm-6">
            <h6 class="text-muted fw-bold text-uppercase mb-1" style="font-size: 0.75rem;">Priorytet</h6>
            <div class="p-2 border rounded bg-body-tertiary">
              <span class="badge w-100 py-2 fs-6 text-uppercase" 
                    :class="{'text-bg-success': zadanie.priorytet === 'niski', 'text-bg-warning': zadanie.priorytet === 'średni', 'text-bg-danger': zadanie.priorytet === 'wysoki'}">
                {{ zadanie.priorytet }}
              </span>
            </div>
          </div>
          
          <div class="col-sm-4">
            <div class="border rounded px-3 py-2 bg-body-tertiary h-100">
              <small class="text-muted d-block mb-1">Dodano</small>
              <span class="fw-medium">{{ formatDate(zadanie.dataDodania) }}</span>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="border rounded px-3 py-2 bg-body-tertiary h-100">
              <small class="text-muted d-block mb-1">Czas startu</small>
              <span class="fw-medium">{{ formatDate(zadanie.dataStartu) }}</span>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="border rounded px-3 py-2 bg-body-tertiary h-100">
              <small class="text-muted d-block mb-1">Zakończono</small>
              <span class="fw-medium">{{ formatDate(zadanie.dataZakonczenia) }}</span>
            </div>
          </div>
          
          <div class="col-12">
            <div class="border rounded px-3 py-2 bg-body-tertiary d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted d-block mb-1">Zasoby / Czas</small>
                <span class="fw-medium">Estymacja: {{ zadanie.przewidywanyCzasWykonania }} godzin</span>
              </div>
              <div class="text-end">
                <small class="text-muted d-block mb-1">Aktualnie obsługuje</small>
                <div class="d-flex align-items-center justify-content-end gap-2">
                  <span class="text-primary fs-5">👤</span> 
                  <strong class="d-block">{{ przypisanaOsoba }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-footer bg-body-tertiary p-3 d-flex flex-wrap gap-2 justify-content-between align-items-end border-top">
        <div v-if="zadanie.stan === 'todo'" class="flex-grow-1" style="max-width: 300px;">
          <label class="form-label text-muted small fw-bold mb-1">Przypisz i rozpocznij prace:</label>
          <select class="form-select border-primary" @change="assignUser">
            <option value="">Wybierz członka zespołu...</option>
            <option v-for="u in availableUsers" :key="u.id" :value="u.id">
              {{ u.imię }} {{ u.nazwisko }} ({{ u.rola }})
            </option>
          </select>
        </div>
        
        <div v-else-if="zadanie.stan === 'doing'" class="flex-grow-1">
          <button class="btn btn-success fw-bold px-4 py-2 hover-scale shadow-sm" @click="emit('mark-done')">
            ✓ Zakończ Zadanie
          </button>
        </div>
        
        <div :class="{'ms-auto': zadanie.stan !== 'todo'}" class="d-flex gap-2">
          <button class="btn btn-outline-danger" @click="emit('delete')">
            Usuń 🗑️
          </button>
          <button class="btn btn-outline-secondary" @click="emit('edit')">
            Edytuj metadane ✎
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.custom-modal {
  border: none;
  background: transparent;
}
</style>
