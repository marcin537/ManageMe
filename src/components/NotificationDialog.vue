<script setup lang="ts">
import { watch, ref } from 'vue'
import { useNotifications } from '../composables/useNotifications'
import type { Notification } from '../types/notification'

const { latestHighMediumNotification, clearLatestDialog, markAsRead } = useNotifications()

const isVisible = ref(false)
const currentNotification = ref<Notification | null>(null)

watch(latestHighMediumNotification, (newVal) => {
  if (newVal) {
    currentNotification.value = newVal
    isVisible.value = true
    
    // Auto hide after 5 seconds if not hovered/clicked
    setTimeout(() => {
      close()
    }, 5000)
  }
})

function close() {
  isVisible.value = false
  setTimeout(() => {
    clearLatestDialog()
  }, 300) // wait for transition
}

function handleMarkAsRead() {
  if (currentNotification.value) {
    markAsRead(currentNotification.value.id)
    close()
  }
}
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055;">
    <div 
      class="toast show fade transition-all" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
      v-if="isVisible && currentNotification"
      :class="{'border-danger': currentNotification.priority === 'high', 'border-warning': currentNotification.priority === 'medium'}"
    >
      <div class="toast-header" :class="{'bg-danger-subtle text-danger': currentNotification.priority === 'high', 'bg-warning-subtle text-warning-emphasis': currentNotification.priority === 'medium'}">
        <strong class="me-auto d-flex align-items-center gap-2">
          <span v-if="currentNotification.priority === 'high'">🚨</span>
          <span v-if="currentNotification.priority === 'medium'">⚠️</span>
          {{ currentNotification.title }}
        </strong>
        <small class="text-muted">Teraz</small>
        <button type="button" class="btn-close" @click="close" aria-label="Zamknij"></button>
      </div>
      <div class="toast-body bg-body">
        {{ currentNotification.message }}
        <div class="mt-2 pt-2 border-top d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-outline-primary" @click="handleMarkAsRead">
            Oznacz jako przeczytane
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}
</style>
