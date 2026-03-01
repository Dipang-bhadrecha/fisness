export interface FishCategory {
  id: string
  name: string
  nameGujarati: string
  bucketWeight: number
}

export interface WeightEntry {
  deckNumber: number
  counts: number[]
  isComplete: boolean
}

export interface FishSessionData {
  fishId: string
  bucketWeight: number
  entries: WeightEntry[]
  currentDeck: number
  currentCount: number
  partialWeight: number | null
  totalKg: number
  isPaused: boolean
  pausedAtCount: number
}

export interface TaliSession {
  sessionId: string
  boatName: string
  companyName: string
  date: string
  fishData: FishSessionData[]
  activeFishId: string
  isActive: boolean
  startTime: string
  endTime: string | null
}

export interface BillLineItem {
  fishId: string
  fishName: string
  fishNameGujarati: string
  totalKg: number
  pricePerKg: number
  totalAmount: number
}

export interface Bill {
  billId: string
  sessionId: string
  boatName: string
  companyName: string
  date: string
  items: BillLineItem[]
  grandTotalKg: number
  grandTotalAmount: number
}