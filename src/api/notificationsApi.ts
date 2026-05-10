import type { Notification, NotificationCreateInput } from '../types/notification'
import { NOTIFICATIONS_STORAGE_KEY } from './storageKey'

class NotificationsApi {
  private storageKey = NOTIFICATIONS_STORAGE_KEY

  private getNotifications(): Notification[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Notification[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private setNotifications(items: Notification[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items))
  }

  private generateId(): string {
    return crypto.randomUUID()
  }

  async getAll(): Promise<Notification[]> {
    return Promise.resolve(this.getNotifications())
  }

  async getByUser(userId: string): Promise<Notification[]> {
    const all = this.getNotifications()
    return Promise.resolve(all.filter((n) => n.recipientId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  async create(input: NotificationCreateInput): Promise<Notification> {
    const notification: Notification = {
      ...input,
      id: this.generateId(),
      date: new Date().toISOString(),
      isRead: false,
    }
    const all = this.getNotifications()
    all.push(notification)
    this.setNotifications(all)
    return Promise.resolve(notification)
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const all = this.getNotifications()
    const index = all.findIndex((n) => n.id === id)
    if (index === -1) return Promise.resolve(null)

    all[index].isRead = true
    this.setNotifications(all)
    return Promise.resolve(all[index])
  }

  async markAllAsRead(userId: string): Promise<void> {
    const all = this.getNotifications()
    let changed = false
    all.forEach((n) => {
      if (n.recipientId === userId && !n.isRead) {
        n.isRead = true
        changed = true
      }
    })
    if (changed) {
      this.setNotifications(all)
    }
    return Promise.resolve()
  }
}

export const notificationsApi = new NotificationsApi()
