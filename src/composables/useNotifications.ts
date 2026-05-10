import { ref, computed } from 'vue'
import { notificationsApi } from '../api/notificationsApi'
import type { Notification, NotificationCreateInput } from '../types/notification'
import { currentUserService } from '../services/currentUserService'

const notifications = ref<Notification[]>([])
const latestHighMediumNotification = ref<Notification | null>(null)

export function useNotifications() {
  const userId = currentUserService.user.id

  async function load() {
    notifications.value = await notificationsApi.getByUser(userId)
  }

  const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length)

  async function addNotification(input: NotificationCreateInput) {
    const created = await notificationsApi.create(input)
    if (input.recipientId === userId) {
      notifications.value = [created, ...notifications.value]
      if (created.priority === 'high' || created.priority === 'medium') {
        latestHighMediumNotification.value = created
      }
    }
  }

  async function markAsRead(id: string) {
    const updated = await notificationsApi.markAsRead(id)
    if (updated) {
      const idx = notifications.value.findIndex(n => n.id === id)
      if (idx !== -1) {
        notifications.value[idx] = updated
      }
    }
  }

  async function markAllAsRead() {
    await notificationsApi.markAllAsRead(userId)
    await load()
  }

  function clearLatestDialog() {
    latestHighMediumNotification.value = null
  }

  return {
    notifications,
    unreadCount,
    latestHighMediumNotification,
    load,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearLatestDialog
  }
}
