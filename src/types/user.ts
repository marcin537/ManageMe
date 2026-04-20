export type UserRole = 'admin' | 'devops' | 'developer'

export interface User {
  id: string
  imię: string
  nazwisko: string
  rola: UserRole
}
