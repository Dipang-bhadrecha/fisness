import { create } from 'zustand'
import { COUNTS_PER_DECK } from '../constants/fishTypes'
import { FishSessionData, TaliSession } from '../types'
import { calculateTotalKg, generateSessionId } from '../utils/calculations'

interface TaliStore {
  session: TaliSession | null
  createSession: (boatName: string, companyName: string, serverSessionId?: string) => void
  addFishToSession: (fishId: string, bucketWeight: number) => void
  addCount: (fishId: string) => void
  pauseSession: (fishId: string) => void
  resumeSession: (fishId: string) => void
  setPartialWeight: (fishId: string, weight: number) => void
  setActiveFish: (fishId: string) => void
  deleteFish: (fishId: string) => void
  endSession: () => void
  clearSession: () => void
  addCustomCount: (fishId: string, weight: number) => void
}

export const useTaliStore = create<TaliStore>((set, get) => ({
  session: null,

  createSession: (boatName, companyName, serverSessionId) => {
    const session: TaliSession = {
      sessionId: generateSessionId(),
      boatName,
      companyName,
      date: new Date().toISOString(),
      fishData: [],
      activeFishId: '',
      isActive: true,
      startTime: new Date().toISOString(),
      endTime: null,
      serverSessionId: serverSessionId ?? null,
    }
    set({ session })
  },

  addFishToSession: (fishId, bucketWeight) => {
    const { session } = get()
    if (!session) return
    const alreadyExists = session.fishData.find((fd) => fd.fishId === fishId)
    if (alreadyExists) return

    const newFish: FishSessionData = {
      fishId,
      bucketWeight,
      entries: [{ deckNumber: 1, counts: [], isComplete: false }],
      currentDeck: 1,
      currentCount: 0,
      partialWeight: null,
      totalKg: 0,
      isPaused: false,
      pausedAtCount: 0,
    }

    const newFishData = [...session.fishData, newFish]
    set({
      session: {
        ...session,
        fishData: newFishData,
        activeFishId: fishId,
      },
    })
  },

  addCount: (fishId) => {
    const { session } = get()
    if (!session) return

    set({
      session: {
        ...session,
        fishData: session.fishData.map((fd) => {
          if (fd.fishId !== fishId) return fd
          if (fd.isPaused) return fd

          const bucketWeight = fd.bucketWeight
          const updatedEntries = [...fd.entries]
          const lastDeck = { ...updatedEntries[updatedEntries.length - 1] }
          updatedEntries[updatedEntries.length - 1] = lastDeck

          lastDeck.counts = [...lastDeck.counts, bucketWeight]

          if (lastDeck.counts.length >= COUNTS_PER_DECK) {
            lastDeck.isComplete = true
            updatedEntries.push({
              deckNumber: fd.currentDeck + 1,
              counts: [],
              isComplete: false,
            })
          }

          const newCurrentCount = fd.currentCount + 1
          const newTotalKg = calculateTotalKg(
            updatedEntries,
            bucketWeight,
            fd.partialWeight
          )

          return {
            ...fd,
            entries: updatedEntries,
            currentDeck: lastDeck.isComplete
              ? fd.currentDeck + 1
              : fd.currentDeck,
            currentCount: newCurrentCount,
            totalKg: newTotalKg,
          }
        }),
      },
    })
  },

  pauseSession: (fishId) => {
    const { session } = get()
    if (!session) return
    set({
      session: {
        ...session,
        fishData: session.fishData.map((fd) => {
          if (fd.fishId !== fishId) return fd
          return { ...fd, isPaused: true, pausedAtCount: fd.currentCount }
        }),
      },
    })
  },

  resumeSession: (fishId) => {
    const { session } = get()
    if (!session) return
    set({
      session: {
        ...session,
        fishData: session.fishData.map((fd) => {
          if (fd.fishId !== fishId) return fd
          return { ...fd, isPaused: false }
        }),
      },
    })
  },

  setPartialWeight: (fishId, weight) => {
    const { session } = get()
    if (!session) return
    set({
      session: {
        ...session,
        fishData: session.fishData.map((fd) => {
          if (fd.fishId !== fishId) return fd
          const newTotalKg = calculateTotalKg(
            fd.entries,
            fd.bucketWeight,
            weight
          )
          return { ...fd, partialWeight: weight, totalKg: newTotalKg }
        }),
      },
    })
  },

  setActiveFish: (fishId) => {
    const { session } = get()
    if (!session) return
    set({ session: { ...session, activeFishId: fishId } })
  },

  deleteFish: (fishId) => {
    const { session } = get()
    if (!session || session.fishData.length <= 1) return
    const newFishData = session.fishData.filter((fd) => fd.fishId !== fishId)
    const newActiveId =
      fishId === session.activeFishId
        ? newFishData[0]?.fishId ?? ''
        : session.activeFishId
    set({
      session: {
        ...session,
        fishData: newFishData,
        activeFishId: newActiveId,
      },
    })
  },

  endSession: () => {
    const { session } = get()
    if (!session) return
    set({
      session: {
        ...session,
        isActive: false,
        endTime: new Date().toISOString(),
      },
    })
  },

  addCustomCount: (fishId, weight) => {
    const { session } = get()
    if (!session) return

    set({
      session: {
        ...session,
        fishData: session.fishData.map((fd) => {
          if (fd.fishId !== fishId) return fd
          if (fd.isPaused) return fd

          const updatedEntries = [...fd.entries]
          const lastDeck = { ...updatedEntries[updatedEntries.length - 1] }
          updatedEntries[updatedEntries.length - 1] = lastDeck

          // Use custom weight instead of bucket weight
          lastDeck.counts = [...lastDeck.counts, weight]

          if (lastDeck.counts.length >= COUNTS_PER_DECK) {
            lastDeck.isComplete = true
            updatedEntries.push({
              deckNumber: fd.currentDeck + 1,
              counts: [],
              isComplete: false,
            })
          }

          const newCurrentCount = fd.currentCount + 1
          // Recalculate total from actual counts (not bucket weight formula)
          const actualTotal = updatedEntries.reduce((sum, deck) => {
            return sum + deck.counts.reduce((s, c) => s + c, 0)
          }, 0)

          return {
            ...fd,
            entries: updatedEntries,
            currentDeck: lastDeck.isComplete
              ? fd.currentDeck + 1
              : fd.currentDeck,
            currentCount: newCurrentCount,
            totalKg: actualTotal,
          }
        }),
      },
    })
  },

  clearSession: () => set({ session: null }),
}))