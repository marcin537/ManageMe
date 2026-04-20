<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Zadanie, PriorytetZadania } from '../types/zadanie'

const props = defineProps<{
  modelValue: boolean
  zadanie: Zadanie | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (
    e: 'submit',
    data: {
      nazwa: string
      opis: string
      priorytet: PriorytetZadania
      przewidywanyCzasWykonania: number
    }
  ): void
}>()

const nazwa = ref('')
const opis = ref('')
const priorytet = ref<PriorytetZadania>('średni')
const przewidywanyCzasWykonania = ref<number>(1)

watch(
  () => props.modelValue,
  (show) => {
    if (show) {
      if (props.zadanie) {
        nazwa.value = props.zadanie.nazwa
        opis.value = props.zadanie.opis
        priorytet.value = props.zadanie.priorytet
        przewidywanyCzasWykonania.value = props.zadanie.przewidywanyCzasWykonania
      } else {
        nazwa.value = ''
        opis.value = ''
        priorytet.value = 'średni'
        przewidywanyCzasWykonania.value = 1
      }
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  emit('submit', {
    nazwa: nazwa.value,
    opis: opis.value,
    priorytet: priorytet.value,
    przewidywanyCzasWykonania: przewidywanyCzasWykonania.value,
  })
  close()
}
</script>

<template>
  <dialog :open="modelValue" class="custom-modal p-0 m-auto position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" @cancel.prevent="close">
    <div class="modal-backdrop fade show" @click="close" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: -1;"></div>
    
    <div class="card border-0 shadow-lg w-100" style="max-width: 500px; z-index: 10;">
      <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
        <h5 class="mb-0 fw-bold">{{ zadanie ? 'Edycja Specyfikacji Zadania' : 'Nowe Zadanie w Kanban' }}</h5>
        <button type="button" class="btn-close" aria-label="Anuluj" @click="close"></button>
      </div>
      
      <div class="card-body p-4">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label class="form-label fw-medium text-muted small text-uppercase">Tytuł Zgłoszenia <span class="text-danger">*</span></label>
            <input v-model="nazwa" type="text" class="form-control form-control-lg fs-6" placeholder="Krótka i zwięzła nazwa..." required />
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-medium text-muted small text-uppercase">Pełny Opis</label>
            <textarea v-model="opis" class="form-control" rows="3" placeholder="Dodatkowe informacje i kryteria akceptacji..."></textarea>
          </div>
          
          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <label class="form-label fw-medium text-muted small text-uppercase">Priorytet Zgłoszenia</label>
              <select v-model="priorytet" class="form-select">
                <option value="niski">Niski (Trivial)</option>
                <option value="średni">Średni (Normal)</option>
                <option value="wysoki">Wysoki (Critical)</option>
              </select>
            </div>
            <div class="col-sm-6">
              <label class="form-label fw-medium text-muted small text-uppercase">Złożoność (w godzinach)</label>
              <input type="number" min="1" v-model.number="przewidywanyCzasWykonania" class="form-control" required />
            </div>
          </div>
          
          <div class="d-flex justify-content-end gap-2 border-top pt-3 mt-2">
            <button type="button" class="btn btn-outline-secondary" @click="close">Anuluj operację</button>
            <button type="submit" class="btn btn-primary px-4 fw-bold">Zapisz zadanie</button>
          </div>
        </form>
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
