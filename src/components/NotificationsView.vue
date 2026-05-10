<script setup lang="ts">
import { ref } from 'vue'
import { useNotifications } from '../composables/useNotifications'
import type { Notification } from '../types/notification'

const { notifications, markAsRead, markAllAsRead } = useNotifications()

const selectedNotification = ref<Notification | null>(null)

const emit = defineEmits<{
  (e: 'back'): void
}>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function handleSelect(n: Notification) {
  selectedNotification.value = n
  if (!n.isRead) {
    markAsRead(n.id)
  }
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
      <h2 class="mb-0 fs-3 d-flex align-items-center gap-2">
        <span>🔔</span> Powiadomienia
      </h2>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm" @click="markAllAsRead" :disabled="notifications.every(n => n.isRead)">
          Oznacz wszystkie jako przeczytane
        </button>
        <button class="btn btn-outline-secondary btn-sm" @click="emit('back')">
          ← Wróć
        </button>
      </div>
    </div>

    <div class="row">
      <!-- Lista Powiadomień -->
      <div class="col-md-5 col-lg-4 border-end">
        <div v-if="notifications.length === 0" class="text-center p-4 text-muted">
          Brak powiadomień.
        </div>
        <div class="list-group list-group-flush" v-else>
          <button 
            v-for="n in notifications" 
            :key="n.id"
            class="list-group-item list-group-item-action py-3 border-bottom"
            :class="{'active-item': selectedNotification?.id === n.id, 'bg-body-secondary': !n.isRead}"
            @click="handleSelect(n)"
          >
            <div class="d-flex w-100 justify-content-between align-items-center mb-1">
              <h6 class="mb-0 fw-bold text-truncate pe-2" :class="{'text-primary': !n.isRead}">
                {{ n.title }}
              </h6>
              <span class="badge" :class="{
                'bg-danger': n.priority === 'high',
                'bg-warning text-dark': n.priority === 'medium',
                'bg-info text-dark': n.priority === 'low'
              }">{{ n.priority }}</span>
            </div>
            <p class="mb-1 text-truncate text-muted small">{{ n.message }}</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <small class="text-muted" style="font-size: 0.75rem;">{{ formatDate(n.date) }}</small>
              <span v-if="!n.isRead" class="badge rounded-pill bg-primary" style="width: 8px; height: 8px; padding: 0;"></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Szczegóły Powiadomienia -->
      <div class="col-md-7 col-lg-8 p-4">
        <div v-if="selectedNotification" class="card border-0 shadow-sm">
          <div class="card-header bg-body d-flex justify-content-between align-items-center border-bottom pb-3 pt-3">
            <h4 class="mb-0 fw-bold d-flex align-items-center gap-2">
              <span v-if="selectedNotification.priority === 'high'">🚨</span>
              <span v-if="selectedNotification.priority === 'medium'">⚠️</span>
              <span v-if="selectedNotification.priority === 'low'">ℹ️</span>
              {{ selectedNotification.title }}
            </h4>
            <span class="badge" :class="{
                'bg-danger': selectedNotification.priority === 'high',
                'bg-warning text-dark': selectedNotification.priority === 'medium',
                'bg-info text-dark': selectedNotification.priority === 'low'
              }">{{ selectedNotification.priority }} priorytet</span>
          </div>
          <div class="card-body p-4">
            <div class="text-muted small mb-4 d-flex align-items-center gap-2">
              <span>🕒</span> Otrzymano: {{ formatDate(selectedNotification.date) }}
            </div>
            <p class="fs-5 bg-body-tertiary p-4 rounded border">
              {{ selectedNotification.message }}
            </p>
          </div>
        </div>
        <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-5 bg-body-tertiary rounded border border-dashed">
          <span class="fs-1 mb-3">📭</span>
          <p>Wybierz powiadomienie z listy po lewej stronie, aby zobaczyć szczegóły.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-item {
  background-color: var(--bs-primary-bg-subtle) !important;
  border-left: 4px solid var(--bs-primary) !important;
}
.border-dashed {
  border-style: dashed !important;
}
</style>
