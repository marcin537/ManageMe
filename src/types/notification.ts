export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  title: string
  message: string
  date: string // ISOString
  priority: NotificationPriority
  isRead: boolean
  recipientId: string
}

export type NotificationCreateInput = Omit<Notification, 'id' | 'date' | 'isRead'>
