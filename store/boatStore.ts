import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

export type BoatStatus = 'active' | 'docked' | 'repair'

export interface LocalBoat {
  id: string
  name: string
  gujaratiName: string
  registration: string
  status: BoatStatus
  captain: string
  location: string
  lastTrip: string
  catchKg: number
  expense: number
  crew: number
}

interface BoatState {
  boats: LocalBoat[]
  isLoaded: boolean
  addBoat: (data: Omit<LocalBoat, 'id' | 'catchKg' | 'expense' | 'crew' | 'lastTrip'>) => void
  deleteBoat: (id: string) => void
  loadBoats: () => Promise<void>
}

const KEY = 'fishness_local_boats'

export const useBoatStore = create<BoatState>((set, get) => ({
  boats: [],
  isLoaded: false,

  addBoat: (data) => {
    const boat: LocalBoat = {
      id: `boat_${Date.now()}`,
      catchKg: 0,
      expense: 0,
      crew: 0,
      lastTrip: '—',
      ...data,
    }
    const boats = [...get().boats, boat]
    set({ boats })
    AsyncStorage.setItem(KEY, JSON.stringify(boats)).catch(() => {})
  },

  deleteBoat: (id) => {
    const boats = get().boats.filter(b => b.id !== id)
    set({ boats })
    AsyncStorage.setItem(KEY, JSON.stringify(boats)).catch(() => {})
  },

  loadBoats: async () => {
    try {
      const saved = await AsyncStorage.getItem(KEY)
      if (saved) set({ boats: JSON.parse(saved) })
    } catch {}
    set({ isLoaded: true })
  },
}))
