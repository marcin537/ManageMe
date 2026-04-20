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
  <div v-if="modelValue && zadanie" class="modal-overlay" @click.self="close">
    <div class="modal">
      <header class="modal-header">
        <h3>Szczegóły Zadania</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>
      <div class="modal-body">
        <div class="detail-row">
          <strong>Nazwa:</strong> {{ zadanie.nazwa }}
        </div>
        <div class="detail-row">
          <strong>Opis:</strong>
          <p class="desc">{{ zadanie.opis || 'Brak opisu.' }}</p>
        </div>
        <div class="grid">
          <div class="detail-row">
            <strong>Priorytet:</strong> <span class="badge">{{ zadanie.priorytet }}</span>
          </div>
          <div class="detail-row">
            <strong>Stan:</strong> <span class="badge">{{ zadanie.stan }}</span>
          </div>
          <div class="detail-row">
            <strong>Czas wykonania:</strong> {{ zadanie.przewidywanyCzasWykonania }} h
          </div>
          <div class="detail-row">
            <strong>Przypisana osoba:</strong> {{ przypisanaOsoba }}
          </div>
          <div class="detail-row">
            <strong>Data dodania:</strong> {{ formatDate(zadanie.dataDodania) }}
          </div>
          <div class="detail-row">
            <strong>Data startu:</strong> {{ formatDate(zadanie.dataStartu) }}
          </div>
          <div class="detail-row">
            <strong>Data zakończenia:</strong> {{ formatDate(zadanie.dataZakonczenia) }}
          </div>
        </div>

        <div class="actions-box">
          <div class="action-item" v-if="zadanie.stan === 'todo'">
            <label>Przypisz do zadania (rozpocznij)</label>
            <select @change="assignUser">
              <option value="">Wybierz osobę...</option>
              <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ u.imię }} {{ u.nazwisko }} ({{ u.rola }})
              </option>
            </select>
          </div>
          
          <div class="action-item" v-if="zadanie.stan === 'doing'">
            <button class="btn btn-success" @click="emit('mark-done')">Zakończ zadanie (Done)</button>
          </div>
          
          <div class="action-item right">
            <button class="btn" @click="emit('edit')">Edytuj dane</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal {
  background: var(--bg);
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text);
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: var(--code-bg);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.desc {
  margin: 0;
  white-space: pre-wrap;
  color: var(--text-h);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.actions-box {
  border-top: 1px solid var(--border);
  padding-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.action-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.right {
  margin-left: auto;
}

select {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--code-bg);
  color: var(--text-h);
  font: inherit;
  min-width: 200px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--code-bg);
  border-color: var(--border);
  color: var(--text);
}

.btn-success {
  background: #16a34a;
  color: white;
  border: none;
}
</style>
