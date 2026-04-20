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
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <header class="modal-header">
        <h3>{{ zadanie ? 'Edytuj zadanie' : 'Nowe zadanie' }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>
      <form class="form" @submit.prevent="handleSubmit">
        <div class="field">
          <label>Nazwa</label>
          <input v-model="nazwa" required />
        </div>
        <div class="field">
          <label>Opis</label>
          <textarea v-model="opis" rows="3"></textarea>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Priorytet</label>
            <select v-model="priorytet">
              <option value="niski">Niski</option>
              <option value="średni">Średni</option>
              <option value="wysoki">Wysoki</option>
            </select>
          </div>
          <div class="field">
            <label>Czas wykonania (h)</label>
            <input type="number" min="1" v-model.number="przewidywanyCzasWykonania" required />
          </div>
        </div>
        <footer class="modal-footer">
          <button type="button" class="btn" @click="close">Anuluj</button>
          <button type="submit" class="btn btn-primary">Zapisz</button>
        </footer>
      </form>
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
  max-width: 500px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
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
  cursor: pointer;
  color: var(--text);
}

.form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field-row {
  display: flex;
  gap: 16px;
}

.field label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h);
}

.field input,
.field textarea,
.field select {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--code-bg);
  color: var(--text-h);
  font: inherit;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn:not(.btn-primary) {
  background: var(--code-bg);
  border-color: var(--border);
  color: var(--text);
}
</style>
