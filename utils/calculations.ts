import { COUNTS_PER_DECK } from '../constants/fishTypes'
import { FishSessionData, WeightEntry } from '../types'

// Calculate total kg for one fish category
export function calculateTotalKg(
  entries: WeightEntry[],
  bucketWeight: number,
  partialWeight: number | null
): number {
  let total = 0

  entries.forEach((deck) => {
    if (deck.isComplete) {
      // Full deck — 10 counts × bucket weight
      total += COUNTS_PER_DECK * bucketWeight
    } else {
      // Incomplete deck — count actual entries
      total += deck.counts.length * bucketWeight
    }
  })

  // Add partial last weight if exists
  if (partialWeight !== null && partialWeight > 0) {
    // Subtract the last bucket weight, add partial instead
    total -= bucketWeight
    total += partialWeight
  }

  return Math.max(0, total)
}

// Calculate grand total across all fish
export function calculateGrandTotal(
  fishDataList: FishSessionData[]
): number {
  return fishDataList.reduce((sum, fish) => sum + fish.totalKg, 0)
}

// Format kg for display — always show 1 decimal
export function formatKg(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

// Format currency in Indian style
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Generate unique session ID
export function generateSessionId(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TALI-${dateStr}-${random}`
}

// Generate unique bill ID
export function generateBillId(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BILL-${dateStr}-${random}`
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
