<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Project } from '../types/project'

const props = defineProps<{
  modelValue: boolean
  project?: Project | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { nazwa: string; opis: string }): void
}>()

const nazwa = ref('')
const opis = ref('')
const dialogRef = ref<HTMLDialogElement | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.project) {
        nazwa.value = props.project.nazwa
        opis.value = props.project.opis
      } else {
        nazwa.value = ''
        opis.value = ''
      }
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
  { immediate: true }
)

const isEditing = () => !!props.project

function handleSubmit() {
  if (!nazwa.value.trim()) return
  emit('submit', { nazwa: nazwa.value.trim(), opis: opis.value.trim() })
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
        <h5 class="mb-0 fw-bold">{{ isEditing() ? 'Edytowanie Projektu' : 'Tworzenie Nowego Projektu' }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="nazwa" class="form-label fw-medium">Tytuł projektu <span class="text-danger">*</span></label>
            <input
              id="nazwa"
              v-model="nazwa"
              type="text"
              class="form-control"
              required
              placeholder="np. Aplikacja Kanban..."
              autocomplete="off"
            />
          </div>
          
          <div class="mb-4">
            <label for="opis" class="form-label fw-medium">Szczegóły / Opis</label>
            <textarea
              id="opis"
              v-model="opis"
              rows="4"
              class="form-control"
              placeholder="Zanotuj krótki opis ułatwiający rozpoznanie celu..."
            />
          </div>

          <div class="d-flex gap-2 justify-content-end">
            <button type="button" class="btn btn-outline-secondary" @click="close">Anuluj</button>
            <button type="submit" class="btn btn-primary px-4">
              {{ isEditing() ? 'Zapisz dane' : 'Dodaj projekt' }}
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
