import type { User } from '../types/user'

export const MOCK_USERS: User[] = [
  { id: 'admin-1', imię: 'Jan', nazwisko: 'Kowalski', rola: 'admin' },
  { id: 'devops-1', imię: 'Adam', nazwisko: 'Nowak', rola: 'devops' },
  { id: 'dev-1', imię: 'Piotr', nazwisko: 'Zieliński', rola: 'developer' }
]

class CurrentUserService {
  private _user: User = MOCK_USERS[0]

  get user(): User {
    return this._user
  }

  get fullName(): string {
    return `${this._user.imię} ${this._user.nazwisko}`.trim()
  }

  getAllUsers(): User[] {
    return MOCK_USERS
  }
}

export const currentUserService = new CurrentUserService()
