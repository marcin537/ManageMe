<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Historyjka, Priorytet, StanHistoryjki } from '../types/historyjka'

const PRIORYTETY: { value: Priorytet; label: string }[] = [
  { value: 'niski', label: 'Niski' },
  { value: 'średni', label: 'Średni' },
  { value: 'wysoki', label: 'Wysoki' },
]

const STANY: { value: StanHistoryjki; label: string }[] = [
  { value: 'todo', label: 'Do zrobienia' },
  { value: 'doing', label: 'W trakcie' },
  { value: 'done', label: 'Zamknięte' },
]

const props = defineProps<{
  modelValue: boolean
  historyjka?: Historyjka | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { nazwa: string; opis: string; priorytet: Priorytet; stan: StanHistoryjki }): void
}>()

const nazwa = ref('')
const opis = ref('')
const priorytet = ref<Priorytet>('średni')
const stan = ref<StanHistoryjki>('todo')
const dialogRef = ref<HTMLDialogElement | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.historyjka) {
        nazwa.value = props.historyjka.nazwa
        opis.value = props.historyjka.opis
        priorytet.value = props.historyjka.priorytet
        stan.value = props.historyjka.stan
      } else {
        nazwa.value = ''
        opis.value = ''
        priorytet.value = 'średni'
        stan.value = 'todo'
      }
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
  { immediate: true }
)

const isEditing = () => !!props.historyjka

function handleSubmit() {
  if (!nazwa.value.trim()) return
  emit('submit', {
    nazwa: nazwa.value.trim(),
    opis: opis.value.trim(),
    priorytet: priorytet.value,
    stan: stan.value,
  })
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <dialog ref="dialogRef" class="custom-modal p-0" @cancel="close" @close="emit('update:modelValue', false)">
    <div class="card border-0 shadow" style="width: 100%; max-width: 500px; margin: 0 auto;">
      <div class="card-header bg-body-tertiary">
        <h5 class="mb-0 fw-bold">{{ isEditing() ? 'Edycja Historyjki' : 'Nowa Historyjka' }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="h-nazwa" class="form-label fw-medium">Nazwa <span class="text-danger">*</span></label>
            <input
              id="h-nazwa"
              v-model="nazwa"
              type="text"
              class="form-control"
              required
              placeholder="np. Dodanie koszyka"
              autocomplete="off"
            />
          </div>
          
          <div class="mb-3">
            <label for="h-opis" class="form-label fw-medium">Opis</label>
            <textarea
              id="h-opis"
              v-model="opis"
              rows="3"
              class="form-control"
              placeholder="Szczegóły historyjki..."
            />
          </div>

          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <label for="h-priorytet" class="form-label fw-medium">Priorytet</label>
              <select id="h-priorytet" v-model="priorytet" class="form-select">
                <option v-for="p in PRIORYTETY" :key="p.value" :value="p.value">
                  {{ p.label }}
                </option>
              </select>
            </div>
            <div class="col-sm-6">
              <label for="h-stan" class="form-label fw-medium">Stan początkowy</label>
              <select id="h-stan" v-model="stan" class="form-select">
                <option v-for="s in STANY" :key="s.value" :value="s.value">
                  {{ s.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="d-flex gap-2 justify-content-end mt-2">
            <button type="button" class="btn btn-outline-secondary" @click="close">Anuluj</button>
            <button type="submit" class="btn btn-primary px-4">
              {{ isEditing() ? 'Zapisz zmianę' : 'Dodaj' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.custom-modal {
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  width: 90vw;
  max-width: 500px;
}
.custom-modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
</style>
