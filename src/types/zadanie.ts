export type PriorytetZadania = 'niski' | 'średni' | 'wysoki'

export type StanZadania = 'todo' | 'doing' | 'done'

export interface Zadanie {
  id: string
  nazwa: string
  opis: string
  priorytet: PriorytetZadania
  historyjkaId: string
  przewidywanyCzasWykonania: number
  stan: StanZadania
  dataDodania: string
  dataStartu?: string | null
  dataZakonczenia?: string | null
  przypisanyUzytkownikId?: string | null
}

export type ZadanieCreateInput = Omit<
  Zadanie,
  'id' | 'stan' | 'dataDodania' | 'dataStartu' | 'dataZakonczenia' | 'przypisanyUzytkownikId'
>
