import type { Zadanie, ZadanieCreateInput } from '../types/zadanie'
import { ZADANIA_STORAGE_KEY } from './storageKey'

class ZadaniaApi {
  private storageKey = ZADANIA_STORAGE_KEY

  private getZadania(): Zadanie[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Zadanie[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private setZadania(items: Zadanie[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items))
  }

  private generateId(): string {
    return crypto.randomUUID()
  }

  async getByHistoryjka(historyjkaId: string): Promise<Zadanie[]> {
    const all = this.getZadania()
    return Promise.resolve(all.filter((z) => z.historyjkaId === historyjkaId))
  }

  async create(input: ZadanieCreateInput): Promise<Zadanie> {
    const zadanie: Zadanie = {
      ...input,
      id: this.generateId(),
      stan: 'todo',
      dataDodania: new Date().toISOString(),
      dataStartu: null,
      dataZakonczenia: null,
      przypisanyUzytkownikId: null,
    }
    const all = this.getZadania()
    all.push(zadanie)
    this.setZadania(all)
    return Promise.resolve(zadanie)
  }

  async update(
    id: string,
    updates: Partial<Omit<Zadanie, 'id' | 'dataDodania'>>
  ): Promise<Zadanie | null> {
    const all = this.getZadania()
    const index = all.findIndex((z) => z.id === id)
    if (index === -1) return Promise.resolve(null)

    all[index] = { ...all[index], ...updates }
    this.setZadania(all)
    return Promise.resolve(all[index])
  }

  async delete(id: string): Promise<boolean> {
    const all = this.getZadania()
    const filtered = all.filter((z) => z.id !== id)
    if (filtered.length === all.length) return Promise.resolve(false)
    this.setZadania(filtered)
    return Promise.resolve(true)
  }
}

export const zadaniaApi = new ZadaniaApi()
